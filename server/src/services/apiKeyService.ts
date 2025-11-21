/**
 * API 키 관리 서비스
 * 
 * @description API 키 생성, 조회, 삭제 및 검증
 */

import prisma from '../config/database';
import { generateApiKey, hashApiKey } from '../utils/encryption';

/**
 * API 키 생성
 */
export async function createApiKey(
  userId: string,
  name: string,
  scopes: string[],
  expiresAt?: Date
) {
  // API 키 생성 (64자리 hex)
  const apiKey = generateApiKey(32);
  const keyHash = hashApiKey(apiKey);
  const keyPreview = apiKey.substring(0, 8) + '...';

  // DB에 저장
  const createdKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash,
      keyPreview,
      scopes,
      expiresAt,
    },
    select: {
      id: true,
      name: true,
      keyPreview: true,
      scopes: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  // 감사 로그
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'API_KEY_CREATE',
      status: 'SUCCESS',
      resource: createdKey.id,
    },
  });

  // 생성된 API 키는 최초 1회만 반환 (이후 조회 불가)
  return {
    ...createdKey,
    apiKey, // 실제 키는 여기서만 반환됨
  };
}

/**
 * API 키 목록 조회
 */
export async function listApiKeys(userId: string) {
  return await prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      keyPreview: true,
      scopes: true,
      isActive: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * API 키 검증
 */
export async function validateApiKey(apiKey: string) {
  const keyHash = hashApiKey(apiKey);

  const key = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          isActive: true,
          isLocked: true,
        },
      },
    },
  });

  if (!key) {
    throw new Error('유효하지 않은 API 키입니다');
  }

  if (!key.isActive) {
    throw new Error('비활성화된 API 키입니다');
  }

  if (key.expiresAt && key.expiresAt < new Date()) {
    throw new Error('만료된 API 키입니다');
  }

  if (!key.user.isActive || key.user.isLocked) {
    throw new Error('사용자 계정이 비활성화되었습니다');
  }

  // 마지막 사용 시간 업데이트
  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    userId: key.user.id,
    email: key.user.email,
    scopes: key.scopes,
    keyId: key.id,
  };
}

/**
 * API 키 비활성화
 */
export async function deactivateApiKey(userId: string, keyId: string) {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });

  if (!key) {
    throw new Error('API 키를 찾을 수 없습니다');
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false },
  });

  // 감사 로그
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'API_KEY_DEACTIVATE',
      status: 'SUCCESS',
      resource: keyId,
    },
  });

  return { success: true };
}

/**
 * API 키 삭제
 */
export async function deleteApiKey(userId: string, keyId: string) {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });

  if (!key) {
    throw new Error('API 키를 찾을 수 없습니다');
  }

  await prisma.apiKey.delete({
    where: { id: keyId },
  });

  // 감사 로그
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'API_KEY_DELETE',
      status: 'SUCCESS',
      resource: keyId,
    },
  });

  return { success: true };
}
