/**
 * 입력 검증 미들웨어
 * 
 * @library zod (v3.24.1)
 * @reference https://zod.dev/
 * @license MIT
 * 
 * @description Zod 스키마를 사용한 요청 데이터 검증
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Zod 스키마 검증 미들웨어 팩토리
 * 
 * @param schema - Zod 스키마
 * @param source - 검증할 데이터 소스 ('body' | 'query' | 'params')
 */
export function validate(
  schema: z.ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 지정된 소스에서 데이터 추출 및 검증
      const data = req[source];
      const validated = await schema.parseAsync(data);
      
      // 검증된 데이터로 교체
      req[source] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod 검증 오류를 사용자 친화적 형식으로 변환
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: '입력 데이터 검증 실패',
          details: errors,
        });
      } else {
        res.status(500).json({
          success: false,
          error: '검증 처리 중 오류 발생',
        });
      }
    }
  };
}

// ===== 공통 검증 스키마 =====

/**
 * 이메일 회원가입 스키마
 */
export const registerSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력하세요'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다'
    ),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다').optional(),
});

/**
 * 이메일 로그인 스키마
 */
export const loginSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
  twoFactorCode: z.string().regex(/^\d{6}$/, '6자리 인증 코드를 입력하세요').optional(),
});

/**
 * 2FA 활성화 스키마
 */
export const enable2FASchema = z.object({
  token: z.string().regex(/^\d{6}$/, '6자리 인증 코드를 입력하세요'),
});

/**
 * 프로필 업데이트 스키마
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phoneNumber: z.string().regex(/^[0-9-+()]*$/).optional(),
  address: z.string().max(200).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  timezone: z.string().optional(),
  language: z.string().length(2).optional(),
});

/**
 * 비밀번호 변경 스키마
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력하세요'),
  newPassword: z
    .string()
    .min(8, '새 비밀번호는 최소 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다'
    ),
});

/**
 * API 키 생성 스키마
 */
export const createApiKeySchema = z.object({
  name: z.string().min(3, 'API 키 이름은 최소 3자 이상이어야 합니다'),
  scopes: z.array(z.enum(['read', 'write', 'admin'])).min(1, '최소 1개 이상의 권한이 필요합니다'),
  expiresAt: z.string().datetime().optional(),
});
