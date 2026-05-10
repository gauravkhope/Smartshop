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

const otpDigitStyle =
  "display:inline-block;width:34px;height:44px;vertical-align:middle;line-height:44px;border-radius:12px;font-size:26px;font-weight:600;color:#ffffff;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.14);box-shadow:inset 0 1px 0 rgba(255,255,255,0.10),0 12px 24px rgba(0,0,0,0.24);text-shadow:0 0 14px rgba(255,255,255,0.22);";

const buildOtpCells = (verificationCode: string): string =>
  String(verificationCode)
    .split("")
    .map((digit, index) => {
      const spacer =
        index === 3
          ? '<td style="width:16px;font-size:0;line-height:0;">&nbsp;</td>'
          : "";

      return `${spacer}<td align="center" valign="middle" style="padding:0 4px;"><span style="${otpDigitStyle}">${digit}</span></td>`;
    })
    .join("");

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
    const digitsHtml = buildOtpCells(verificationCode);

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
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <title>SmartShop OTP</title>

  <style>

    *{
      margin:0;
      padding:0;
      box-sizing:border-box;
    }

    body{
      margin:0;
      padding:0;

      background:#05030d;

      font-family:
      Arial,
      Helvetica,
      sans-serif;
    }

    /* =========================
       BACKGROUND
    ========================== */

    .wrapper{

      width:100%;

      padding:26px 14px;

      background:

      radial-gradient(
        circle at 25% 16%,
        rgba(124,58,237,0.38),
        transparent 24%
      ),

      radial-gradient(
        circle at 75% 18%,
        rgba(236,72,153,0.28),
        transparent 24%
      ),

      radial-gradient(
        circle at 25% 80%,
        rgba(236,72,153,0.22),
        transparent 22%
      ),

      radial-gradient(
        circle at 75% 80%,
        rgba(124,58,237,0.24),
        transparent 22%
      ),

      linear-gradient(
        180deg,
         rgba(88, 6, 48, 0.768) 0%,
        #090612 100%
      );
    }

    /* =========================
       MAIN CARD
    ========================== */

    .card{

      width:100%;
      max-width:560px;

      margin:0 auto;

      border-radius:34px;

      overflow:hidden;

      position:relative;

      background:
      rgba(0, 0, 0, 0.115);

      border:
      1px solid rgba(255,255,255,0.12);

      box-shadow:
      0 24px 80px rgba(0,0,0,0.60);

      backdrop-filter:blur(18px);
      -webkit-backdrop-filter:blur(18px);
    }

    .card::before{

      content:"";

      position:absolute;
      inset:0;

      border-radius:34px;

      border:
      1px solid rgba(255,255,255,0.05);

      pointer-events:none;
    }

    /* =========================
       HEADER
    ========================== */

    .header{

      padding:44px 34px 24px;

      text-align:center;

      position:relative;
    }

   .brand{

  font-size:40px;
  font-weight:800;

  letter-spacing:1.5px;

  /* FALLBACK COLOR FOR UNSUPPORTED EMAIL CLIENTS */

  color:#f7c9d4;

  /* LUXURY GRADIENT */

  background:
  linear-gradient(
    135deg,
    #fff8f1 0%,
    #fde7dc 12%,
    #f7c9d4 30%,
    #f4aac4 48%,
    #d4bbef 72%,
    #b5a2d6 100%
  );

  /* GRADIENT TEXT */

  -webkit-background-clip:text;
  background-clip:text;

  -webkit-text-fill-color:transparent;

  /* SOFT LUXURY GLOW */

  text-shadow:
    0 0 6px rgba(192,132,252,0.18),
    0 0 14px rgba(236,72,153,0.10),
    0 2px 8px rgba(0,0,0,0.18);

  /* FONT RENDERING */

  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;

  font-family:
    "Segoe UI",
    Arial,
    sans-serif;
}
    .top-line{

      width:100%;
      height:1px;

      margin-top:26px;

      position:relative;

      background:
      linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.10),
        transparent
      );
    }

    .top-line::after{

      content:"";

      width:42px;
      height:2px;

      border-radius:999px;

      position:absolute;

      left:50%;
      top:-1px;

      transform:translateX(-50%);

      background:
      linear-gradient(
        90deg,
        #7c3aed,
        #ec4899
      );

      box-shadow:
      0 0 16px rgba(236,72,153,0.70);
    }

    /* =========================
       BODY
    ========================== */

    .body{

      padding:24px 32px 10px;
    }

    .small-heading{

      text-align:center;

      font-size:28px;
      font-weight:700;

      color:
      rgba(255,255,255,0.64);

      margin-bottom:34px;
    }

    .verification-label{

      font-size:16px;

      letter-spacing:6px;

      text-transform:uppercase;

      color: rgba(255, 255, 255, 0.549);

      margin-bottom:24px;
    }

    .main-heading{

      font-size:34px;
      font-weight:800;

      color:#ffffff;

      line-height:1.2;

      margin-bottom:28px;
    }

    .subtext{

      font-size:18px;

      line-height:1.9;

      color:
      rgba(255,255,255,0.62);
    }

    .subtext strong{
      color:orange;
    }

    /* =========================
       OTP BOX
    ========================== */

    .otp-section{

      padding:28px 24px 18px;
    }

    .otp-box{

      border-radius:30px;

      padding:36px 16px 28px;

      text-align:center;

      background:
      linear-gradient(
        135deg,
        rgba(76,29,149,0.95),
        rgba(236,72,153,0.92)
      );

      border:
      1px solid rgba(255,255,255,0.14);

      box-shadow:
      0 18px 50px rgba(124,58,237,0.28);
    }

    .otp-label{

      font-size:14px;

      letter-spacing:6px;

      text-transform:uppercase;

      color:
      rgba(255,255,255,0.82);

      margin-bottom:34px;
    }

    /* OTP ROW */

    .otp-row{

      text-align:center;

      font-size:0;

      white-space:nowrap;

    }

    /* OTP UNDERLINE */

    .otp-underlines{

      margin-top:26px;

      text-align:center;
    }

    .line{

      width:38px;
      height:4px;

      display:inline-block;

      margin:0 4px;

      border-radius:999px;

      background:
      rgba(255,255,255,0.34);
    }

    /* =========================
       INFO SECTION
    ========================== */

    .info-section{

      padding:16px 24px 28px;
    }

    .info-card{

      width:100%;

      border-radius:18px;

      padding:20px 24px;

      margin-bottom:18px;

      background:
      rgba(255,255,255,0.03);

      border:
      1px solid rgba(255,255,255,0.08);
    }

    .info-text{

      font-size:16px;

      line-height:1.8;

      color:
      rgba(255,255,255,0.72);
    }

    .info-text strong{

      color:#ff4fd8;
    }

    /* =========================
       FOOTER
    ========================== */

    .footer{

      padding:8px 24px 34px;

      text-align:center;
    }

    .footer-line{

      width:100%;
      height:1px;

      margin-bottom:26px;

      position:relative;

      background:
      linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.08),
        transparent
      );
    }

    .footer-line::after{

      content:"";

      width:44px;
      height:2px;

      border-radius:999px;

      position:absolute;

      left:50%;
      top:-1px;

      transform:translateX(-50%);

      background:
      linear-gradient(
        90deg,
        #7c3aed,
        #ec4899
      );

      box-shadow:
      0 0 16px rgba(236,72,153,0.70);
    }

    .footer-text{

      font-size:15px;

      line-height:1.9;

      color:
      rgba(255,255,255,0.42);
    }

    .footer-dots{

      margin-top:18px;
    }

    .footer-dot{

      width:12px;
      height:12px;

      display:inline-block;

      margin:0 6px;

      border-radius:50%;
    }

    .dot-purple{
      background:#7c3aed;
    }

    .dot-pink{
      background:#ec529f;
    }

    /* =========================
       MOBILE
    ========================== */

    @media only screen and (max-width:600px){

      .wrapper{
        padding:14px 10px 22px;
      }

      .card{
        border-radius:28px;
      }

      .header{
        padding:34px 22px 20px;
      }

      .brand{
        font-size:32px;
      }

      .body{
        padding:20px 22px 8px;
      }

      .small-heading{
        font-size:22px;
        margin-bottom:26px;
      }

      .verification-label{
        font-size:11px;
        letter-spacing:4px;
      }

      .main-heading{
        font-size:26px;
      }

      .subtext{
        font-size:15px;
        line-height:1.8;
      }

      .otp-section{
        padding:24px 18px 14px;
      }

      .otp-box{
        padding:26px 10px 22px;
      }

      .otp-label{
        font-size:12px;
        letter-spacing:4px;
        margin-bottom:24px;
      }

      /* SMALLER OTP DIGITS */

      .digit{

        width:32px;
        height:48px;

        line-height:58px;

        margin:0 2px;

        font-size:26px;

        border-radius:12px;
      }

      .line{
        width:26px;
        margin:0 2px;
      }

      .info-card{
        padding:18px 18px;
      }

      .info-text{
        font-size:14px;
      }

      .footer-text{
        font-size:13px;
      }

    }

  </style>
