import nodemailer from "nodemailer";

const toTitleCaseName = (value: string): string =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

// Email transporter configuration
const createTransporter = () => {
  // Prioritize explicit SMTP settings to avoid service preset port conflicts
  // (Gmail service defaults to port 465 which may timeout on some networks)
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;

  if (smtpHost && smtpPort) {
    const port = parseInt(smtpPort, 10);
    return nodemailer.createTransport({
      host: smtpHost,
      port: port,
      secure: port === 465, // true for 465 (implicit TLS), false for 587 (STARTTLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Fallback to Gmail service if no explicit SMTP is configured
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Default SMTP configuration
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Verify transporter connectivity and auth
export async function verifyEmailTransporter(): Promise<void> {
  try {
    const transporter = createTransporter();

    // nodemailer transporters expose `verify()` to check connection/auth
    if (typeof (transporter as any).verify === "function") {
      await (transporter as any).verify();
      console.log("✅ Email transporter verified");
    } else {
      console.log("⚠️ Email transporter does not support verify()");
    }
  } catch (error) {
    console.error("Email transporter verification failed:", error);
    console.log("Skipping email verification in production deploy");
  }
}

// Send password reset verification code email
export const sendPasswordResetCodeEmail = async (
  to: string,
  name: string,
  verificationCode: string
) => {
  const transporter = createTransporter();
  const displayName = toTitleCaseName(name);

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "SmartShop"}" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Verification Code - SmartShop",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Code</h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hi <strong>${displayName}</strong>,
              </p>
              
              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password. Use the verification code below to complete the password reset:
              </p>

              <!-- Verification Code Box -->
              <div style="background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%); padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0;">
                <div style="font-size: 48px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </div>
              </div>

              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px; text-align: center;">
                Enter this code on the password reset page to continue.
              </p>

              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                  <strong>⚠️ Security Notice:</strong> This code will expire in 10 minutes. If you didn't request this, please ignore this email.
                </p>
              </div>

              <p style="font-size: 13px; color: #999; line-height: 1.6;">
                Never share this code with anyone. SmartShop support will never ask for your verification code.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                © 2025 SmartShop. All rights reserved.
              </p>
              <p style="font-size: 11px; color: #ccc; margin: 10px 0 0 0;">
                This is an automated email, please do not reply.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${displayName},

      We received a request to reset your password.

      Your verification code is: ${verificationCode}

      This code will expire in 10 minutes.

      If you didn't request this password reset, please ignore this email.

      Best regards,
      SmartShop Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log("Password reset code email sent:", info.messageId);

    // If using Ethereal in development, log preview URL
    try {
      const preview = (nodemailer as any).getTestMessageUrl
        ? (nodemailer as any).getTestMessageUrl(info)
        : null;
      if (preview) console.log("Preview URL:", preview);
    } catch {}

    return info;
  } catch (error: any) {
    console.error("Error sending password reset code email:", error);

    // If Gmail auth failed in development, automatically fall back to Ethereal test account
    if (process.env.NODE_ENV !== "production") {
      console.log("EAUTH detected — falling back to Ethereal test account for development emails");

      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        ...mailOptions,
        from: `"${process.env.EMAIL_FROM_NAME || "SmartShop (test)"}" <${testAccount.user}>`,
      });

      try {
        const preview = (nodemailer as any).getTestMessageUrl
          ? (nodemailer as any).getTestMessageUrl(info)
          : null;
        if (preview) console.log("Ethereal preview URL:", preview);
      } catch {}

      return info;
    }
    throw error;
  }
};

