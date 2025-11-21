/**
 * 프로필 라우트
 */

import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';
import { validate, updateProfileSchema, changePasswordSchema } from '../middleware/validation';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticateToken);

// 프로필 조회
router.get('/', profileController.getProfile);

// 프로필 업데이트
router.patch('/', validate(updateProfileSchema), profileController.updateProfile);

// 비밀번호 변경
router.post('/change-password', validate(changePasswordSchema), profileController.changePassword);

// 계정 삭제
router.delete('/', profileController.deleteAccount);

export default router;