</head>

<body>

  <div class="wrapper">

    <div class="card">

      <!-- HEADER -->

      <div class="header">

        <div class="brand">
          SMARTSHOP
        </div>

        <div class="top-line"></div>

      </div>

      <!-- BODY -->

      <div class="body">

        <div class="small-heading">
          Registration OTP
        </div>

        <div class="verification-label">
          Secure Verification
        </div>

        <div class="main-heading">
          Verify your account
        </div>

        <div class="subtext">
          Hello <strong>${displayName}</strong>,<br/>
          Welcome to SmartShop. Use the secure verification code below to continue your authentication process.
        </div>

      </div>

      <!-- OTP -->

      <div class="otp-section">

        <div class="otp-box">

          <div class="otp-label">
            One-Time Passcode
          </div>

          <table
            class="otp-row"
            role="presentation"
            align="center"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="margin:0 auto;border-collapse:separate;border-spacing:0;white-space:nowrap;"
          >
            <tr>

            ${digitsHtml}

            </tr>
          </table>

          <div class="otp-underlines">

            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>

          </div>

        </div>

      </div>

      <!-- INFO -->

      <div class="info-section">

        <div class="info-card">

          <div class="info-text">
            Expires in <strong>10 minutes</strong> from the time it was sent
          </div>

        </div>

        <div class="info-card">

          <div class="info-text">
            Never share this code with anyone for security reasons
          </div>

        </div>

      </div>

      <!-- FOOTER -->

      <div class="footer">

        <div class="footer-line"></div>

        <div class="footer-text">
          © 2026 SmartShop. All rights reserved.
        </div>

        <div class="footer-text">
          E-Commerce Platform
        </div>

        <div class="footer-dots">

          <span class="footer-dot dot-purple"></span>
          <span class="footer-dot dot-pink"></span>
          <span class="footer-dot dot-purple"></span>

        </div>

      </div>

    </div>

  </div>

