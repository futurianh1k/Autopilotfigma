/**
 * 인증 서비스
 * 
 * @description 회원가입, 로그인, 2FA 등 인증 관련 비즈니스 로직
 */

import prisma from '../config/database';
import { hashPassword, comparePassword, encrypt, decrypt, generateToken } from '../utils/encryption';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { 
  initializeTwoFactor, 
  verifyTwoFactorToken, 
  generateBackupCodes 
} from '../utils/twoFactor';
import { hashApiKey } from '../utils/encryption';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-32chars';

/**
 * 이메일 회원가입
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name?: string
) {
  // 이메일 중복 확인
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('이미 사용 중인 이메일입니다');
  }

  // 비밀번호 해싱
  const passwordHash = await hashPassword(password);

  // 이메일 인증 토큰 생성
  const verificationToken = generateToken();

  // 사용자 생성
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      provider: 'EMAIL',
      verificationToken,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // 감사 로그 기록
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'REGISTER',
      status: 'SUCCESS',
      metadata: { provider: 'EMAIL' },
    },
  });

  return {
    user,
    verificationToken, // 실제로는 이메일로 전송해야 함
  };
}

/**
 * 이메일 로그인
 */
export async function loginWithEmail(
  email: string,
  password: string,
  twoFactorCode?: string,
  ipAddress?: string,
  userAgent?: string
) {
  // 사용자 조회
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  // 계정 잠금 확인
  if (user.isLocked) {
    throw new Error('계정이 잠겼습니다. 관리자에게 문의하세요');
  }

  // 비밀번호 검증
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    // 로그인 실패 횟수 증가
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: user.failedLoginAttempts + 1,
        isLocked: user.failedLoginAttempts + 1 >= 5, // 5회 실패 시 잠금
      },
    });

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        metadata: { reason: 'INVALID_PASSWORD' },
      },
    });

    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  // 2FA 확인
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    if (!twoFactorCode) {
      return {
        requires2FA: true,
        userId: user.id,
      };
    }

    // 2FA 시크릿 복호화
    const decryptedSecret = decrypt(user.twoFactorSecret, ENCRYPTION_KEY);

    // 2FA 코드 검증
    const is2FAValid = verifyTwoFactorToken(twoFactorCode, decryptedSecret);
    if (!is2FAValid) {
      // 감사 로그
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          status: 'FAILURE',
          ipAddress,
          userAgent,
          metadata: { reason: '2FA_INVALID' },
        },
      });

      throw new Error('2단계 인증 코드가 올바르지 않습니다');
    }
  }

  // JWT 토큰 생성
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, user.email);

  // 세션 생성
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

  await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  // 로그인 성공 처리
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lastLoginAt: new Date(),
    },
  });

  // 감사 로그
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * 2FA 초기화 (QR 코드 생성)
 */
export async function initiate2FA(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다');
  }

  if (user.twoFactorEnabled) {
    throw new Error('이미 2단계 인증이 활성화되어 있습니다');
  }

  // 2FA 시크릿 및 QR 코드 생성
  const { secret, qrCode, otpAuthUrl } = await initializeTwoFactor(user.email);

  // 시크릿 암호화하여 임시 저장 (아직 활성화 안 함)
  const encryptedSecret = encrypt(secret, ENCRYPTION_KEY);

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: encryptedSecret,
    },
  });

  return {
    qrCode,
    otpAuthUrl,
    secret, // 앱에 수동 입력 시 필요
  };
}

/**
 * 2FA 활성화
 */
export async function enable2FA(userId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.twoFactorSecret) {
    throw new Error('2단계 인증 초기화를 먼저 진행해주세요');
  }

  // 시크릿 복호화
  const decryptedSecret = decrypt(user.twoFactorSecret, ENCRYPTION_KEY);

  // 토큰 검증
  const isValid = verifyTwoFactorToken(token, decryptedSecret);
  if (!isValid) {
    throw new Error('인증 코드가 올바르지 않습니다');
  }

  // 백업 코드 생성
  const backupCodes = generateBackupCodes(10);
  
  // 백업 코드 해싱 및 저장
  const backupCodeRecords = backupCodes.map(code => ({
    userId,
    codeHash: hashApiKey(code), // 해싱하여 저장
  }));

  await prisma.twoFactorBackupCode.createMany({
    data: backupCodeRecords,
  });

  // 2FA 활성화
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
    },
  });

  // 감사 로그
  await prisma.auditLog.create({
    data: {
      userId,
      action: '2FA_ENABLED',
      status: 'SUCCESS',
    },
  });

  return {
    success: true,
    backupCodes, // 사용자에게 안전하게 보관하도록 안내
  };
}

/**
 * 2FA 비활성화
 */
export async function disable2FA(userId: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.passwordHash) {
    throw new Error('사용자를 찾을 수 없습니다');
  }

  // 비밀번호 확인
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('비밀번호가 올바르지 않습니다');
  }

  // 2FA 비활성화
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  // 백업 코드 삭제
  await prisma.twoFactorBackupCode.deleteMany({
    where: { userId },
  });

  // 감사 로그
  await prisma.auditLog.create({
    data: {
      userId,
      action: '2FA_DISABLED',
      status: 'SUCCESS',
    },
  });

  return { success: true };
}

/**
 * 로그아웃
 */
export async function logout(userId: string, token: string) {
  // 세션 무효화
  await prisma.session.updateMany({
    where: {
      userId,
      token,
    },
    data: {
      isRevoked: true,
    },
  });

  // 감사 로그
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'LOGOUT',
      status: 'SUCCESS',
    },
  });

  return { success: true };
}
