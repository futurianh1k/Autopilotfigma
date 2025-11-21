/**
 * API 키 라우트
 */

import { Router } from 'express';
import * as apiKeyController from '../controllers/apiKeyController';
import { authenticateToken } from '../middleware/auth';
import { validate, createApiKeySchema } from '../middleware/validation';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticateToken);

// API 키 생성
router.post('/', validate(createApiKeySchema), apiKeyController.createApiKey);

// API 키 목록 조회
router.get('/', apiKeyController.listApiKeys);

// API 키 비활성화
router.patch('/:keyId/deactivate', apiKeyController.deactivateApiKey);

// API 키 삭제
router.delete('/:keyId', apiKeyController.deleteApiKey);

export default router;
