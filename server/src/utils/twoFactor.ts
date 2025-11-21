/**
 * 2FA (Two-Factor Authentication) 유틸리티
 * 
 * @library otplib (v12.0.1)
 * @library qrcode (v1.5.4)
 * @reference https://www.npmjs.com/package/otplib
 * @reference https://www.npmjs.com/package/qrcode
 * @license MIT
 * 
 * @description TOTP (Time-based One-Time Password) 기반 2FA 구현
 */

import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// TOTP 설정
authenticator.options = {
  step: 30, // 30초마다 코드 갱신
  window: 1, // ±1 타임스텝 허용 (30초 전후 코드도 허용)
};

/**
 * 2FA 시크릿 생성
 * 
 * @returns Base32로 인코딩된 시크릿
 */
export function generateTwoFactorSecret(): string {
  return authenticator.generateSecret();
}

/**
 * OTP Auth URL 생성 (QR 코드용)
 * 
 * @param email - 사용자 이메일
 * @param secret - 2FA 시크릿
 * @param issuer - 서비스 이름
 * @returns OTP Auth URL
 */
export function generateOtpAuthUrl(
  email: string,
  secret: string,
  issuer: string = 'Landing Page'
): string {
  return authenticator.keyuri(email, issuer, secret);
}

/**
 * QR 코드 생성 (Data URL)
 * 
 * @param otpAuthUrl - OTP Auth URL
 * @returns QR 코드 Data URL (base64)
 */
export async function generateQRCode(otpAuthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpAuthUrl);
  } catch (error) {
    throw new Error(
      `QR 코드 생성 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * 2FA 설정 초기화 (시크릿 + QR 코드 생성)
 * 
 * @param email - 사용자 이메일
 * @param issuer - 서비스 이름
 * @returns 시크릿과 QR 코드 Data URL
 */
export async function initializeTwoFactor(
  email: string,
  issuer: string = 'Landing Page'
): Promise<{ secret: string; qrCode: string; otpAuthUrl: string }> {
  const secret = generateTwoFactorSecret();
  const otpAuthUrl = generateOtpAuthUrl(email, secret, issuer);
  const qrCode = await generateQRCode(otpAuthUrl);

  return {
    secret,
    qrCode,
    otpAuthUrl,
  };
}

/**
 * TOTP 코드 검증
 * 
 * @param token - 사용자가 입력한 6자리 코드
 * @param secret - 저장된 2FA 시크릿
 * @returns 검증 성공 여부
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('2FA 토큰 검증 오류:', error);
    return false;
  }
}

/**
 * 현재 TOTP 코드 생성 (테스트/개발용)
 * 
 * @param secret - 2FA 시크릿
 * @returns 현재 시점의 6자리 코드
 */
export function generateTwoFactorToken(secret: string): string {
  return authenticator.generate(secret);
}

/**
 * 백업 코드 생성 (8자리 랜덤 코드 10개)
 * 
 * @returns 백업 코드 배열
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // 8자리 숫자 생성
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    codes.push(code);
  }
  
  return codes;
}

/**
 * 토큰 남은 시간 (초)
 * 
 * @returns 현재 토큰이 유효한 남은 시간 (초)
 */
export function getTimeRemaining(): number {
  const step = authenticator.options.step || 30;
  const now = Math.floor(Date.now() / 1000);
  return step - (now % step);
}

/**
 * 2FA 코드 포맷 검증
 * 
 * @param token - 검증할 코드
 * @returns 포맷 유효성 (6자리 숫자인지)
 */
export function isValidTwoFactorFormat(token: string): boolean {
  return /^\d{6}$/.test(token);
}
