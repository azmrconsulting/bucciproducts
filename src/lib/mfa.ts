import * as OTPAuth from "otpauth";
import crypto from "crypto";
import QRCode from "qrcode";

const ISSUER = "Bucci Products";

/**
 * Generate a new TOTP secret for MFA setup
 * @returns Base32-encoded secret
 */
export function generateTOTPSecret(): string {
  // Generate a random secret using OTPAuth's built-in method
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

/**
 * Create a TOTP instance for verification
 */
function createTOTP(secret: string, email: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

/**
 * Verify a TOTP code
 * @param secret Base32-encoded secret
 * @param code 6-digit code from authenticator app
 * @param email User's email (for TOTP label)
 * @returns True if code is valid
 */
export function verifyTOTPCode(secret: string, code: string, email: string): boolean {
  const totp = createTOTP(secret, email);

  // Validate with a window of 1 (allows codes from previous and next period)
  const delta = totp.validate({ token: code, window: 1 });

  return delta !== null;
}

/**
 * Generate the TOTP URI for authenticator apps
 * @param secret Base32-encoded secret
 * @param email User's email
 * @returns otpauth:// URI
 */
export function generateTOTPUri(secret: string, email: string): string {
  const totp = createTOTP(secret, email);
  return totp.toString();
}

/**
 * Generate a QR code data URL for the TOTP URI
 * @param uri TOTP URI
 * @returns Base64 data URL of QR code image
 */
export async function generateQRCode(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 256,
    color: {
      dark: "#c9a962", // Gold color
      light: "#0a0a0a", // Black background
    },
  });
}

/**
 * Generate backup codes for MFA recovery
 * @param count Number of backup codes to generate (default: 10)
 * @returns Array of {code, hash} objects
 */
export function generateBackupCodes(count: number = 10): { codes: string[]; hashes: string[] } {
  const codes: string[] = [];
  const hashes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate an 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const formattedCode = `${code.slice(0, 4)}-${code.slice(4)}`;

    // Hash the code for storage
    const hash = crypto.createHash("sha256").update(formattedCode).digest("hex");

    codes.push(formattedCode);
    hashes.push(hash);
  }

  return { codes, hashes };
}

/**
 * Verify a backup code
 * @param code Backup code entered by user
 * @param storedHashes Array of hashed backup codes from database
 * @returns Index of the used code, or -1 if not found
 */
export function verifyBackupCode(code: string, storedHashes: string[]): number {
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const formattedCode = normalizedCode.length === 8
    ? `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4)}`
    : code.toUpperCase();

  const inputHash = crypto.createHash("sha256").update(formattedCode).digest("hex");

  return storedHashes.findIndex((hash) => hash === inputHash);
}

/**
 * Simple encryption for storing MFA secret
 * Uses AES-256-GCM with a key derived from NEXTAUTH_SECRET
 */
const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for MFA encryption");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + encrypted into a single base64 string
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64");
}

export function decryptSecret(ciphertext: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(ciphertext, "base64");

  const iv = combined.subarray(0, 16);
  const authTag = combined.subarray(16, 32);
  const encrypted = combined.subarray(32);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
