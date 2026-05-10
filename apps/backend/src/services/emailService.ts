import nodemailer from "nodemailer";

// ===============================
// FORMAT NAME
// ===============================

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
// EMAIL TRANSPORTER
// ===============================

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",

    port: 465,

    secure: true,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// ===============================
// VERIFY EMAIL TRANSPORTER
// ===============================

export async function verifyEmailTransporter(): Promise<void> {
  try {
    const transporter = createTransporter();

    await transporter.verify();

    console.log("✅ Email transporter verified");
  } catch (error) {
    console.error("❌ Email transporter verification failed:", error);
  }
}

// ===============================
// SEND REGISTRATION OTP EMAIL
// ===============================

export const sendRegistrationOtpEmail = async (
  to: string,
  name: string,
  verificationCode: string
) => {
  const transporter = createTransporter();

  const displayName = toTitleCaseName(name);

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "SmartShop"}" <${process.env.EMAIL_FROM}>`,

      to,

      subject: "Registration OTP - SmartShop",

      html: `
        <div
          style="
            font-family: Arial;
            padding: 30px;
            background: #f5f5f5;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
            "
          >
            <div
              style="
                background: linear-gradient(135deg,#f97316,#9333ea);
                padding: 30px;
                text-align: center;
              "
            >
              <h1 style="color:white;">
                SmartShop Registration
              </h1>
            </div>

            <div style="padding:30px;">
              <p>
                Hello <strong>${displayName}</strong>,
              </p>

              <p>
                Your OTP code is:
              </p>

              <div
                style="
                  font-size: 42px;
                  font-weight: bold;
                  letter-spacing: 10px;
                  text-align:center;
                  margin: 30px 0;
                  color:#7c3aed;
                "
              >
                ${verificationCode}
              </div>

              <p>
                This OTP expires in 10 minutes.
              </p>

              <p>
                Please do not share this OTP.
              </p>
            </div>
          </div>
        </div>
      `,

      text: `
        Hello ${displayName},

        Your SmartShop OTP is:

        ${verificationCode}

        This OTP expires in 10 minutes.
      `,
    });

    console.log("✅ Registration OTP email sent");
    console.log(info);

    return info;
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
  const transporter = createTransporter();

  const displayName = toTitleCaseName(name);

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "SmartShop"}" <${process.env.EMAIL_FROM}>`,

      to,

      subject: "Password Reset OTP - SmartShop",

      html: `
        <div
          style="
            font-family: Arial;
            padding: 30px;
            background: #f5f5f5;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
            "
          >
            <div
              style="
                background: linear-gradient(135deg,#ec4899,#9333ea);
                padding: 30px;
                text-align: center;
              "
            >
              <h1 style="color:white;">
                Password Reset
              </h1>
            </div>

            <div style="padding:30px;">
              <p>
                Hello <strong>${displayName}</strong>,
              </p>

              <p>
                Your password reset OTP is:
              </p>

              <div
                style="
                  font-size: 42px;
                  font-weight: bold;
                  letter-spacing: 10px;
                  text-align:center;
                  margin: 30px 0;
                  color:#ec4899;
                "
              >
                ${verificationCode}
              </div>

              <p>
                This OTP expires in 10 minutes.
              </p>

              <p>
                If you did not request this, ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,

      text: `
        Hello ${displayName},

        Your Password Reset OTP is:

        ${verificationCode}

        This OTP expires in 10 minutes.
      `,
    });

    console.log("✅ Password reset OTP email sent");

    return info;
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
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "SmartShop"}" <${process.env.EMAIL_FROM}>`,

      to,

      subject: "Welcome to SmartShop 🎉",

      html: `
        <div
          style="
            font-family: Arial;
            padding: 30px;
            background: #f5f5f5;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
            "
          >
            <div
              style="
                background: linear-gradient(135deg,#f97316,#9333ea);
                padding: 30px;
                text-align: center;
              "
            >
              <h1 style="color:white;">
                Welcome to SmartShop 🎉
              </h1>
            </div>

            <div style="padding:30px;">
              <p>
                Hello <strong>${name}</strong>,
              </p>

              <p>
                Your account has been created successfully.
              </p>

              <p>
                Thank you for joining SmartShop.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("✅ Welcome email sent");

    return info;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw error;
  }
};