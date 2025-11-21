/**
 * 암호화 유틸리티
 * 
 * @library crypto (Node.js 내장)
 * @library bcryptjs (v2.4.3)
 * @reference https://nodejs.org/api/crypto.html
 * @reference https://www.npmjs.com/package/bcryptjs
 * @license MIT
 * 
 * @description 
 * - AES-256-GCM을 사용한 대칭 암호화 (개인정보, API 키)
 * - bcrypt를 사용한 비밀번호 해싱
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// 암호화 알고리즘 설정
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_ROUNDS = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * 문자열을 AES-256-GCM으로 암호화
 * 
 * @param text - 암호화할 평문
 * @param encryptionKey - 32바이트 암호화 키
 * @returns 암호화된 문자열 (iv:authTag:encrypted 형식)
 */
export function encrypt(text: string, encryptionKey: string): string {
  try {
    // 키를 32바이트로 변환
    const key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32));
    
    // 랜덤 IV 생성
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // 암호화 객체 생성
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // 암호화 수행
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 인증 태그 획득
    const authTag = cipher.getAuthTag();
    
    // iv:authTag:encrypted 형식으로 반환
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`암호화 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * AES-256-GCM으로 암호화된 문자열을 복호화
 * 
 * @param encryptedText - 암호화된 문자열 (iv:authTag:encrypted 형식)
 * @param encryptionKey - 32바이트 암호화 키
 * @returns 복호화된 평문
 */
export function decrypt(encryptedText: string, encryptionKey: string): string {
  try {
    // 키를 32바이트로 변환
    const key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32));
    
    // iv:authTag:encrypted 형식 파싱
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('잘못된 암호화 형식');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    // 복호화 객체 생성
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // 복호화 수행
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`복호화 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 비밀번호를 bcrypt로 해싱
 * 
 * @param password - 평문 비밀번호
 * @returns 해싱된 비밀번호
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error(`비밀번호 해싱 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 비밀번호를 bcrypt 해시와 비교
 * 
 * @param password - 평문 비밀번호
 * @param hash - 해싱된 비밀번호
 * @returns 일치 여부
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`비밀번호 비교 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * API 키 생성 (안전한 랜덤 문자열)
 * 
 * @param length - 키 길이 (기본 32바이트)
 * @returns 생성된 API 키 (hex 형식)
 */
export function generateApiKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * API 키 해싱 (SHA-256)
 * 
 * @param apiKey - API 키
 * @returns 해싱된 API 키
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * 랜덤 토큰 생성 (이메일 인증 등에 사용)
 * 
 * @param length - 토큰 길이 (기본 32바이트)
 * @returns 생성된 토큰 (hex 형식)
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 안전한 랜덤 숫자 생성
 * 
 * @param min - 최소값
 * @param max - 최대값
 * @returns 랜덤 숫자
 */
export function generateSecureRandomNumber(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const randomBytes = crypto.randomBytes(bytesNeeded);
  const randomNumber = randomBytes.readUIntBE(0, bytesNeeded);
  return min + (randomNumber % range);
}
