import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';
import { z } from 'zod';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit';
import { sanitizeTextInput, containsXssPatterns } from '@/lib/sanitize';

// Rate limit: 5 messages per hour per IP
const contactRateLimit = { interval: 60 * 60 * 1000, maxRequests: 5 };

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  turnstileToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Rate limit contact form submissions
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`contact:${clientIp}`, contactRateLimit);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, contactRateLimit.maxRequests),
        }
      );
    }

    const body = await req.json();

    // Validate the data
    const validatedData = contactSchema.parse(body);

    // SECURITY: Verify CAPTCHA token
    const captchaResult = await verifyTurnstileToken(validatedData.turnstileToken);
    if (!captchaResult.success) {
      return NextResponse.json(
        { error: captchaResult.error || 'CAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // SECURITY: Sanitize inputs and check for XSS
    const sanitizedData = {
      name: sanitizeTextInput(validatedData.name, 100),
      email: validatedData.email, // Email is validated by Zod
      subject: sanitizeTextInput(validatedData.subject, 200),
      message: sanitizeTextInput(validatedData.message, 2000),
    };

    // Check for suspicious patterns
    if (containsXssPatterns(sanitizedData.name) ||
        containsXssPatterns(sanitizedData.subject) ||
        containsXssPatterns(sanitizedData.message)) {
      console.warn('[SECURITY] XSS pattern detected in contact form submission');
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Send the email
    const result = await sendContactEmail(sanitizedData);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Message sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
