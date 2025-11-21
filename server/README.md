# Landing Page Backend API

백엔드 인증 및 사용자 관리 시스템

## 📋 기능

### ✅ 구현 완료
- ✅ 이메일 회원가입/로그인
- ✅ JWT 기반 인증 (Access Token + Refresh Token)
- ✅ 2FA (TOTP) 인증
- ✅ 사용자 프로필 관리 (CRUD)
- ✅ 비밀번호 변경
- ✅ API 키 관리 및 암호화
- ✅ 개인정보 암호화 (AES-256-GCM)
- ✅ 감사 로그 (Audit Log)
- ✅ Rate Limiting
- ✅ 보안 헤더 (Helmet)

### 🚧 구현 예정
- ⏳ Google OAuth 인증
- ⏳ Kakao OAuth 인증
- ⏳ 이메일 인증
- ⏳ 비밀번호 재설정

## 🛠 기술 스택

### 백엔드 프레임워크
- **Node.js** (v20+)
- **Express** (v4.21.2)
- **TypeScript** (v5.7.2)

### 데이터베이스
- **PostgreSQL** (v15+)
- **Prisma ORM** (v6.1.0)

### 인증 & 보안
- **jsonwebtoken** (v9.0.2) - JWT 토큰
- **bcryptjs** (v2.4.3) - 비밀번호 해싱
- **otplib** (v12.0.1) - 2FA TOTP
- **crypto** (Node.js 내장) - AES-256 암호화
- **helmet** (v8.0.0) - 보안 헤더
- **express-rate-limit** (v7.5.0) - Rate limiting

### 검증 & 유틸리티
- **zod** (v3.24.1) - 스키마 검증
- **qrcode** (v1.5.4) - QR 코드 생성
- **winston** (v3.17.0) - 로깅

### 테스트
- **vitest** (v2.1.8)
- **supertest** (v7.0.0)

## 📁 프로젝트 구조

```
server/
├── prisma/
│   └── schema.prisma          # 데이터베이스 스키마
├── src/
│   ├── config/
│   │   └── database.ts        # Prisma 클라이언트 설정
│   ├── controllers/           # API 컨트롤러
│   │   ├── authController.ts
│   │   ├── profileController.ts
│   │   └── apiKeyController.ts
│   ├── middleware/            # Express 미들웨어
│   │   ├── auth.ts           # JWT 인증
│   │   └── validation.ts     # Zod 검증
│   ├── models/               # 데이터 모델 (Prisma)
│   ├── routes/               # 라우트 정의
│   │   ├── authRoutes.ts
│   │   ├── profileRoutes.ts
│   │   └── apiKeyRoutes.ts
│   ├── services/             # 비즈니스 로직
│   │   ├── authService.ts
│   │   ├── profileService.ts
│   │   └── apiKeyService.ts
│   ├── utils/                # 유틸리티 함수
│   │   ├── encryption.ts     # 암호화/해싱
│   │   ├── jwt.ts           # JWT 생성/검증
│   │   └── twoFactor.ts     # 2FA 관련
│   ├── types/               # TypeScript 타입 정의
│   └── server.ts            # Express 서버 진입점
├── tests/
│   ├── unit/                # 단위 테스트
│   └── integration/         # 통합 테스트
├── .env.example             # 환경 변수 예제
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
cd server
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 `.env.example`을 참고하여 설정:

```bash
cp .env.example .env
```

**필수 환경 변수:**

```env
# 데이터베이스
DATABASE_URL="postgresql://username:password@localhost:5432/landing_page_db"

# JWT 시크릿 (강력한 랜덤 문자열 사용)
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# 암호화 키 (32자)
ENCRYPTION_KEY="your-32-character-encryption-key"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

### 3. 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate

# (선택) Prisma Studio 실행
npm run prisma:studio
```

### 4. 서버 실행

**개발 모드 (Hot Reload):**
```bash
npm run dev
```

**프로덕션 빌드:**
```bash
npm run build
npm start
```

서버가 `http://localhost:5000`에서 실행됩니다.

## 📡 API 엔드포인트

