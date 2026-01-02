import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTOTPCode, decryptSecret, verifyBackupCode } from "@/lib/mfa";
import { z } from "zod";

const disableMfaSchema = z.object({
  code: z.string().min(1, "Code is required"),
  type: z.enum(["totp", "backup"]).default("totp"),
});

/**
 * POST /api/account/mfa/disable
 * Disable MFA (requires TOTP code or backup code for verification)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, type } = disableMfaSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, mfaEnabled: true, mfaSecret: true, mfaBackupCodes: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.mfaEnabled) {
      return NextResponse.json(
        { error: "MFA is not enabled" },
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
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Disable MFA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
      },
    });

    console.log(`[SECURITY] MFA disabled for user: ${user.email}`);

    return NextResponse.json({
      message: "Two-factor authentication has been disabled",
      enabled: false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("MFA disable error:", error);
    return NextResponse.json(
      { error: "Failed to disable MFA" },
      { status: 500 }
    );
  }
}
