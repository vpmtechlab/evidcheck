"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";

// Internal only: scheduled by users.inviteUser / users.startRegistration.
// Never expose these publicly, or anyone could send branded mail to anyone.

/** Escapes text for safe interpolation into email HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Prints secrets in the mock log only when explicitly enabled for local dev. */
const LOG_MOCK_SECRETS = process.env.EMAIL_MOCK_LOG_SECRETS === "true";

export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    firstName: v.string(),
    tempPassword: v.string(),
    setupToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const firstName = escapeHtml(args.firstName);
    const email = escapeHtml(args.email);
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPass) {
      console.error("Email credentials NOT found in environment variables.");
      console.log(
        `[MOCK EMAIL] To: ${args.email}` +
          (LOG_MOCK_SECRETS ? `, Temp Password: ${args.tempPassword}, Setup token: ${args.setupToken}` : ""),
      );
      return { sent: false, error: "Email credentials missing" };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"EvidCheck Team" <${emailUser}>`,
      to: args.email,
      subject: "Welcome to EvidCheck - Your Login Credentials",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #188015;">Welcome to EvidCheck, ${firstName}!</h2>
          <p>You have been invited to join the EvidCheck compliance platform.</p>
          <p>Here are your temporary login credentials:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #e0e0e0; padding: 2px 5px; border-radius: 3px;">${escapeHtml(args.tempPassword)}</code></p>
          </div>
          <p>For security reasons, you will be required to <strong>change your password</strong> upon your first login.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://evidcheck.com'}/${args.setupToken ? `setup-password?token=${encodeURIComponent(args.setupToken)}` : 'login'}" 
             style="display: inline-block; background: #188015; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            ${args.setupToken ? 'Set Up Your Account' : 'Login to EvidCheck'}
          </a>
          <p style="margin-top: 30px; font-size: 0.8em; color: #777;">
            If you did not expect this invitation, please ignore this email.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${args.email}`);
      return { sent: true };
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      return { sent: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

export const sendOTPEmail = internalAction({
  args: {
    email: v.string(),
    firstName: v.string(),
    otpCode: v.string(),
  },
  handler: async (ctx, args) => {
    const firstName = escapeHtml(args.firstName);
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPass) {
      console.error("Email credentials NOT found in environment variables.");
      console.log(`[MOCK OTP EMAIL] To: ${args.email}` + (LOG_MOCK_SECRETS ? `, OTP: ${args.otpCode}` : ""));
      return { sent: false, error: "Email credentials missing" };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"EvidCheck Team" <${emailUser}>`,
      to: args.email,
      subject: "Your EvidCheck Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #188015;">Verify Your Account, ${firstName}!</h2>
          <p>Thank you for starting your registration with EvidCheck. Please use the following code to verify your email address:</p>
          <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #188015; margin: 0;">${escapeHtml(args.otpCode)}</p>
          </div>
          <p>This code will expire in 15 minutes. If you did not request this code, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 0.8em; color: #777;">
            &copy; ${new Date().getFullYear()} EvidCheck Compliance. All rights reserved.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${args.email}`);
      return { sent: true };
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      return { sent: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});
