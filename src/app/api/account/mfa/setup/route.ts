import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateTOTPSecret,
  generateTOTPUri,
  generateQRCode,
  generateBackupCodes,
  encryptSecret,
} from "@/lib/mfa";

/**
 * GET /api/account/mfa/setup
 * Generate MFA setup data (secret, QR code, backup codes)
 * Only for admin users who haven't enabled MFA yet
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true, mfaEnabled: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Only admin users can set up MFA (for now)
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "MFA is only available for admin accounts" },
        { status: 403 }
      );
    }

    if (user.mfaEnabled) {
      return NextResponse.json(
        { error: "MFA is already enabled. Disable it first to set up again." },
        { status: 400 }
      );
    }

    // Generate new secret and backup codes
    const secret = generateTOTPSecret();
    const uri = generateTOTPUri(secret, user.email);
    const qrCode = await generateQRCode(uri);
    const { codes: backupCodes, hashes: backupCodeHashes } = generateBackupCodes();

    // Store the secret temporarily (encrypted) - will be confirmed after verification
    // We store it in a pending state to prevent using it before verification
    const encryptedSecret = encryptSecret(secret);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaSecret: encryptedSecret,
        mfaBackupCodes: backupCodeHashes,
        // mfaEnabled stays false until verification
      },
    });

    return NextResponse.json({
      secret, // Show to user for manual entry
      qrCode, // QR code data URL
      backupCodes, // Show to user to save
      message: "Scan the QR code with your authenticator app, then verify with a code",
    });
  } catch (error) {
    console.error("MFA setup error:", error);
    return NextResponse.json(
      { error: "Failed to set up MFA" },
      { status: 500 }
    );
  }
}