</body>
</html>
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
    const digitsHtml = buildOtpCells(verificationCode);
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
       <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <title>SmartShop OTP</title>

  <style>

    *{
      margin:0;
      padding:0;
      box-sizing:border-box;
    }

    body{
      margin:0;
      padding:0;

      background:#05030d;

      font-family:
      Arial,
      Helvetica,
      sans-serif;
    }

    /* =========================
       BACKGROUND
    ========================== */

    .wrapper{

      width:100%;

      padding:26px 14px;

      background:

      radial-gradient(
        circle at 25% 16%,
        rgba(124,58,237,0.38),
        transparent 24%
      ),

      radial-gradient(
        circle at 75% 18%,
        rgba(236,72,153,0.28),
        transparent 24%
      ),

      radial-gradient(
        circle at 25% 80%,
        rgba(236,72,153,0.22),
        transparent 22%
      ),

      radial-gradient(
        circle at 75% 80%,
        rgba(124,58,237,0.24),
        transparent 22%
      ),

      linear-gradient(
        180deg,
         rgba(88, 6, 48, 0.768) 0%,
        #090612 100%
      );
    }

    /* =========================
       MAIN CARD
    ========================== */

    .card{

      width:100%;
      max-width:560px;

      margin:0 auto;

      border-radius:34px;

      overflow:hidden;

      position:relative;

      background:
      rgba(0, 0, 0, 0.115);

      border:
      1px solid rgba(255,255,255,0.12);

      box-shadow:
      0 24px 80px rgba(0,0,0,0.60);

      backdrop-filter:blur(18px);
      -webkit-backdrop-filter:blur(18px);
    }

    .card::before{

      content:"";

      position:absolute;
      inset:0;

      border-radius:34px;

      border:
      1px solid rgba(255,255,255,0.05);

      pointer-events:none;
    }

    /* =========================
       HEADER
    ========================== */

    .header{

      padding:44px 34px 24px;

      text-align:center;

      position:relative;
    }

   .brand{

  font-size:40px;
  font-weight:800;

  letter-spacing:1.5px;

  /* FALLBACK COLOR FOR UNSUPPORTED EMAIL CLIENTS */

  color:#f7c9d4;

  /* LUXURY GRADIENT */

  background:
  linear-gradient(
    135deg,
    #fff8f1 0%,
    #fde7dc 12%,
    #f7c9d4 30%,
    #f4aac4 48%,
    #d4bbef 72%,
    #b5a2d6 100%
  );

  /* GRADIENT TEXT */

  -webkit-background-clip:text;
  background-clip:text;

  -webkit-text-fill-color:transparent;

  /* SOFT LUXURY GLOW */

  text-shadow:
    0 0 6px rgba(192,132,252,0.18),
    0 0 14px rgba(236,72,153,0.10),
    0 2px 8px rgba(0,0,0,0.18);

  /* FONT RENDERING */

  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;

  font-family:
    "Segoe UI",
    Arial,
    sans-serif;
}
    .top-line{

      width:100%;
      height:1px;

      margin-top:26px;

      position:relative;

      background:
      linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.10),
        transparent
      );
    }

    .top-line::after{

      content:"";

      width:42px;
      height:2px;

      border-radius:999px;

      position:absolute;

      left:50%;
      top:-1px;

      transform:translateX(-50%);

      background:
      linear-gradient(
        90deg,
        #7c3aed,
        #ec4899
      );

      box-shadow:
      0 0 16px rgba(236,72,153,0.70);
    }

    /* =========================
       BODY
    ========================== */

    .body{

      padding:24px 32px 10px;
    }

    .small-heading{

      text-align:center;

      font-size:28px;
      font-weight:700;

      color:
      rgba(255,255,255,0.64);

      margin-bottom:34px;
    }

    .verification-label{

      font-size:16px;

      letter-spacing:6px;

      text-transform:uppercase;

      color: rgba(255, 255, 255, 0.549);

      margin-bottom:24px;
    }

    .main-heading{

      font-size:34px;
      font-weight:800;

      color:#ffffff;

      line-height:1.2;

      margin-bottom:28px;
    }

    .subtext{

      font-size:18px;

      line-height:1.9;

      color:
      rgba(255,255,255,0.62);
    }

    .subtext strong{
      color:orange;
    }

    /* =========================
       OTP BOX
    ========================== */

    .otp-section{

      padding:28px 24px 18px;
    }

    .otp-box{

      border-radius:30px;

      padding:36px 16px 28px;

      text-align:center;

      background:
      linear-gradient(
        135deg,
        rgba(76,29,149,0.95),
        rgba(236,72,153,0.92)
      );

      border:
      1px solid rgba(255,255,255,0.14);

      box-shadow:
      0 18px 50px rgba(124,58,237,0.28);
    }

    .otp-label{

      font-size:14px;

      letter-spacing:6px;

      text-transform:uppercase;

      color:
      rgba(255,255,255,0.82);

      margin-bottom:34px;
    }

    /* OTP ROW */

    .otp-row{

      text-align:center;

      white-space:nowrap;

    }

    .digit{

      width:44px;
      height:54px;

      display:inline-block;

      vertical-align:top;

      line-height:64px;

      margin:0 4px;

      border-radius:12px;

      font-size:32px;
      font-weight:600;

      color:#ffffff;

      background:
      rgba(255,255,255,0.12);

      border:
      1px solid rgba(255,255,255,0.14);

      box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.10),
      0 12px 24px rgba(0,0,0,0.24);

      text-shadow:
      0 0 14px rgba(255,255,255,0.22);
    }

    /* OTP UNDERLINE */

    .otp-underlines{

      margin-top:26px;

      text-align:center;
    }

    .line{

      width:38px;
      height:4px;

      display:inline-block;

      margin:0 4px;

      border-radius:999px;

      background:
      rgba(255,255,255,0.34);
    }

    /* =========================
       INFO SECTION
    ========================== */

    .info-section{

      padding:16px 24px 28px;
    }

    .info-card{

      width:100%;

      border-radius:18px;

      padding:20px 24px;

      margin-bottom:18px;

      background:
      rgba(255,255,255,0.03);

      border:
      1px solid rgba(255,255,255,0.08);
    }

    .info-text{

      font-size:16px;

      line-height:1.8;

      color:
      rgba(255,255,255,0.72);
    }

    .info-text strong{

      color:#ff4fd8;
    }

    /* =========================
       FOOTER
    ========================== */

    .footer{

      padding:8px 24px 34px;

      text-align:center;
    }

    .footer-line{

      width:100%;
      height:1px;

      margin-bottom:26px;

      position:relative;

      background:
      linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.08),
        transparent
      );
    }

    .footer-line::after{

      content:"";

      width:44px;
      height:2px;

      border-radius:999px;

      position:absolute;

      left:50%;
      top:-1px;

      transform:translateX(-50%);

      background:
      linear-gradient(
        90deg,
        #7c3aed,
        #ec4899
      );

      box-shadow:
      0 0 16px rgba(236,72,153,0.70);
    }

    .footer-text{

      font-size:15px;

      line-height:1.9;

      color:
      rgba(255,255,255,0.42);
    }

    .footer-dots{

      margin-top:18px;
    }

    .footer-dot{

      width:12px;
      height:12px;

      display:inline-block;

      margin:0 6px;

      border-radius:50%;
    }

    .dot-purple{
      background:#7c3aed;
    }

    .dot-pink{
      background:#ec529f;
    }

    /* =========================
       MOBILE
    ========================== */

    @media only screen and (max-width:600px){

      .wrapper{
        padding:14px 10px 22px;
      }

      .card{
        border-radius:28px;
      }

      .header{
        padding:34px 22px 20px;
      }

      .brand{
        font-size:32px;
      }

      .body{
        padding:20px 22px 8px;
      }

      .small-heading{
        font-size:22px;
        margin-bottom:26px;
      }

      .verification-label{
        font-size:11px;
        letter-spacing:4px;
      }

      .main-heading{
        font-size:26px;
      }

      .subtext{
        font-size:15px;
        line-height:1.8;
      }

      .otp-section{
        padding:24px 18px 14px;
      }

      .otp-box{
        padding:26px 10px 22px;
      }

      .otp-label{
        font-size:12px;
        letter-spacing:4px;
        margin-bottom:24px;
      }

      /* SMALLER OTP DIGITS */

      .digit{

        width:32px;
        height:48px;

        line-height:58px;

        margin:0 2px;

        font-size:26px;

        border-radius:12px;
      }

      .line{
        width:26px;
        margin:0 2px;
      }

      .info-card{
        padding:18px 18px;
      }

      .info-text{
        font-size:14px;
      }

      .footer-text{
        font-size:13px;
      }

    }

  </style>
