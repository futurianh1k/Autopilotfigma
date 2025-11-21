/**
 * Express 서버 메인 파일
 * 
 * @library express (v4.21.2)
 * @library helmet (v8.0.0) - 보안 헤더
 * @library cors (v2.8.5) - CORS 설정
 * @library express-rate-limit (v7.5.0) - Rate limiting
 * @reference https://expressjs.com/
 * @license MIT
 */

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 라우트 import
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes';
import oauthRoutes from './routes/oauthRoutes';
import passport from './config/passport';

// 환경 변수 로드
dotenv.config();

// Express 앱 생성
const app = express();
const PORT = process.env.PORT || 5000;

// ===== 미들웨어 설정 =====

// Helmet (보안 헤더)
app.use(helmet());

// CORS 설정
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// JSON 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport 초기화
app.use(passport.initialize());

// Rate Limiting (API 남용 방지)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15분
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 요청
  message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도하세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting을 /api 경로에만 적용
app.use('/api', limiter);

// 요청 로깅 (개발 환경)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ===== 라우트 설정 =====

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/keys', apiKeyRoutes);

// 404 핸들러
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: '요청하신 리소스를 찾을 수 없습니다',
  });
});

// 에러 핸들러
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('서버 오류:', err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? '서버 오류가 발생했습니다' 
      : err.message,
  });
});

// ===== 서버 시작 =====

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Landing Page Backend API Server     ║
╠════════════════════════════════════════╣
║   환경: ${process.env.NODE_ENV || 'development'}
║   포트: ${PORT}
║   시작 시간: ${new Date().toISOString()}
╚════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM 신호 수신. 서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT 신호 수신. 서버를 종료합니다...');
  process.exit(0);
});

export default app;
