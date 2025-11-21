/**
 * 프로필 컨트롤러
 */

import { Request, Response } from 'express';
import * as profileService from '../services/profileService';

/**
 * GET /api/profile
 * 프로필 조회
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const profile = await profileService.getProfile(req.user.userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '프로필 조회 실패',
    });
  }
}

/**
 * PATCH /api/profile
 * 프로필 업데이트
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const updatedProfile = await profileService.updateProfile(req.user.userId, req.body);

    res.status(200).json({
      success: true,
      message: '프로필이 업데이트되었습니다',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '프로필 업데이트 실패',
    });
  }
}

/**
 * POST /api/profile/change-password
 * 비밀번호 변경
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    await profileService.changePassword(req.user.userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: '비밀번호가 변경되었습니다. 다시 로그인해주세요',
    });
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '비밀번호 변경 실패',
    });
  }
}

/**
 * DELETE /api/profile
 * 계정 삭제
 */
export async function deleteAccount(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const { password } = req.body;
    await profileService.deleteAccount(req.user.userId, password);

    res.status(200).json({
      success: true,
      message: '계정이 삭제되었습니다',
    });
  } catch (error) {
    console.error('계정 삭제 오류:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '계정 삭제 실패',
    });
  }
}