// Send registration OTP email with the same style as password reset email
export const sendRegistrationOtpEmail = async (
  to: string,
  name: string,
  verificationCode: string
) => {
  const transporter = createTransporter();
  const displayName = toTitleCaseName(name);

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "SmartShop"}" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Registration OTP on SmartShop",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration OTP on SmartShop</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Registration OTP on SmartShop</h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hi <strong>${displayName}</strong>,
              </p>
              
              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
                We received a request to create your SmartShop account. Use the OTP below to complete your registration:
              </p>

              <!-- Verification Code Box -->
              <div style="background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%); padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0;">
                <div style="font-size: 48px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </div>
              </div>

              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px; text-align: center;">
                Enter this OTP on the registration page to continue.
              </p>

              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                  <strong>⚠️ Security Notice:</strong> This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
                </p>
              </div>

              <p style="font-size: 13px; color: #999; line-height: 1.6;">
                Never share this OTP with anyone. SmartShop support will never ask for your OTP.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                © 2025 SmartShop. All rights reserved.
              </p>
              <p style="font-size: 11px; color: #ccc; margin: 10px 0 0 0;">
                This is an automated email, please do not reply.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${displayName},

      We received a request to create your SmartShop account.

      Your registration OTP is: ${verificationCode}

      This OTP will expire in 10 minutes.

      If you didn't request this registration, please ignore this email.

      Best regards,
      SmartShop Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    if (!info.accepted || info.accepted.length === 0) {
      throw new Error("SMTP server did not accept the OTP email recipient");
    }

    console.log("Registration OTP email sent:", info.messageId);
    return info;
  } catch (error: any) {
    console.error("Error sending registration OTP email:", error);

    // In development, fall back to Ethereal so registration OTPs still get delivered locally
    if (process.env.NODE_ENV !== "production") {
      try {
        console.log("Falling back to Ethereal test account for registration OTP (development)");
        const testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await testTransporter.sendMail({
          ...mailOptions,
          from: `"${process.env.EMAIL_FROM_NAME || "SmartShop (test)"}" <${testAccount.user}>`,
        });

        try {
          const preview = (nodemailer as any).getTestMessageUrl
            ? (nodemailer as any).getTestMessageUrl(info)
            : null;
          if (preview) console.log("Ethereal preview URL (registration):", preview);
        } catch {}

        return info;
      } catch (ethError) {
        console.error("Ethereal fallback failed:", ethError);
      }
    }

    throw error;
  }
};

// Send password reset email (old token-based method - keeping for reference)
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetToken: string
) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "SmartShop"}" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request - SmartShop",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password for your SmartShop account. 
                Click the button below to create a new password:
              </p>

              <!-- Reset Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>

              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
                Or copy and paste this link into your browser:
              </p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; word-break: break-all; margin-bottom: 20px;">
                <a href="${resetUrl}" style="color: #f97316; font-size: 12px;">${resetUrl}</a>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for security reasons.
                </p>
              </div>

              <p style="font-size: 13px; color: #999; line-height: 1.6;">
                If you didn't request this password reset, please ignore this email. 
                Your password will remain unchanged.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                © 2025 SmartShop. All rights reserved.
              </p>
              <p style="font-size: 11px; color: #ccc; margin: 10px 0 0 0;">
                This is an automated email, please do not reply.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${name},

      We received a request to reset your password for your SmartShop account.

      Click the link below to create a new password:
      ${resetUrl}

      This link will expire in 1 hour for security reasons.

      If you didn't request this password reset, please ignore this email.

      Best regards,
      SmartShop Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (to: string, name: string) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "SmartShop"}" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to SmartShop! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SmartShop</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to SmartShop! 🎉</h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
                Thank you for joining SmartShop! We're excited to have you as part of our community.
              </p>

              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
                Your account has been successfully created. You can now:
              </p>

              <ul style="font-size: 14px; color: #666; line-height: 1.8;">
                <li>Browse thousands of products</li>
                <li>Add items to your wishlist</li>
                <li>Track your orders</li>
                <li>Get exclusive deals and offers</li>
              </ul>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
                   style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Start Shopping
                </a>
              </div>

              <p style="font-size: 13px; color: #999; line-height: 1.6;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                © 2025 SmartShop. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${name},

      Welcome to SmartShop! 

      Your account has been successfully created. Start shopping now!

      Visit: ${process.env.FRONTEND_URL || "http://localhost:3000"}

      Best regards,
      SmartShop Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (
  to: string,
  name: string,
  orderId: number,
  orderTotal: number
) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "SmartShop"}" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order Confirmation #${orderId} - SmartShop`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <div style="background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
            </div>

            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
                Thank you for your order! We've received it and will process it shortly.
              </p>

              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 14px; color: #666; margin: 5px 0;">
                  <strong>Order ID:</strong> #${orderId}
                </p>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">
                  <strong>Total:</strong> $${orderTotal.toFixed(2)}
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/profile/orders" 
                   style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Track Order
                </a>
              </div>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                © 2025 SmartShop. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
};
