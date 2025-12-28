import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

  try {
    const client = getResendClient();
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'Bucci Products <noreply@bucciproducts.com>',
      to: email,
      subject: 'Reset Your Password - Bucci Products',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, 'Times New Roman', serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 500px;">
                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding-bottom: 40px;">
                        <span style="font-size: 28px; font-weight: 600; letter-spacing: 0.25em; color: #c9a962;">BUCCI</span>
                        <br>
                        <span style="font-size: 10px; letter-spacing: 0.4em; color: rgba(245, 240, 232, 0.6);">HAIR CARE</span>
                      </td>
                    </tr>

                    <!-- Card -->
                    <tr>
                      <td style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.06); padding: 40px 30px;">
                        <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: normal; color: #f5f0e8; text-align: center;">
                          Reset Your Password
                        </h1>

                        <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.7; color: #888888; text-align: center;">
                          We received a request to reset your password. Click the button below to create a new password. This link will expire in 1 hour.
                        </p>

                        <!-- Button -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="padding: 10px 0 30px 0;">
                              <a href="${resetLink}"
                                 style="display: inline-block; padding: 16px 32px; background-color: #c9a962; color: #0a0a0a; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #555555; text-align: center;">
                          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>

                        <!-- Divider -->
                        <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.3), transparent); margin: 30px 0;"></div>

                        <p style="margin: 0; font-size: 11px; color: #555555; text-align: center;">
                          If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0 0; font-size: 11px; color: #c9a962; text-align: center; word-break: break-all;">
                          ${resetLink}
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td align="center" style="padding-top: 30px;">
                        <p style="margin: 0; font-size: 11px; color: #555555;">
                          &copy; ${new Date().getFullYear()} Bucci Products. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}
