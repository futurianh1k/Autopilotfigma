/**
 * 데이터베이스 설정
 * 
 * @library @prisma/client (v6.1.0)
 * @reference https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
 * @license Apache-2.0
 */

import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 싱글톤 인스턴스
let prisma: PrismaClient;

/**
 * Prisma 클라이언트 초기화 및 반환
 * 
 * @returns Prisma 클라이언트 인스턴스
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });

    // Graceful shutdown 처리
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });
  }

  return prisma;
}

// 기본 export
export default getPrismaClient();
