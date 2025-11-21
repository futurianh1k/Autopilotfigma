/**
 * 인증 라우트
 */

import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate, registerSchema, loginSchema, enable2FASchema } from '../middleware/validation';

const router = Router();

// 회원가입
router.post('/register', validate(registerSchema), authController.register);

// 로그인
router.post('/login', validate(loginSchema), authController.login);

// 로그아웃 (인증 필요)
router.post('/logout', authenticateToken, authController.logout);

// 2FA 관련 라우트 (모두 인증 필요)
router.get('/2fa/init', authenticateToken, authController.init2FA);
router.post('/2fa/enable', authenticateToken, validate(enable2FASchema), authController.enable2FA);
router.post('/2fa/disable', authenticateToken, authController.disable2FA);

export default router;
