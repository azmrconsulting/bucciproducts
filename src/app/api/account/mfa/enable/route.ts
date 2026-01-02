import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTOTPCode, decryptSecret } from "@/lib/mfa";
import { z } from "zod";

const enableMfaSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

/**
 * POST /api/account/mfa/enable
 * Verify TOTP code and enable MFA
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
    const { code } = enableMfaSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true, mfaEnabled: true, mfaSecret: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "MFA is only available for admin accounts" },
        { status: 403 }
      );
    }

    if (user.mfaEnabled) {
      return NextResponse.json(
        { error: "MFA is already enabled" },
        { status: 400 }
      );
    }

    if (!user.mfaSecret) {
      return NextResponse.json(
        { error: "Please set up MFA first by calling /api/account/mfa/setup" },
        { status: 400 }
      );
    }

    // Decrypt and verify the code
    const secret = decryptSecret(user.mfaSecret);
    const isValid = verifyTOTPCode(secret, code, user.email);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    // Enable MFA
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true },
    });

    console.log(`[SECURITY] MFA enabled for admin user: ${user.email}`);

    return NextResponse.json({
      message: "Two-factor authentication has been enabled successfully",
      enabled: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("MFA enable error:", error);
    return NextResponse.json(
      { error: "Failed to enable MFA" },
      { status: 500 }
    );
  }
}
