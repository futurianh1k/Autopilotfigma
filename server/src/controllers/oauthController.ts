/**
 * OAuth 컨트롤러
 */

import { Request, Response, NextFunction } from 'express';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import prisma from '../config/database';

/**
 * OAuth 콜백 성공 핸들러
 */
export async function oauthCallback(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'OAuth 인증 실패',
      });
      return;
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
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        expiresAt,
      },
    });

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { provider: user.provider },
      },
    });

    // 프론트엔드로 리다이렉트 (토큰 전달)
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  } catch (error) {
    console.error('OAuth 콜백 오류:', error);
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/error?message=OAuth 인증 실패`);
  }
}

/**
 * OAuth 실패 핸들러
 */
export function oauthFailure(req: Request, res: Response): void {
  const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/auth/error?message=OAuth 인증 실패`);
}
