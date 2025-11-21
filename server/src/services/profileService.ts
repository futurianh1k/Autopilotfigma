/**
 * 프로필 관리 서비스
 * 
 * @description 사용자 프로필 CRUD 및 개인정보 관리
 */

import prisma from '../config/database';
import { encrypt, decrypt, comparePassword, hashPassword } from '../utils/encryption';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-32chars';

/**
 * 프로필 조회
 */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      profileImage: true,
      provider: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: true,
      lastLoginAt: true,
      profile: {
        select: {
          phoneNumber: true,
          address: true,
          dateOfBirth: true,
          bio: true,
          website: true,
          timezone: true,
          language: true,
          emailNotifications: true,
          smsNotifications: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다');
  }

  // 민감한 정보 복호화
  if (user.profile) {
    const profile = user.profile;
    return {
      ...user,
      profile: {
        ...profile,
        phoneNumber: profile.phoneNumber ? decrypt(profile.phoneNumber, ENCRYPTION_KEY) : null,
        address: profile.address ? decrypt(profile.address, ENCRYPTION_KEY) : null,
        dateOfBirth: profile.dateOfBirth ? decrypt(profile.dateOfBirth, ENCRYPTION_KEY) : null,
      },
    };
  }

  return user;
}

/**
 * 프로필 업데이트
 */
export async function updateProfile(userId: string, data: any) {
  const {
    name,
    phoneNumber,
    address,
    dateOfBirth,
    bio,
    website,
    timezone,
    language,
  } = data;

  // 기본 사용자 정보 업데이트
  if (name !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { name },
    });
  }

  // 프로필 정보 암호화 및 업데이트
  const profileData: any = {};

  if (phoneNumber !== undefined) {
    profileData.phoneNumber = encrypt(phoneNumber, ENCRYPTION_KEY);
  }
  if (address !== undefined) {
    profileData.address = encrypt(address, ENCRYPTION_KEY);
  }
  if (dateOfBirth !== undefined) {
    profileData.dateOfBirth = encrypt(dateOfBirth, ENCRYPTION_KEY);
  }
  if (bio !== undefined) profileData.bio = bio;
  if (website !== undefined) profileData.website = website;
  if (timezone !== undefined) profileData.timezone = timezone;
  if (language !== undefined) profileData.language = language;

  // Upsert 프로필
  await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...profileData,
    },
    update: profileData,
  });

  // 감사 로그
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'PROFILE_UPDATE',
      status: 'SUCCESS',
    },
  });

  return await getProfile(userId);
}

/**
 * 비밀번호 변경
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.passwordHash) {
    throw new Error('사용자를 찾을 수 없거나 비밀번호가 설정되지 않았습니다');
  }

  // 현재 비밀번호 확인
  const isValid = await comparePassword(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error('현재 비밀번호가 올바르지 않습니다');
  }

  // 새 비밀번호 해싱
  const newPasswordHash = await hashPassword(newPassword);

  // 비밀번호 업데이트
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  // 모든 세션 무효화 (보안)
  await prisma.session.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });

  // 감사 로그
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'PASSWORD_CHANGE',
      status: 'SUCCESS',
    },
  });

  return { success: true };
}

/**
 * 계정 삭제
 */
export async function deleteAccount(userId: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다');
  }

  // 비밀번호 확인 (OAuth 사용자는 비밀번호가 없을 수 있음)
  if (user.passwordHash) {
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('비밀번호가 올바르지 않습니다');
    }
  }

  // 감사 로그 (삭제 전)
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'ACCOUNT_DELETE',
      status: 'SUCCESS',
    },
  });

  // 계정 삭제 (Cascade로 관련 데이터 모두 삭제)
  await prisma.user.delete({
    where: { id: userId },
  });

  return { success: true };
}
