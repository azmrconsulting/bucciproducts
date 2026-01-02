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
const adminEmail = process.env.ADMIN_EMAIL || 'admin@bucciproducts.com';

// Types for order emails
interface OrderItem {
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

interface ShippingAddress {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface OrderEmailData {
  orderNumber: string;
  email: string;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  discountCents?: number;
  taxCents: number;
  totalCents: number;
  shippingAddress: ShippingAddress;
}

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

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
        <span style="color: #f5f0e8; font-size: 14px;">${item.name}</span>
        <span style="color: #888888; font-size: 13px;"> x ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06); text-align: right;">
        <span style="color: #f5f0e8; font-size: 14px;">${formatPrice(item.totalCents)}</span>
      </td>
    </tr>
  `).join('');

  const shippingAddressHtml = order.shippingAddress.line1 ? `
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #888888;">
      ${order.shippingAddress.name || ''}<br>
      ${order.shippingAddress.line1}${order.shippingAddress.line2 ? '<br>' + order.shippingAddress.line2 : ''}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
      ${order.shippingAddress.country}
    </p>
  ` : '<p style="margin: 0; font-size: 14px; color: #888888;">Address pending</p>';

  try {
    const client = getResendClient();
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'Bucci Products <noreply@bucciproducts.com>',
      to: order.email,
      subject: `Order Confirmed - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, 'Times New Roman', serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px;">
                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding-bottom: 40px;">
                        <span style="font-size: 28px; font-weight: 600; letter-spacing: 0.25em; color: #c9a962;">BUCCI</span>
                        <br>
                        <span style="font-size: 10px; letter-spacing: 0.4em; color: rgba(245, 240, 232, 0.6);">HAIR CARE</span>
                      </td>
                    </tr>

                    <!-- Success Icon -->
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background-color: rgba(34, 197, 94, 0.1); display: inline-block; line-height: 60px; text-align: center;">
                          <span style="color: #22c55e; font-size: 30px;">✓</span>
                        </div>
                      </td>
                    </tr>

                    <!-- Card -->
                    <tr>
                      <td style="background-color: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.06); padding: 40px 30px;">
                        <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: normal; color: #f5f0e8; text-align: center;">
                          Thank You for Your Order!
                        </h1>
                        <p style="margin: 0 0 30px 0; font-size: 14px; color: #888888; text-align: center;">
                          Order ${order.orderNumber}
                        </p>

                        <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.7; color: #888888; text-align: center;">
                          We've received your order and are preparing it for shipment. You'll receive another email when it's on its way.
                        </p>

                        <!-- Order Items -->
                        <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #c9a962; letter-spacing: 0.1em; text-transform: uppercase;">
                          Order Details
                        </h2>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                          ${itemsHtml}
                        </table>

