/**
 * OAuth 라우트
 */

import { Router } from 'express';
import passport from '../config/passport';
import * as oauthController from '../controllers/oauthController';

const router = Router();

// ===== Google OAuth =====

// Google 로그인 시작
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Google 콜백
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/api/oauth/failure',
  }),
  oauthController.oauthCallback
);

// ===== Kakao OAuth =====

// Kakao 로그인 시작
router.get(
  '/kakao',
  passport.authenticate('kakao', { session: false })
);

// Kakao 콜백
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    session: false,
    failureRedirect: '/api/oauth/failure',
  }),
  oauthController.oauthCallback
);

// ===== OAuth 실패 핸들러 =====
router.get('/failure', oauthController.oauthFailure);

export default router;
