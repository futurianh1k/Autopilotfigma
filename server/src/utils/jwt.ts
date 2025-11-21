/**
 * JWT 토큰 유틸리티
 * 
 * @library jsonwebtoken (v9.0.2)
 * @reference https://www.npmjs.com/package/jsonwebtoken
 * @license MIT
 * 
 * @description JWT 토큰 생성, 검증, 리프레시 기능
 */

import jwt from 'jsonwebtoken';

// JWT 페이로드 타입
export interface JwtPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

// JWT 설정 (환경 변수에서 로드)
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Access Token 생성
 * 
 * @param userId - 사용자 ID
 * @param email - 사용자 이메일
 * @returns Access Token
 */
export function generateAccessToken(userId: string, email: string): string {
  const payload: JwtPayload = {
    userId,
    email,
    type: 'access',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'landing-page-backend',
    audience: 'landing-page-frontend',
  });
}

/**
 * Refresh Token 생성
 * 
 * @param userId - 사용자 ID
 * @param email - 사용자 이메일
 * @returns Refresh Token
 */
export function generateRefreshToken(userId: string, email: string): string {
  const payload: JwtPayload = {
    userId,
    email,
    type: 'refresh',
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'landing-page-backend',
    audience: 'landing-page-frontend',
  });
}

/**
 * Access Token 검증
 * 
 * @param token - 검증할 Access Token
 * @returns 검증된 페이로드
 * @throws 토큰이 유효하지 않으면 에러 발생
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'landing-page-backend',
      audience: 'landing-page-frontend',
    }) as JwtPayload;

    if (decoded.type !== 'access') {
      throw new Error('잘못된 토큰 타입');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('토큰이 만료되었습니다');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('유효하지 않은 토큰입니다');
    }
    throw error;
  }
}

/**
 * Refresh Token 검증
 * 
 * @param token - 검증할 Refresh Token
 * @returns 검증된 페이로드
 * @throws 토큰이 유효하지 않으면 에러 발생
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'landing-page-backend',
      audience: 'landing-page-frontend',
    }) as JwtPayload;

    if (decoded.type !== 'refresh') {
      throw new Error('잘못된 토큰 타입');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('리프레시 토큰이 만료되었습니다');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('유효하지 않은 리프레시 토큰입니다');
    }
    throw error;
  }
}

/**
 * 토큰 디코딩 (검증 없이)
 * 
 * @param token - 디코딩할 토큰
 * @returns 디코딩된 페이로드 (검증되지 않음)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * 토큰 만료 시간 확인
 * 
 * @param token - 확인할 토큰
 * @returns 만료 시간 (Unix timestamp) 또는 null
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    return decoded?.exp || null;
  } catch {
    return null;
  }
}

/**
 * 토큰이 곧 만료되는지 확인
 * 
 * @param token - 확인할 토큰
 * @param thresholdSeconds - 임계값 (초) - 이 시간 이내에 만료되면 true
 * @returns 곧 만료 여부
 */
export function isTokenExpiringSoon(token: string, thresholdSeconds: number = 300): boolean {
  const exp = getTokenExpiration(token);
  if (!exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return exp - now <= thresholdSeconds;
}
