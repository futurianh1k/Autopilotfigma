/**
 * Passport OAuth 설정
 * 
 * @library passport (v0.7.0)
 * @library passport-google-oauth20 (v2.0.0)
 * @library passport-kakao (v1.0.1)
 * @reference https://www.passportjs.org/
 * @license MIT
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import prisma from './database';

/**
 * Google OAuth 전략 설정
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('이메일 정보를 가져올 수 없습니다'), undefined);
          }

          // 기존 사용자 찾기
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { provider: 'GOOGLE', providerId: profile.id },
              ],
            },
          });

          if (user) {
            // 기존 사용자 - Provider 정보 업데이트
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'GOOGLE',
                providerId: profile.id,
                name: user.name || profile.displayName,
                profileImage: user.profileImage || profile.photos?.[0]?.value,
                emailVerified: true, // Google 계정은 이미 인증됨
                lastLoginAt: new Date(),
              },
            });
          } else {
            // 신규 사용자 생성
            user = await prisma.user.create({
              data: {
                email,
                provider: 'GOOGLE',
                providerId: profile.id,
                name: profile.displayName,
                profileImage: profile.photos?.[0]?.value,
                emailVerified: true,
              },
            });

            // 감사 로그
            await prisma.auditLog.create({
              data: {
                userId: user.id,
                action: 'REGISTER',
                status: 'SUCCESS',
                metadata: { provider: 'GOOGLE' },
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

/**
 * Kakao OAuth 전략 설정
 */
if (process.env.KAKAO_CLIENT_ID) {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
        callbackURL: process.env.KAKAO_CALLBACK_URL || '/api/auth/kakao/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const kakaoAccount = profile._json.kakao_account;
          const email = kakaoAccount?.email;

          if (!email) {
            return done(new Error('이메일 정보를 가져올 수 없습니다'), undefined);
          }

          // 기존 사용자 찾기
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { provider: 'KAKAO', providerId: profile.id },
              ],
            },
          });

          if (user) {
            // 기존 사용자 - Provider 정보 업데이트
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'KAKAO',
                providerId: profile.id,
                name: user.name || kakaoAccount?.profile?.nickname,
                profileImage: user.profileImage || kakaoAccount?.profile?.profile_image_url,
                emailVerified: kakaoAccount?.is_email_verified || false,
                lastLoginAt: new Date(),
              },
            });
          } else {
            // 신규 사용자 생성
            user = await prisma.user.create({
              data: {
                email,
                provider: 'KAKAO',
                providerId: profile.id,
                name: kakaoAccount?.profile?.nickname,
                profileImage: kakaoAccount?.profile?.profile_image_url,
                emailVerified: kakaoAccount?.is_email_verified || false,
              },
            });

            // 감사 로그
            await prisma.auditLog.create({
              data: {
                userId: user.id,
                action: 'REGISTER',
                status: 'SUCCESS',
                metadata: { provider: 'KAKAO' },
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