</head>

<body>

  <div class="wrapper">

    <div class="card">

      <!-- HEADER -->

      <div class="header">

        <div class="brand">
          SMARTSHOP
        </div>

        <div class="top-line"></div>

      </div>

      <!-- BODY -->

      <div class="body">

        <div class="small-heading">
          Password Reset OTP
        </div>

        <div class="verification-label">
          Secure Verification
        </div>

        <div class="main-heading">
          Verify your account
        </div>

        <div class="subtext">
          Hello <strong>${displayName}</strong>,<br/>
          Welcome to SmartShop. Use the secure verification code below to continue your authentication process.
        </div>

      </div>

      <!-- OTP -->

      <div class="otp-section">

        <div class="otp-box">

          <div class="otp-label">
            One-Time Passcode
          </div>

          <table
            class="otp-row"
            role="presentation"
            align="center"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="margin:0 auto;border-collapse:separate;border-spacing:0;white-space:nowrap;"
          >
            <tr>

            ${digitsHtml}

            </tr>
          </table>

          <div class="otp-underlines">

            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>

          </div>

        </div>

      </div>

      <!-- INFO -->

      <div class="info-section">

        <div class="info-card">

          <div class="info-text">
            Expires in <strong>10 minutes</strong> from the time it was sent
          </div>

        </div>

        <div class="info-card">

          <div class="info-text">
            Never share this code with anyone for security reasons
          </div>

        </div>

      </div>

      <!-- FOOTER -->

      <div class="footer">

        <div class="footer-line"></div>

        <div class="footer-text">
          © 2026 SmartShop. All rights reserved.
        </div>

        <div class="footer-text">
          E-Commerce Platform
        </div>

        <div class="footer-dots">

          <span class="footer-dot dot-purple"></span>
          <span class="footer-dot dot-pink"></span>
          <span class="footer-dot dot-purple"></span>

        </div>

      </div>

    </div>

  </div>

