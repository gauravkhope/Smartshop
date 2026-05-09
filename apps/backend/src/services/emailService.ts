import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

// ===============================
// SEND REGISTRATION OTP EMAIL
// ===============================

export const sendRegistrationOtpEmail = async (
  to: string,
  name: string,
  verificationCode: string
) => {
  const displayName = toTitleCaseName(name);

  try {
    console.log("=================================");
    console.log("RESEND API KEY:", process.env.RESEND_API_KEY);
    console.log("EMAIL FROM:", process.env.EMAIL_FROM);
    console.log("Sending Registration OTP to:", to);
    console.log("=================================");

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject: "Registration OTP - SmartShop",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h1>Welcome to SmartShop</h1>

          <p>Hello <strong>${displayName}</strong>,</p>

          <p>Your OTP code is:</p>

          <div
            style="
              font-size: 40px;
              font-weight: bold;
              letter-spacing: 10px;
              margin: 20px 0;
              color: #7c3aed;
            "
          >
            ${verificationCode}
          </div>

          <p>This OTP will expire in 10 minutes.</p>

          <p>Please do not share this OTP with anyone.</p>
        </div>
      `,
    });

    console.log("✅ RESEND RESPONSE:", response);
    console.log("✅ Registration OTP email sent");

    return response;
  } catch (error) {
    console.error("❌ Error sending registration OTP email:", error);
    throw error;
  }
};

// ===============================
// SEND PASSWORD RESET OTP EMAIL
// ===============================

export const sendPasswordResetCodeEmail = async (
  to: string,
  name: string,
  verificationCode: string
) => {
  const displayName = toTitleCaseName(name);

  try {
    console.log("=================================");
    console.log("Sending Password Reset OTP to:", to);
    console.log("=================================");

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject: "Password Reset OTP - SmartShop",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h1>Password Reset</h1>

          <p>Hello <strong>${displayName}</strong>,</p>

          <p>Your password reset OTP is:</p>

          <div
            style="
              font-size: 40px;
              font-weight: bold;
              letter-spacing: 10px;
              margin: 20px 0;
              color: #ec4899;
            "
          >
            ${verificationCode}
          </div>

          <p>This OTP will expire in 10 minutes.</p>

          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    console.log("✅ RESEND RESPONSE:", response);
    console.log("✅ Password reset OTP email sent");

    return response;
  } catch (error) {
    console.error("❌ Error sending password reset OTP email:", error);
    throw error;
  }
};

// ===============================
// SEND WELCOME EMAIL
// ===============================

export const sendWelcomeEmail = async (
  to: string,
  name: string
) => {
  try {
    console.log("=================================");
    console.log("Sending Welcome Email to:", to);
    console.log("=================================");

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject: "Welcome to SmartShop 🎉",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h1>Welcome to SmartShop 🎉</h1>

          <p>Hello <strong>${name}</strong>,</p>

          <p>
            Your account has been successfully created.
          </p>

          <p>
            Thank you for joining SmartShop.
          </p>
        </div>
      `,
    });

    console.log("✅ RESEND RESPONSE:", response);
    console.log("✅ Welcome email sent");

    return response;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw error;
  }
};