### 인증 (Auth)

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| POST | `/api/auth/register` | 이메일 회원가입 | ❌ |
| POST | `/api/auth/login` | 로그인 | ❌ |
| POST | `/api/auth/logout` | 로그아웃 | ✅ |
| GET | `/api/auth/2fa/init` | 2FA 초기화 (QR 코드) | ✅ |
| POST | `/api/auth/2fa/enable` | 2FA 활성화 | ✅ |
| POST | `/api/auth/2fa/disable` | 2FA 비활성화 | ✅ |

### 프로필 (Profile)

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| GET | `/api/profile` | 프로필 조회 | ✅ |
| PATCH | `/api/profile` | 프로필 업데이트 | ✅ |
| POST | `/api/profile/change-password` | 비밀번호 변경 | ✅ |
| DELETE | `/api/profile` | 계정 삭제 | ✅ |

### API 키 (API Keys)

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| POST | `/api/keys` | API 키 생성 | ✅ |
| GET | `/api/keys` | API 키 목록 조회 | ✅ |
| PATCH | `/api/keys/:keyId/deactivate` | API 키 비활성화 | ✅ |
| DELETE | `/api/keys/:keyId` | API 키 삭제 | ✅ |

### Health Check

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/health` | 서버 상태 확인 |

## 🔐 인증 방식

### JWT Bearer Token

요청 헤더에 다음과 같이 포함:

```
Authorization: Bearer <access_token>
```

### 토큰 만료 시간
- **Access Token**: 15분
- **Refresh Token**: 7일

## 📝 API 사용 예제

### 1. 회원가입

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "홍길동"
  }'
```

### 2. 로그인

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. 프로필 조회

```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer <access_token>"
```

### 4. 2FA 초기화

```bash
curl -X GET http://localhost:5000/api/auth/2fa/init \
  -H "Authorization: Bearer <access_token>"
```

## 🧪 테스트

### 모든 테스트 실행

```bash
npm test
```

### 테스트 커버리지

```bash
npm run test:coverage
```

### 특정 테스트 파일 실행

```bash
npx vitest tests/unit/encryption.test.ts
```

## 🔒 보안 기능

### 1. 비밀번호 보안
- ✅ bcrypt (Salt Rounds: 12)
- ✅ 최소 8자, 대소문자/숫자/특수문자 포함

### 2. 데이터 암호화
- ✅ AES-256-GCM (대칭 암호화)
- ✅ 개인정보 암호화 (전화번호, 주소, 생년월일)
- ✅ API 키 해싱 (SHA-256)

### 3. 2FA (Two-Factor Authentication)
- ✅ TOTP (Time-based One-Time Password)
- ✅ 30초 갱신 주기
- ✅ QR 코드 지원
- ✅ 백업 코드 10개 제공

### 4. Rate Limiting
- ✅ 15분당 100 요청 제한
- ✅ IP 기반 제한

### 5. 감사 로그
- ✅ 모든 중요 작업 기록
- ✅ IP 주소, User Agent 추적

## 🗃 데이터베이스 스키마

### 주요 테이블

#### User (사용자)
- 이메일, 비밀번호 해시
- OAuth 제공자 정보
- 2FA 설정
- 계정 상태 (활성/잠금)

#### Session (세션)
- JWT 토큰 추적
- 세션 메타데이터
- 블랙리스트 관리

#### UserProfile (프로필)
- 개인정보 (암호화됨)
- 알림 설정

#### ApiKey (API 키)
- 키 해시값
- 권한 범위 (scopes)
- Rate limit 설정

#### AuditLog (감사 로그)
- 보안 이벤트 추적
- 사용자 활동 기록

## 📚 참고 자료

### 라이브러리 문서
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [otplib](https://www.npmjs.com/package/otplib)
- [Zod](https://zod.dev/)

### 보안 가이드
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## 🐛 트러블슈팅

### Q: DATABASE_URL 연결 오류
**A:** PostgreSQL이 실행 중인지 확인하고, `.env`의 연결 문자열이 정확한지 확인하세요.

### Q: JWT 검증 실패
**A:** `JWT_SECRET`이 올바른지 확인하고, 토큰이 만료되지 않았는지 확인하세요.

### Q: 2FA QR 코드가 작동하지 않음
**A:** Google Authenticator 또는 Authy 앱에서 시간 동기화를 확인하세요.

## 📄 라이선스

MIT License

## 👥 개발자

AI Assistant

---

**Last Updated:** 2025-11-21
