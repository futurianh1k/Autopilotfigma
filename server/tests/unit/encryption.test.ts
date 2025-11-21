/**
 * 암호화 유틸리티 테스트
 * 
 * @library vitest (v2.1.8)
 * @reference https://vitest.dev/api/
 */

import { describe, it, expect } from 'vitest';
import {
  encrypt,
  decrypt,
  hashPassword,
  comparePassword,
  generateApiKey,
  hashApiKey,
  generateToken,
  generateSecureRandomNumber,
} from '../../src/utils/encryption';

const TEST_ENCRYPTION_KEY = 'test-encryption-key-32-chars!!';

describe('암호화 유틸리티 테스트', () => {
  describe('encrypt/decrypt', () => {
    it('문자열을 암호화하고 복호화할 수 있어야 함', () => {
      const plainText = '민감한 개인정보';
      const encrypted = encrypt(plainText, TEST_ENCRYPTION_KEY);
      const decrypted = decrypt(encrypted, TEST_ENCRYPTION_KEY);
      
      expect(encrypted).not.toBe(plainText);
      expect(decrypted).toBe(plainText);
    });

    it('암호화된 문자열은 iv:authTag:encrypted 형식이어야 함', () => {
      const plainText = 'test data';
      const encrypted = encrypt(plainText, TEST_ENCRYPTION_KEY);
      const parts = encrypted.split(':');
      
      expect(parts).toHaveLength(3);
      expect(parts[0]).toHaveLength(32); // IV (16바이트 hex)
      expect(parts[1]).toHaveLength(32); // AuthTag (16바이트 hex)
    });

    it('잘못된 키로 복호화 시 에러가 발생해야 함', () => {
      const plainText = 'secret';
      const encrypted = encrypt(plainText, TEST_ENCRYPTION_KEY);
      
      expect(() => {
        decrypt(encrypted, 'wrong-key');
      }).toThrow();
    });

    it('동일한 평문도 매번 다르게 암호화되어야 함 (랜덤 IV)', () => {
      const plainText = 'same text';
      const encrypted1 = encrypt(plainText, TEST_ENCRYPTION_KEY);
      const encrypted2 = encrypt(plainText, TEST_ENCRYPTION_KEY);
      
      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1, TEST_ENCRYPTION_KEY)).toBe(plainText);
      expect(decrypt(encrypted2, TEST_ENCRYPTION_KEY)).toBe(plainText);
    });
  });

  describe('hashPassword/comparePassword', () => {
    it('비밀번호를 해싱할 수 있어야 함', async () => {
      const password = 'mySecurePassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toHaveLength(60); // bcrypt 해시 길이
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
    });

    it('해싱된 비밀번호와 평문을 비교할 수 있어야 함', async () => {
      const password = 'testPassword456';
      const hash = await hashPassword(password);
      
      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('잘못된 비밀번호는 일치하지 않아야 함', async () => {
      const password = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hash = await hashPassword(password);
      
      const isMatch = await comparePassword(wrongPassword, hash);
      expect(isMatch).toBe(false);
    });

    it('동일한 비밀번호도 매번 다르게 해싱되어야 함 (솔트)', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
      expect(await comparePassword(password, hash1)).toBe(true);
      expect(await comparePassword(password, hash2)).toBe(true);
    });
  });

  describe('generateApiKey', () => {
    it('API 키를 생성할 수 있어야 함', () => {
      const apiKey = generateApiKey();
      
      expect(apiKey).toHaveLength(64); // 32바이트 hex = 64글자
      expect(/^[0-9a-f]+$/.test(apiKey)).toBe(true); // hex 형식
    });

    it('지정된 길이의 API 키를 생성할 수 있어야 함', () => {
      const apiKey = generateApiKey(16);
      
      expect(apiKey).toHaveLength(32); // 16바이트 hex = 32글자
    });

    it('매번 다른 API 키를 생성해야 함', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('hashApiKey', () => {
    it('API 키를 해싱할 수 있어야 함', () => {
      const apiKey = 'my-api-key-12345';
      const hash = hashApiKey(apiKey);
      
      expect(hash).toHaveLength(64); // SHA-256 hex = 64글자
      expect(hash).not.toBe(apiKey);
    });

    it('동일한 API 키는 항상 같은 해시를 생성해야 함', () => {
      const apiKey = 'consistent-key';
      const hash1 = hashApiKey(apiKey);
      const hash2 = hashApiKey(apiKey);
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('generateToken', () => {
    it('토큰을 생성할 수 있어야 함', () => {
      const token = generateToken();
      
      expect(token).toHaveLength(64); // 32바이트 hex = 64글자
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    it('매번 다른 토큰을 생성해야 함', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateSecureRandomNumber', () => {
    it('지정된 범위 내의 랜덤 숫자를 생성해야 함', () => {
      const min = 1;
      const max = 100;
      
      for (let i = 0; i < 50; i++) {
        const randomNum = generateSecureRandomNumber(min, max);
        expect(randomNum).toBeGreaterThanOrEqual(min);
        expect(randomNum).toBeLessThanOrEqual(max);
      }
    });

    it('범위가 1일 때 정확한 값을 반환해야 함', () => {
      const num = generateSecureRandomNumber(5, 5);
      expect(num).toBe(5);
    });

    it('충분히 랜덤해야 함 (분포 테스트)', () => {
      const counts = new Map<number, number>();
      const iterations = 1000;
      const min = 1;
      const max = 10;
      
      for (let i = 0; i < iterations; i++) {
        const num = generateSecureRandomNumber(min, max);
        counts.set(num, (counts.get(num) || 0) + 1);
      }
      
      // 각 숫자가 최소 한 번은 나와야 함 (통계적으로)
      expect(counts.size).toBeGreaterThan(5);
    });
  });
});