                        <!-- Totals -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                          <tr>
                            <td style="padding: 8px 0; color: #888888; font-size: 14px;">Subtotal</td>
                            <td style="padding: 8px 0; color: #f5f0e8; font-size: 14px; text-align: right;">${formatPrice(order.subtotalCents)}</td>
                          </tr>
                          ${order.discountCents ? `
                          <tr>
                            <td style="padding: 8px 0; color: #22c55e; font-size: 14px;">Discount</td>
                            <td style="padding: 8px 0; color: #22c55e; font-size: 14px; text-align: right;">-${formatPrice(order.discountCents)}</td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 8px 0; color: #888888; font-size: 14px;">Shipping</td>
                            <td style="padding: 8px 0; color: #f5f0e8; font-size: 14px; text-align: right;">${order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #f5f0e8; font-size: 16px; font-weight: 600;">Total</td>
                            <td style="padding: 12px 0; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #c9a962; font-size: 18px; font-weight: 600; text-align: right;">${formatPrice(order.totalCents)}</td>
                          </tr>
                        </table>

                        <!-- Shipping Address -->
                        <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #c9a962; letter-spacing: 0.1em; text-transform: uppercase;">
                          Shipping To
                        </h2>
                        ${shippingAddressHtml}

                        <!-- Divider -->
                        <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.3), transparent); margin: 30px 0;"></div>

                        <!-- CTA -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center">
                              <a href="${baseUrl}/account/orders"
                                 style="display: inline-block; padding: 14px 28px; background-color: #c9a962; color: #0a0a0a; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;">
                                View Order Status
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td align="center" style="padding-top: 30px;">
                        <p style="margin: 0 0 10px 0; font-size: 13px; color: #888888;">
                          Questions? Reply to this email or contact us at hello@gobucci.com
                        </p>
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
      console.error('Failed to send order confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendAdminOrderNotification(order: OrderEmailData) {
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const itemsList = order.items.map(item =>
    `• ${item.name} x ${item.quantity} - ${formatPrice(item.totalCents)}`
  ).join('<br>');

  const shippingAddressText = order.shippingAddress.line1
    ? `${order.shippingAddress.name || ''}, ${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`
    : 'Address pending';

  try {
    const client = getResendClient();
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'Bucci Products <noreply@bucciproducts.com>',
      to: adminEmail,
      subject: `New Order! ${order.orderNumber} - ${formatPrice(order.totalCents)}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Order Notification</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, 'Times New Roman', serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 500px;">
                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <span style="font-size: 24px; font-weight: 600; letter-spacing: 0.25em; color: #c9a962;">BUCCI</span>
                        <span style="font-size: 10px; letter-spacing: 0.2em; color: rgba(245, 240, 232, 0.6);"> ADMIN</span>
                      </td>
                    </tr>

                    <!-- Card -->
                    <tr>
                      <td style="background-color: #0a0a0a; border: 1px solid rgba(201, 169, 98, 0.3); padding: 30px;">
                        <h1 style="margin: 0 0 5px 0; font-size: 20px; font-weight: normal; color: #22c55e;">
                          New Order Received!
                        </h1>
                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #c9a962;">
                          ${order.orderNumber}
                        </p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                          <tr>
                            <td style="padding: 8px 0; color: #888888; font-size: 13px; width: 100px;">Customer:</td>
                            <td style="padding: 8px 0; color: #f5f0e8; font-size: 13px;">${order.email}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #888888; font-size: 13px;">Total:</td>
                            <td style="padding: 8px 0; color: #c9a962; font-size: 16px; font-weight: 600;">${formatPrice(order.totalCents)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #888888; font-size: 13px; vertical-align: top;">Ship To:</td>
                            <td style="padding: 8px 0; color: #f5f0e8; font-size: 13px;">${shippingAddressText}</td>
                          </tr>
                        </table>

                        <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

                        <p style="margin: 0 0 10px 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 0.1em;">Items Ordered:</p>
                        <p style="margin: 0; font-size: 13px; color: #f5f0e8; line-height: 1.8;">
                          ${itemsList}
                        </p>

                        <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

                        <!-- CTA -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center">
                              <a href="${baseUrl}/admin/orders"
                                 style="display: inline-block; padding: 12px 24px; background-color: #c9a962; color: #0a0a0a; text-decoration: none; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;">
                                View in Admin
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td align="center" style="padding-top: 20px;">
                        <p style="margin: 0; font-size: 11px; color: #555555;">
                          This is an automated notification from Bucci Products
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
      console.error('Failed to send admin notification email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error };
  }
}

export async function sendEmailVerificationEmail(email: string, token: string) {
  const verifyLink = `${baseUrl}/auth/verify-email?token=${token}`;

  try {
    const client = getResendClient();
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'Bucci Products <noreply@bucciproducts.com>',
      to: email,
      subject: 'Verify Your Email - Bucci Products',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
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
                          Welcome to Bucci!
                        </h1>

                        <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.7; color: #888888; text-align: center;">
                          Thank you for creating an account. Please verify your email address by clicking the button below. This link will expire in 24 hours.
                        </p>

                        <!-- Button -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="padding: 10px 0 30px 0;">
                              <a href="${verifyLink}"
                                 style="display: inline-block; padding: 16px 32px; background-color: #c9a962; color: #0a0a0a; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;">
                                Verify Email
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #555555; text-align: center;">
                          If you didn't create an account with Bucci Products, you can safely ignore this email.
                        </p>

                        <!-- Divider -->
                        <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(201, 169, 98, 0.3), transparent); margin: 30px 0;"></div>

                        <p style="margin: 0; font-size: 11px; color: #555555; text-align: center;">
                          If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0 0; font-size: 11px; color: #c9a962; text-align: center; word-break: break-all;">
                          ${verifyLink}
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
      console.error('Failed to send email verification:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email verification:', error);
    return { success: false, error };
  }
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(formData: ContactFormData) {
  try {
    const client = getResendClient();
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'Bucci Products <noreply@bucciproducts.com>',
      to: adminEmail,
      replyTo: formData.email,
      subject: `Contact Form: ${formData.subject} - ${formData.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, 'Times New Roman', serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 500px;">
                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <span style="font-size: 24px; font-weight: 600; letter-spacing: 0.25em; color: #c9a962;">BUCCI</span>
                        <span style="font-size: 10px; letter-spacing: 0.2em; color: rgba(245, 240, 232, 0.6);"> CONTACT</span>
                      </td>
                    </tr>

                    <!-- Card -->
                    <tr>
                      <td style="background-color: #0a0a0a; border: 1px solid rgba(201, 169, 98, 0.3); padding: 30px;">
                        <h1 style="margin: 0 0 20px 0; font-size: 20px; font-weight: normal; color: #c9a962;">
                          New Contact Form Submission
                        </h1>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                          <tr>
                            <td style="padding: 8px 0; color: #888888; font-size: 13px; width: 80px;">From:</td>
                            <td style="padding: 8px 0; color: #f5f0e8; font-size: 13px;">${formData.name}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #888888; font-size: 13px;">Email:</td>
                            <td style="padding: 8px 0; color: #f5f0e8; font-size: 13px;">${formData.email}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #888888; font-size: 13px;">Subject:</td>
                            <td style="padding: 8px 0; color: #c9a962; font-size: 13px;">${formData.subject}</td>
                          </tr>
                        </table>

                        <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

                        <p style="margin: 0 0 10px 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 0.1em;">Message:</p>
                        <p style="margin: 0; font-size: 14px; color: #f5f0e8; line-height: 1.6; white-space: pre-wrap;">
                          ${formData.message}
                        </p>

                        <div style="height: 1px; background-color: rgba(255, 255, 255, 0.1); margin: 20px 0;"></div>

                        <p style="margin: 0; font-size: 12px; color: #888888;">
                          Reply directly to this email to respond to ${formData.name}.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td align="center" style="padding-top: 20px;">
                        <p style="margin: 0; font-size: 11px; color: #555555;">
                          This is an automated notification from Bucci Products
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
      console.error('Failed to send contact email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error };
  }
}
