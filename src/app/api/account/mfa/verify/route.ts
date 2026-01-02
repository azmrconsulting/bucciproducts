import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTOTPCode, decryptSecret, verifyBackupCode } from "@/lib/mfa";
import { z } from "zod";

const verifyMfaSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().min(1, "Code is required"),
  type: z.enum(["totp", "backup"]).default("totp"),
});

/**
 * POST /api/account/mfa/verify
 * Verify MFA code during login
 * Called after password verification when user has MFA enabled
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, type } = verifyMfaSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, mfaEnabled: true, mfaSecret: true, mfaBackupCodes: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    if (!user.mfaEnabled) {
      return NextResponse.json(
        { error: "MFA is not enabled for this account" },
        { status: 400 }
      );
    }

    let isValid = false;

    if (type === "totp") {
      if (!user.mfaSecret) {
        return NextResponse.json(
          { error: "MFA configuration error" },
          { status: 500 }
        );
      }
      const secret = decryptSecret(user.mfaSecret);
      isValid = verifyTOTPCode(secret, code, user.email);
    } else {
      // Verify backup code
      const usedIndex = verifyBackupCode(code, user.mfaBackupCodes);
      if (usedIndex >= 0) {
        isValid = true;
        // Remove the used backup code
        const updatedCodes = [...user.mfaBackupCodes];
        updatedCodes.splice(usedIndex, 1);
        await prisma.user.update({
          where: { id: user.id },
          data: { mfaBackupCodes: updatedCodes },
        });

        console.log(`[SECURITY] Backup code used for login: ${user.email} (${user.mfaBackupCodes.length - 1} remaining)`);
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      message: "MFA verification successful",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("MFA verify error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
