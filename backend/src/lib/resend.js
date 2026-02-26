import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_NAME = "Real-Time Chat App";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/**
 * Send verification email with link
 * @param {string} to - Recipient email
 * @param {string} verificationUrl - Full URL for verification (FRONTEND_URL/verify-email?token=TOKEN)
 * @returns {Promise<{ data?: object, error?: object }>}
 */
export async function sendVerificationEmail(to, verificationUrl) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set. Skipping verification email.");
    return { data: null, error: { message: "Email not configured" } };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: `Verify your email - ${APP_NAME}`,
    html: getVerificationEmailHtml(verificationUrl),
  });

  return { data, error };
}

function getVerificationEmailHtml(verificationUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #18181b;">${APP_NAME}</h1>
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #71717a;">Verify your email address to get started.</p>
        <p style="margin: 0 0 24px 0; font-size: 15px; color: #3f3f46; line-height: 1.6;">Click the button below to verify your email and activate your account. This link will expire in 1 hour.</p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
          <tr>
            <td>
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">Verify Email</a>
            </td>
          </tr>
        </table>
        <p style="margin: 0; font-size: 14px; color: #71717a;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="margin: 8px 0 0 0; font-size: 13px; word-break: break-all;"><a href="${verificationUrl}" style="color: #3b82f6;">${verificationUrl}</a></p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export default resend;
