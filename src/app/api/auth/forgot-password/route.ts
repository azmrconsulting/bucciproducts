import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, we sent a password reset link.',
      });
    }

    // Check if user has a password (might be OAuth-only user)
    if (!user.passwordHash) {
      return NextResponse.json({
        message: 'If an account with that email exists, we sent a password reset link.',
      });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Set expiration to 1 hour from now
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() },
    });

    // Store the hashed token
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: hashedToken,
        expires,
      },
    });

    // Send the email with the unhashed token
    const result = await sendPasswordResetEmail(email, token);

    if (!result.success) {
      console.error('Failed to send reset email:', result.error);
      // Still return success to prevent information leakage
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we sent a password reset link.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