</body>
</html>
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
    const displayName = toTitleCaseName(name);

    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender,

      to: [
        {
          email: to,
          name: displayName,
        },
      ],

      subject: "Welcome to SmartShop 🎉",

      htmlContent: `
   <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<title>Welcome to SmartShop</title>

<style>

  body{
    margin:0;
    padding:0;

    background:#05030d;

    font-family:
    Arial,
    Helvetica,
    sans-serif;
  }

  table{
    border-spacing:0;
  }

  td{
    padding:0;
  }

  img{
    border:0;
  }

  .wrapper{
    width:100%;

    padding:26px 14px;

    background:

    radial-gradient(
      circle at 25% 16%,
      rgba(124,58,237,0.38),
      transparent 24%
    ),

    radial-gradient(
      circle at 75% 18%,
      rgba(236,72,153,0.28),
      transparent 24%
    ),

    radial-gradient(
      circle at 25% 80%,
      rgba(236,72,153,0.22),
      transparent 22%
    ),

    radial-gradient(
      circle at 75% 80%,
      rgba(124,58,237,0.24),
      transparent 22%
    ),

    linear-gradient(
      180deg,
      rgba(69, 9, 40, 0.768) 0%,
      #090612 100%
    );
  }

  .main{
    width:100%;
    max-width:580px;

    margin:0 auto;

    background:transparent;

    border-radius:30px;

    overflow:hidden;

    border:1px solid rgba(255,255,255,0.08);

    box-shadow:
    0 20px 60px rgba(0,0,0,0.45);
  }

  .top-line{

  width:100%;
  height:1px;

  margin-top:22px;

  position:relative;

  background:
  linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.10),
    transparent
  );
}

.top-line::after{

  content:"";

  width:46px;
  height:2px;

  border-radius:999px;

  position:absolute;

  left:50%;
  top:-1px;

  transform:translateX(-50%);

  background:
  linear-gradient(
    90deg,
    #7c3aed,
    #ec4899
  );

  box-shadow:
  0 0 14px rgba(236,72,153,0.55);
}

  /* =========================
     HEADER
  ========================== */

  .header{
    text-align:center;

    padding:40px 24px 30px;

    border-bottom:
    1px solid rgba(255,255,255,0.06);
  }

  .logo-icon{
    width:52px;
    height:52px;

    line-height:52px;

    margin:0 auto 18px;

    border-radius:16px;

    text-align:center;

    font-size:24px;

    background:
    linear-gradient(
      135deg,
      #7c3aed,
      #ec4899
    );

    color:#ffffff;

    font-weight:700;
  }

  .brand{

    font-size:32px;
    font-weight:800;

    letter-spacing:0.5px;

    color:#f9a6d1;

    text-shadow:
      0 2px 8px rgba(0,0,0,0.35),
      0 0 12px rgba(168,85,247,0.12);

    font-family:
      "Segoe UI",
      Arial,
      sans-serif;
  }

  /* =========================
     HERO
  ========================== */

  .hero{
    text-align:center;

    padding:46px 30px 34px;
  }

  .success-circle{
    width:100px;
    height:100px;

    line-height:100px;

    margin:0 auto 30px;

    border-radius:50%;

    font-size:42px;

    color:#ffffff;

    font-weight:bold;

    background:
    linear-gradient(
      135deg,
      #7c3aed,
      #ec4899
    );

    box-shadow:
    0 14px 40px rgba(124,58,237,0.32);
  }

  .welcome-label{

    font-size:16px;
    font-weight: 400;

    text-transform:uppercase;

    letter-spacing:4px;

    color:
    rgba(255, 255, 255, 0.462);

    margin-bottom:14px;
  }

  .hero-title{

    color:#ffffff;

    font-size:48px;
    font-weight:900;

    line-height:1.1;

    margin-bottom:22px;
  }
.hero-title span{

  /* FALLBACK COLOR */

  color:rgb(255, 192, 76);
}

  .hero-description{

    max-width:470px;

    margin:0 auto;

    color:
    rgba(255,255,255,0.62);

    font-size:15px;

    line-height:1.9;
  }

  .hero-description strong{
    color:orange;
  }

  /* =========================
     FEATURES
  ========================== */

  .features{
    padding:0 24px 20px;
  }

  .feature-card{

    background:#171125;

    border:
    1px solid rgba(255,255,255,0.08);

    border-radius:20px;

    padding:18px;

    margin-bottom:16px;
  }

  .feature-icon{

    width:44px;
    height:44px;

    line-height:44px;

    text-align:center;

    border-radius:14px;

    font-size:20px;

    margin-bottom:14px;

    background:
    linear-gradient(
      135deg,
      rgba(124,58,237,0.22),
      rgba(236,72,153,0.22)
    );

    color:#ffffff;
  }

  .feature-title{

    color:#ffffff;

    font-size:16px;
    font-weight:700;

    margin-bottom:8px;
  }

  .feature-text{

    color:
    rgba(255,255,255,0.58);

    font-size:14px;

    line-height:1.8;
  }

  /* =========================
     BUTTON
  ========================== */

  .cta-section{
    text-align:center;

    padding:10px 24px 40px;
  }

  .cta-button{

    display:inline-block;

    background:
    linear-gradient(
      135deg,
      #7c3aed,
      #ec4899
    );

    color:#ffffff !important;

    text-decoration:none;

    font-size:15px;
    font-weight:700;

    padding:18px 34px;

    border-radius:16px;

    box-shadow:
    0 14px 30px rgba(124,58,237,0.30);
  }

  /* =========================
     FOOTER
  ========================== */

  .footer{

    text-align:center;

    padding:28px 20px 34px;

    border-top:
    1px solid rgba(255,255,255,0.06);
  }
  .footer-line{

      width:100%;
      height:1px;

      margin-bottom:26px;

      position:relative;

      background:
      linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.08),
        transparent
      );
    }

    .footer-line::after{

      content:"";

      width:44px;
      height:2px;

      border-radius:999px;

      position:absolute;

      left:50%;
      top:-1px;

      transform:translateX(-50%);

      background:
      linear-gradient(
        90deg,
        #7c3aed,
        #ec4899
      );

      box-shadow:
      0 0 16px rgba(236,72,153,0.70);
    }

  .footer p{

    color:
    rgba(255,255,255,0.32);

    font-size:12px;

    line-height:1.9;

    margin:0;
  }

  /* =========================
     MOBILE
  ========================== */

  @media only screen and (max-width:600px){

    .hero{
      padding:38px 20px 28px;
    }

    .hero-title{
      font-size:36px;
    }

    .success-circle{
      width:84px;
      height:84px;
      line-height:84px;

      font-size:36px;
    }

    .brand{
      font-size:28px;
    }

  }

</style>
</head>

<body>

<div class="wrapper">

  <table
    class="main"
    align="center"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
  >

    <!-- HEADER -->

    <tr>
      <td class="header">


        <div class="brand">
          SmartShop
        </div>
<div class="top-line"></div>
      </td>
    </tr>

    <!-- HERO -->

    <tr>
      <td class="hero">

        <div class="success-circle">
          ✓
        </div>

        <div class="welcome-label">
          Account Created Successfully
        </div>

        <div class="hero-title">
          Welcome to <span>SmartShop</span>
        </div>

        <div class="hero-description">

          Hello <strong>${displayName}</strong>,<br><br>

          Your account has been successfully created and your
          premium shopping experience is now ready.

          Discover a modern AI-powered commerce platform designed
          for speed, luxury, personalization, and seamless shopping.

        </div>

      </td>
    </tr>

    <!-- FEATURES -->

    <tr>
      <td class="features">

        <div class="feature-card">

          <div class="feature-icon">
            ★
          </div>

          <div class="feature-title">
            Personalized Experience
          </div>

          <div class="feature-text">
            Smart recommendations and AI-powered product discovery
            tailored specifically for your shopping preferences.
          </div>

        </div>

        <div class="feature-card">

          <div class="feature-icon">
            🔒
          </div>

          <div class="feature-title">
            Secure & Protected
          </div>

          <div class="feature-text">
            Enterprise-grade authentication and advanced security
            systems keep your account and transactions protected.
          </div>

        </div>

        <div class="feature-card">

          <div class="feature-icon">
            ➜
          </div>

          <div class="feature-title">
            Seamless Shopping
          </div>

          <div class="feature-text">
            Experience ultra-fast browsing, premium UI interactions,
            and a smooth modern checkout experience.
          </div>

        </div>

      </td>
    </tr>

    <!-- CTA -->

    <tr>
      <td class="cta-section">

        <a href="#" class="cta-button">
          SHOP NOW →
        </a>

      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td class="footer">

        <div class="footer-line"></div>

        <p>© 2026 SmartShop. All rights reserved.</p>
        <p>E-Commerce Platform</p>

      </td>
    </tr>

  </table>

</div>

</body>
</html>

      `,
    });

    console.log("✅ Welcome email sent");

    return response;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw error;
  }
};