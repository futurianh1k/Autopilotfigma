/**
 * 인증 컨트롤러
 * 
 * @description 인증 관련 API 엔드포인트 핸들러
 */

import { Request, Response } from 'express';
import * as authService from '../services/authService';

/**
 * POST /api/auth/register
 * 이메일 회원가입
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    const result = await authService.registerWithEmail(email, password, name);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다',
      data: result.user,
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '회원가입 실패',
    });
  }
}

/**
 * POST /api/auth/login
 * 이메일 로그인
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, twoFactorCode } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await authService.loginWithEmail(
      email,
      password,
      twoFactorCode,
      ipAddress,
      userAgent
    );

    // 2FA 필요한 경우
    if ('requires2FA' in result) {
      res.status(200).json({
        success: true,
        requires2FA: true,
        message: '2단계 인증 코드를 입력하세요',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: '로그인 성공',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : '로그인 실패',
    });
  }
}

/**
 * POST /api/auth/logout
 * 로그아웃
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const token = req.headers.authorization?.substring(7) || '';
    await authService.logout(req.user.userId, token);

    res.status(200).json({
      success: true,
      message: '로그아웃 되었습니다',
    });
  } catch (error) {
    console.error('로그아웃 오류:', error);
    res.status(500).json({
      success: false,
      error: '로그아웃 실패',
    });
  }
}

/**
 * GET /api/auth/2fa/init
 * 2FA 초기화 (QR 코드 생성)
 */
export async function init2FA(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const result = await authService.initiate2FA(req.user.userId);

    res.status(200).json({
      success: true,
      message: '2단계 인증 초기화 완료',
      data: result,
    });
  } catch (error) {
    console.error('2FA 초기화 오류:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '2FA 초기화 실패',
    });
  }
}

/**
 * POST /api/auth/2fa/enable
 * 2FA 활성화
 */
export async function enable2FA(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const { token } = req.body;
    const result = await authService.enable2FA(req.user.userId, token);

    res.status(200).json({
      success: true,
      message: '2단계 인증이 활성화되었습니다',
      data: result,
    });
  } catch (error) {
    console.error('2FA 활성화 오류:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '2FA 활성화 실패',
    });
  }
}

/**
 * POST /api/auth/2fa/disable
 * 2FA 비활성화
 */
export async function disable2FA(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const { password } = req.body;
    await authService.disable2FA(req.user.userId, password);

    res.status(200).json({
      success: true,
      message: '2단계 인증이 비활성화되었습니다',
    });
  } catch (error) {
    console.error('2FA 비활성화 오류:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '2FA 비활성화 실패',
    });
  }
}
