import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY || "",
});

const toTitleCaseName = (value: string): string =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(" ");

const sender = {
  email: process.env.EMAIL_FROM || "gauravkhope31@gmail.com",
  name: process.env.EMAIL_FROM_NAME || "SmartShop",
};

export const verifyEmailTransporter = async (): Promise<void> => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is missing");
  }

  await brevo.account.getAccount();
  console.log("✅ Brevo API connection verified");
};

// ======================================
// REGISTRATION OTP
// ======================================

export const sendRegistrationOtpEmail = async (
  to: string,
  name: string,
  verificationCode: string
) => {
  const displayName = toTitleCaseName(name);

  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender,

      to: [
        {
          email: to,
          name: displayName,
        },
      ],

      subject: "Registration OTP - SmartShop",

      htmlContent: `
        <div style="font-family:Arial;padding:30px;">
          <h1>SmartShop Registration</h1>

          <p>Hello <strong>${displayName}</strong>,</p>

          <p>Your OTP code is:</p>

          <div
            style="
              font-size:42px;
              font-weight:bold;
              letter-spacing:10px;
              color:#7c3aed;
              margin:20px 0;
            "
          >
            ${verificationCode}
          </div>

          <p>This OTP expires in 10 minutes.</p>
        </div>
      `,
    });

    console.log("✅ Registration OTP email sent");

    return response;
  } catch (error) {
    console.error("❌ Error sending registration OTP email:", error);
    throw error;
  }
};

// ======================================
// PASSWORD RESET OTP
// ======================================

export const sendPasswordResetCodeEmail = async (
  to: string,
  name: string,
  verificationCode: string
) => {
  const displayName = toTitleCaseName(name);

  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender,

      to: [
        {
          email: to,
          name: displayName,
        },
      ],

      subject: "Password Reset OTP - SmartShop",

      htmlContent: `
        <div style="font-family:Arial;padding:30px;">
          <h1>Password Reset</h1>

          <p>Hello <strong>${displayName}</strong>,</p>

          <p>Your password reset OTP is:</p>

          <div
            style="
              font-size:42px;
              font-weight:bold;
              letter-spacing:10px;
              color:#ec4899;
              margin:20px 0;
            "
          >
            ${verificationCode}
          </div>

          <p>This OTP expires in 10 minutes.</p>
        </div>
      `,
    });

    console.log("✅ Password reset OTP email sent");

    return response;
  } catch (error) {
    console.error("❌ Error sending password reset OTP email:", error);
    throw error;
  }
};

// ======================================
// WELCOME EMAIL
// ======================================

export const sendWelcomeEmail = async (
  to: string,
  name: string
) => {
  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender,

      to: [
        {
          email: to,
          name,
        },
      ],

      subject: "Welcome to SmartShop 🎉",

      htmlContent: `
        <div style="font-family:Arial;padding:30px;">
          <h1>Welcome to SmartShop 🎉</h1>

          <p>Hello <strong>${name}</strong>,</p>

          <p>Your account was created successfully.</p>

          <p>Thank you for joining SmartShop.</p>
        </div>
      `,
    });

    console.log("✅ Welcome email sent");

    return response;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw error;
  }
};