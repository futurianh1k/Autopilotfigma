/**
 * 인증 미들웨어
 * 
 * @description JWT 토큰 검증 및 사용자 인증 처리
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../config/database';

// Request 타입 확장 (사용자 정보 추가)
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

/**
 * JWT 인증 미들웨어
 * Authorization 헤더의 Bearer 토큰을 검증
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Authorization 헤더 확인
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다',
      });
      return;
    }

    // Bearer 토큰 추출
    const token = authHeader.substring(7);

    // 토큰 검증
    const payload = verifyAccessToken(token);

    // 세션 확인 (토큰이 블랙리스트에 있는지)
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (session?.isRevoked) {
      res.status(401).json({
        success: false,
        error: '만료되거나 무효화된 토큰입니다',
      });
      return;
    }

    // 사용자 존재 및 활성 상태 확인
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        isLocked: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: '사용자를 찾을 수 없습니다',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: '비활성화된 계정입니다',
      });
      return;
    }

    if (user.isLocked) {
      res.status(403).json({
        success: false,
        error: '잠긴 계정입니다. 관리자에게 문의하세요',
      });
      return;
    }

    // 요청 객체에 사용자 정보 추가
    req.user = {
      userId: user.id,
      email: user.email,
    };

    // 세션 활동 시간 업데이트
    if (session) {
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActivityAt: new Date() },
      });
    }

    next();
  } catch (error) {
    console.error('인증 오류:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : '인증 실패',
    });
  }
}

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고, 없어도 계속 진행
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, isActive: true },
    });

    if (user?.isActive) {
      req.user = {
        userId: user.id,
        email: user.email,
      };
    }

    next();
  } catch {
    // 인증 실패해도 계속 진행
    next();
  }
}
