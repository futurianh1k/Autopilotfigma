/**
 * API 키 컨트롤러
 */

import { Request, Response } from 'express';
import * as apiKeyService from '../services/apiKeyService';

/**
 * POST /api/keys
 * API 키 생성
 */
export async function createApiKey(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const { name, scopes, expiresAt } = req.body;
    const result = await apiKeyService.createApiKey(
      req.user.userId,
      name,
      scopes,
      expiresAt ? new Date(expiresAt) : undefined
    );

    res.status(201).json({
      success: true,
      message: 'API 키가 생성되었습니다. 키를 안전하게 보관하세요',
      data: result,
    });
  } catch (error) {
    console.error('API 키 생성 오류:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'API 키 생성 실패',
    });
  }
}

/**
 * GET /api/keys
 * API 키 목록 조회
 */
export async function listApiKeys(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const keys = await apiKeyService.listApiKeys(req.user.userId);

    res.status(200).json({
      success: true,
      data: keys,
    });
  } catch (error) {
    console.error('API 키 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: 'API 키 목록 조회 실패',
    });
  }
}

/**
 * PATCH /api/keys/:keyId/deactivate
 * API 키 비활성화
 */
export async function deactivateApiKey(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const { keyId } = req.params;
    await apiKeyService.deactivateApiKey(req.user.userId, keyId);

    res.status(200).json({
      success: true,
      message: 'API 키가 비활성화되었습니다',
    });
  } catch (error) {
    console.error('API 키 비활성화 오류:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'API 키 비활성화 실패',
    });
  }
}

/**
 * DELETE /api/keys/:keyId
 * API 키 삭제
 */
export async function deleteApiKey(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '인증이 필요합니다' });
      return;
    }

    const { keyId } = req.params;
    await apiKeyService.deleteApiKey(req.user.userId, keyId);

    res.status(200).json({
      success: true,
      message: 'API 키가 삭제되었습니다',
    });
  } catch (error) {
    console.error('API 키 삭제 오류:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'API 키 삭제 실패',
    });
  }
}
