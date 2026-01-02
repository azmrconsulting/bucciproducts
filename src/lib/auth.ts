import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { verifyTOTPCode, decryptSecret, verifyBackupCode } from "./mfa";

// SECURITY: Account lockout configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

// Special error codes for MFA
export const MFA_REQUIRED_ERROR = "MFA_REQUIRED";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mfaCode: { label: "MFA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        // SECURITY: Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in. Check your inbox for the verification link.");
        }

        // SECURITY: Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const remainingMinutes = Math.ceil(
            (user.lockedUntil.getTime() - Date.now()) / (1000 * 60)
          );
          throw new Error(
            `Account locked. Try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          // SECURITY: Track failed login attempts
          const newFailedAttempts = user.failedLoginAttempts + 1;
          const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newFailedAttempts,
              lockedUntil: shouldLock
                ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
                : null,
            },
          });

          if (shouldLock) {
            console.log(
              `[SECURITY] Account locked for ${user.email} after ${MAX_FAILED_ATTEMPTS} failed attempts`
            );
            throw new Error(
              `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`
            );
          }

          throw new Error("Invalid credentials");
        }

        // SECURITY: Check MFA requirement
        if (user.mfaEnabled && user.mfaSecret) {
          const mfaCode = credentials.mfaCode;

          // If MFA is enabled but no code provided, throw special error
          if (!mfaCode) {
            throw new Error(MFA_REQUIRED_ERROR);
          }

          // Verify MFA code (TOTP or backup code)
          const secret = decryptSecret(user.mfaSecret);
          const isTotpValid = verifyTOTPCode(secret, mfaCode, user.email);

          if (!isTotpValid) {
            // Try backup code
            const backupIndex = verifyBackupCode(mfaCode, user.mfaBackupCodes);
            if (backupIndex >= 0) {
              // Remove used backup code
              const updatedCodes = [...user.mfaBackupCodes];
              updatedCodes.splice(backupIndex, 1);
              await prisma.user.update({
                where: { id: user.id },
                data: { mfaBackupCodes: updatedCodes },
              });
              console.log(
                `[SECURITY] Backup code used for login: ${user.email} (${updatedCodes.length} remaining)`
              );
            } else {
              throw new Error("Invalid verification code");
            }
          }
        }

        // SECURITY: Reset failed attempts on successful login
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.firstName ? `${user.firstName} ${user.lastName}` : null,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Fetch role from database
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
};
