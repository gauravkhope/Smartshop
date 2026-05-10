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
    const digits = String(verificationCode).split("");
    const digitsHtml = digits
      .map((d, i) => {
        if (i === 3) {
          return '<div class="digit-gap"></div>' + `<div class="digit-card"><span class="digit-num">${d}</span></div>`;
        }
        return `<div class="digit-card"><span class="digit-num">${d}</span></div>`;
      })
      .join("");

    const dotsHtml = digits.map(() => `<div class="otp-dot"></div>`).join("");

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
          <title>SmartShop – Verify Your Account</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
              background: #060410;
              font-family: Arial, Helvetica, sans-serif;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 40px 16px;
            }

            .orb1 { position: fixed; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(124,58,237,0.45) 0%, transparent 70%); top: -100px; left: -80px; pointer-events: none; }
            .orb2 { position: fixed; width: 350px; height: 350px; border-radius: 50%; background: radial-gradient(circle, rgba(236,72,153,0.38) 0%, transparent 70%); bottom: -80px; right: -60px; pointer-events: none; }
            .orb3 { position: fixed; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%); top: 45%; right: 8%; pointer-events: none; }

            .scene { width: 100%; max-width: 560px; position: relative; }

            .card { position: relative; width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.13); border-radius: 28px; overflow: hidden; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
            .card-inner-border { position: absolute; inset: 0; border-radius: 28px; border: 1px solid rgba(255,255,255,0.08); pointer-events: none; z-index: 1; }

            .header { padding: 2.5rem 2rem 2rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.07); position: relative; }
            .header-shine { position: absolute; top: 0; left: 20%; right: 20%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent); }
            .logo-mark { display: inline-flex; align-items: center; gap: 10px; }
            .logo-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #ec4899); display: flex; align-items: center; justify-content: center; }
            .logo-icon svg { width: 20px; height: 20px; fill: none; stroke: #fff; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
            .brand-name { font-size: 26px; font-weight: 700; color: #fff; letter-spacing: 0.4px; }

            .body { padding: 0.5rem 2rem 0.75rem; }
            .greeting-label { font-size: 11px; letter-spacing: 3px; color: rgba(255,255,255,0.35); text-transform: uppercase; margin-bottom: 8px; }
            .heading { font-size: 26px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 1rem; }
            .smallheading {display: flex; justify-content: center;  font-size: 30px; font-weight: 600; color: rgba(255,255,255,0.6); line-height: 1.4; margin-bottom: 1rem; }
            .subtext { font-size: 14px; line-height: 1.8; color: rgba(255,255,255,0.5); }
            .subtext strong { color: rgba(255,255,255,0.9); font-weight: 600; }

            .divider { margin: 1.5rem 2rem; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); }

            .otp-section { padding: 0 2rem 0.5rem; display: flex; justify-content: center; }
            .otp-pill { width: 100%; position: relative; border-radius: 20px; padding: 1.75rem 1.5rem; text-align: center; background: linear-gradient(135deg, rgba(124,58,237,0.9), rgba(236,72,153,0.9)); border: 1px solid rgba(255,255,255,0.2); overflow: hidden; }
            .otp-pill-shine { position: absolute; top: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent); }
            .otp-label { font-size: 11px; letter-spacing: 3.5px; color: rgba(255,255,255,0.65); text-transform: uppercase; margin-bottom: 20px; }

            .otp-digits-row { display: flex; justify-content: center; align-items: center; gap: 8px; }
            .digit-gap { width: 14px; }

            .digit-card { width: 50px; height: 66px; position: relative; border-radius: 14px; background: rgba(255,255,255,0.12); border-top: 1px solid rgba(255,255,255,0.5); border-left: 1px solid rgba(255,255,255,0.25); border-right: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.04); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; transform: perspective(350px) rotateX(7deg) rotateY(-1deg); box-shadow: 0 1px 0 rgba(255,255,255,0.18) inset, 0 12px 28px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3); }
            .digit-num { font-size: 36px; font-weight: 700; color: #fff; font-family: 'Courier New', Courier, monospace; position: relative; z-index: 1; text-shadow: 0 1px 0 rgba(255,255,255,0.45), 0 -1px 0 rgba(0,0,0,0.5), 0 0 18px rgba(220,180,255,0.55), 0 4px 10px rgba(0,0,0,0.55); }

            .otp-underline { margin-top: 18px; display: flex; justify-content: center; gap: 6px; }
            .otp-dot { width: 28px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.3); }

            .info-section { padding: 1.25rem 2rem 1.75rem; display: flex; flex-direction: column; gap: 10px; }
            .info-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
            .info-text { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5; }

            .footer { border-top: 1px solid rgba(255,255,255,0.07); padding: 1.25rem 2rem; text-align: center; position: relative; }
            .footer-text { font-size: 12px; color: rgba(255,255,255,0.25); line-height: 1.9; }
            .footer-dots { display: flex; justify-content: center; gap: 5px; margin-top: 10px; }
            .footer-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.15); }
            .footer-dot.active { background: rgba(124,58,237,0.75); }
          </style>
        </head>
        <body>
          <div class="orb1"></div>
          <div class="orb2"></div>
          <div class="orb3"></div>

          <div class="scene">
            <div class="card">
              <div class="card-inner-border"></div>
              <div class="header">
                <div class="header-shine"></div>
                <div class="logo-mark">
                  <div class="logo-icon">
                    <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <span class="brand-name">SmartShop</span>
                </div>
              </div>

              <div class="body">
              <div class="smallheading">Registration OTP</div>
                <div class="greeting-label">Secure verification</div>
                <div class="heading">Verify your account</div>
                <div class="subtext">Hello <strong>${displayName}</strong>,<br/>Welcome to SmartShop. Use the secure verification code below to continue your authentication process.</div>
              </div>

              <div class="divider"></div>

              <div class="otp-section">
                <div class="otp-pill">
                  <div class="otp-pill-shine"></div>
                  <div class="otp-label">One-time passcode</div>
                  <div class="otp-digits-row">
                    ${digitsHtml}
                  </div>
                  <div class="otp-underline">
                    ${dotsHtml}
                  </div>
                </div>
              </div>

              <div class="info-section">
                <div class="info-row"><div class="info-icon-wrap"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="info-text">Expires in <strong>10 minutes</strong> from the time it was sent</div></div>
                <div class="info-row"><div class="info-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="1" fill="rgba(255,255,255,0.7)" stroke="none"/><line x1="12" y1="12" x2="12" y2="15"/></svg></div><div class="info-text">Never share this code with anyone for security reasons</div></div>
              </div>

              <div class="footer"><div class="footer-text">© 2026 SmartShop. All rights reserved.</div><div class="footer-text">E-Commerce Platform</div><div class="footer-dots"><div class="footer-dot active"></div><div class="footer-dot"></div><div class="footer-dot"></div></div></div>
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
    const digits = String(verificationCode).split("");
    const digitsHtml = digits
      .map((d, i) => {
        if (i === 3) {
          return '<div class="digit-gap"></div>' + `<div class="digit-card"><span class="digit-num">${d}</span></div>`;
        }
        return `<div class="digit-card"><span class="digit-num">${d}</span></div>`;
      })
      .join("");

    const dotsHtml = digits.map(() => `<div class="otp-dot"></div>`).join('');
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
          <title>SmartShop – Verify Your Account</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
              background: #060410;
              font-family: Arial, Helvetica, sans-serif;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 40px 16px;
            }

            .orb1 { position: fixed; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(124,58,237,0.45) 0%, transparent 70%); top: -100px; left: -80px; pointer-events: none; }
            .orb2 { position: fixed; width: 350px; height: 350px; border-radius: 50%; background: radial-gradient(circle, rgba(236,72,153,0.38) 0%, transparent 70%); bottom: -80px; right: -60px; pointer-events: none; }
            .orb3 { position: fixed; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%); top: 45%; right: 8%; pointer-events: none; }

            .scene { width: 100%; max-width: 560px; position: relative; }

            .card { position: relative; width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.13); border-radius: 28px; overflow: hidden; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
            .card-inner-border { position: absolute; inset: 0; border-radius: 28px; border: 1px solid rgba(255,255,255,0.08); pointer-events: none; z-index: 1; }

            .header { padding: 2.5rem 2rem 2rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.07); position: relative; }
            .header-shine { position: absolute; top: 0; left: 20%; right: 20%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent); }
            .logo-mark { display: inline-flex; align-items: center; gap: 10px; }
            .logo-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #ec4899); display: flex; align-items: center; justify-content: center; }
            .logo-icon svg { width: 20px; height: 20px; fill: none; stroke: #fff; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
            .brand-name { font-size: 26px; font-weight: 700; color: #fff; letter-spacing: 0.4px; }

            .body { padding: 0.5rem 2rem 0.75rem; }
            .greeting-label { font-size: 11px; letter-spacing: 3px; color: rgba(255,255,255,0.35); text-transform: uppercase; margin-bottom: 8px; }
            .heading { font-size: 26px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 1rem; }
            .smallheading {display: flex; justify-content: center;  font-size: 30px; font-weight: 600; color: rgba(255,255,255,0.6); line-height: 1.4; margin-bottom: 1rem; }
            .subtext { font-size: 14px; line-height: 1.8; color: rgba(255,255,255,0.5); }
            .subtext strong { color: rgba(255,255,255,0.9); font-weight: 600; }

            .divider { margin: 1.5rem 2rem; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); }

            .otp-section { padding: 0 2rem 0.5rem; display: flex; justify-content: center; }
            .otp-pill { width: 100%; position: relative; border-radius: 20px; padding: 1.75rem 1.5rem; text-align: center; background: linear-gradient(135deg, rgba(124,58,237,0.9), rgba(236,72,153,0.9)); border: 1px solid rgba(255,255,255,0.2); overflow: hidden; }
            .otp-pill-shine { position: absolute; top: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent); }
            .otp-label { font-size: 11px; letter-spacing: 3.5px; color: rgba(255,255,255,0.65); text-transform: uppercase; margin-bottom: 20px; }

            .otp-digits-row { display: flex; justify-content: center; align-items: center; gap: 8px; }
            .digit-gap { width: 14px; }

            .digit-card { width: 50px; height: 66px; position: relative; border-radius: 14px; background: rgba(255,255,255,0.12); border-top: 1px solid rgba(255,255,255,0.5); border-left: 1px solid rgba(255,255,255,0.25); border-right: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.04); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; transform: perspective(350px) rotateX(7deg) rotateY(-1deg); box-shadow: 0 1px 0 rgba(255,255,255,0.18) inset, 0 12px 28px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3); }
            .digit-num { font-size: 36px; font-weight: 700; color: #fff; font-family: 'Courier New', Courier, monospace; position: relative; z-index: 1; text-shadow: 0 1px 0 rgba(255,255,255,0.45), 0 -1px 0 rgba(0,0,0,0.5), 0 0 18px rgba(220,180,255,0.55), 0 4px 10px rgba(0,0,0,0.55); }

            .otp-underline { margin-top: 18px; display: flex; justify-content: center; gap: 6px; }
            .otp-dot { width: 28px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.3); }

            .info-section { padding: 1.25rem 2rem 1.75rem; display: flex; flex-direction: column; gap: 10px; }
            .info-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
            .info-text { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5; }

            .footer { border-top: 1px solid rgba(255,255,255,0.07); padding: 1.25rem 2rem; text-align: center; position: relative; }
            .footer-text { font-size: 12px; color: rgba(255,255,255,0.25); line-height: 1.9; }
            .footer-dots { display: flex; justify-content: center; gap: 5px; margin-top: 10px; }
            .footer-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.15); }
            .footer-dot.active { background: rgba(124,58,237,0.75); }
          </style>
        </head>
        <body>
          <div class="orb1"></div>
          <div class="orb2"></div>
          <div class="orb3"></div>

          <div class="scene">
            <div class="card">
              <div class="card-inner-border"></div>
              <div class="header">
                <div class="header-shine"></div>
                <div class="logo-mark">
                  <div class="logo-icon">
                    <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <span class="brand-name">SmartShop</span>
                </div>
              </div>

              <div class="body">
              <div class="smallheading">Password Reset OTP</div>
                <div class="greeting-label">Secure verification</div>
                <div class="heading">Verify your account</div>
                <div class="subtext">Hello <strong>${displayName}</strong>,<br/>Use the secure verification code below to reset your password.</div>
              </div>

              <div class="divider"></div>

              <div class="otp-section">
                <div class="otp-pill">
                  <div class="otp-pill-shine"></div>
                  <div class="otp-label">One-time passcode</div>
                  <div class="otp-digits-row">
                    ${digitsHtml}
                  </div>
                  <div class="otp-underline">
                    ${dotsHtml}
                  </div>
                </div>
              </div>

              <div class="info-section">
                <div class="info-row"><div class="info-icon-wrap"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="info-text">Expires in <strong>10 minutes</strong> from the time it was sent</div></div>
                <div class="info-row"><div class="info-icon-wrap"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="1" fill="rgba(255,255,255,0.7)" stroke="none"/><line x1="12" y1="12" x2="12" y2="15"/></svg></div><div class="info-text">Never share this code with anyone for security reasons</div></div>
              </div>

              <div class="footer"><div class="footer-text">© 2026 SmartShop. All rights reserved.</div><div class="footer-text">E-Commerce Platform</div><div class="footer-dots"><div class="footer-dot active"></div><div class="footer-dot"></div><div class="footer-dot"></div></div></div>
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

    *{
      margin:0;
      padding:0;
      box-sizing:border-box;
    }

    body{
      background:#05030d;
      font-family:Arial, Helvetica, sans-serif;

      min-height:100vh;

      display:flex;
      justify-content:center;

      padding:60px 16px;

      overflow-x:hidden;
      overflow-y:auto;

      position:relative;
    }

    /* =========================
       BACKGROUND GLOW
    ========================== */

    .orb{
      position:fixed;
      border-radius:50%;
      filter:blur(40px);
      pointer-events:none;
      z-index:0;
    }

    .orb1{
      width:450px;
      height:450px;
      top:-120px;
      left:-120px;

      background:
      radial-gradient(circle,
      rgba(124,58,237,0.45),
      transparent 70%);
    }

    .orb2{
      width:380px;
      height:380px;
      right:-80px;
      bottom:-120px;

      background:
      radial-gradient(circle,
      rgba(236,72,153,0.35),
      transparent 70%);
    }

    .orb3{
      width:240px;
      height:240px;
      top:45%;
      right:8%;

      background:
      radial-gradient(circle,
      rgba(99,102,241,0.25),
      transparent 70%);
    }

    /* =========================
       MAIN CONTAINER
    ========================== */

    .scene{
      width:100%;
      max-width:580px;

      margin:auto;

      position:relative;
      z-index:2;
    }

    /* =========================
       CARD
    ========================== */

    .card{
      position:relative;

      background:
      rgba(255,255,255,0.05);

      border:
      1px solid rgba(255,255,255,0.10);

      border-radius:34px;

      overflow:hidden;

      backdrop-filter:blur(24px);
      -webkit-backdrop-filter:blur(24px);

      box-shadow:
      0 20px 80px rgba(0,0,0,0.45);
    }

    .card::before{
      content:"";

      position:absolute;
      inset:0;

      border-radius:34px;

      border:
      1px solid rgba(255,255,255,0.06);

      pointer-events:none;
    }

    /* =========================
       HEADER
    ========================== */

    .header{
      position:relative;

      padding:42px 32px 34px;

      text-align:center;

      border-bottom:
      1px solid rgba(255,255,255,0.06);
    }

    .header::before{
      content:"";

      position:absolute;
      top:0;
      left:20%;
      right:20%;

      height:1px;

      background:
      linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.35),
      transparent
      );
    }

    .logo{
      display:inline-flex;
      align-items:center;
      gap:12px;
    }

    .logo-icon{
      width:46px;
      height:46px;

      border-radius:14px;

      background:
      linear-gradient(
      135deg,
      #7c3aed,
      #ec4899
      );

      display:flex;
      align-items:center;
      justify-content:center;

      box-shadow:
      0 12px 30px rgba(124,58,237,0.35);
    }

    .logo-icon svg{
      width:22px;
      height:22px;

      stroke:#fff;
      fill:none;
      stroke-width:2;
    }

    .brand{
  position:relative;

  font-size:32px;
  font-weight:800;

  letter-spacing:0.5px;

  background:
  linear-gradient(
    135deg,
    rgba(255,255,255,0.98),
    rgba(216,180,254,0.92),
    rgba(249,168,212,0.88)
  );

  background-clip:text;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;

  text-shadow:
    0 2px 2px rgba(255,255,255,0.15),
    0 8px 20px rgba(0,0,0,0.45),
    0 0 20px rgba(255,255,255,0.10),
    0 0 40px rgba(168,85,247,0.20);

  filter:
    drop-shadow(0 10px 20px rgba(0,0,0,0.35));

  transform:
    perspective(500px)
    rotateX(8deg);

  transform-style:preserve-3d;
}

    /* =========================
       HERO
    ========================== */

    .hero{
      position:relative;

      padding:48px 34px 34px;

      text-align:center;
    }

    .hero-glow{
      position:absolute;

      width:280px;
      height:280px;

      border-radius:50%;

      background:
      radial-gradient(circle,
      rgba(255,255,255,0.12),
      transparent 70%);

      top:-60px;
      left:50%;

      transform:translateX(-50%);

      filter:blur(20px);

      pointer-events:none;
    }

    .success-badge{
      position:relative;

      width:110px;
      height:110px;

      margin:0 auto 30px;

      border-radius:50%;

      background:
      linear-gradient(
      135deg,
      rgba(124,58,237,0.95),
      rgba(236,72,153,0.95)
      );

      display:flex;
      align-items:center;
      justify-content:center;

      box-shadow:
      0 20px 60px rgba(124,58,237,0.35),
      inset 0 2px 4px rgba(255,255,255,0.35);
    }

    .success-badge::before{
      content:"";

      position:absolute;
      inset:8px;

      border-radius:50%;

      border:
      1px solid rgba(255,255,255,0.20);
    }

    .success-badge svg{
      width:48px;
      height:48px;

      stroke:#fff;
      fill:none;
      stroke-width:2.5;

      filter:
      drop-shadow(0 5px 15px rgba(255,255,255,0.25));
    }

    .welcome-label{
      font-size:11px;

      text-transform:uppercase;

      letter-spacing:4px;

      color:rgba(255,255,255,0.38);

      margin-bottom:14px;
    }

    .hero-title{
      color:#fff;

      font-size:52px;
      font-weight:900;

      line-height:1;

      letter-spacing:-2px;

      margin-bottom:20px;
    }

    .hero-title span{
      background:
      linear-gradient(
      135deg,
      #f1b38d 0%,
      #f4b0a8 12%,
      #ef5986 32%,
      #f74e6d 55%,
      #ac65f3 75%,
      #7e51e8 100%
      );

      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-description{
      max-width:470px;

      margin:0 auto;

      color:rgba(255,255,255,0.58);

      font-size:15px;

      line-height:1.9;
    }

    .hero-description strong{
      color:#fff;
    }

    /* =========================
       FEATURES
    ========================== */

    .features{
      padding:10px 34px 34px;

      display:flex;
      flex-direction:column;
      gap:14px;
    }

    .feature-card{
      display:flex;
      align-items:flex-start;
      gap:14px;

      padding:18px;

      border-radius:20px;

      background:
      rgba(255,255,255,0.04);

      border:
      1px solid rgba(255,255,255,0.08);

      backdrop-filter:blur(12px);
    }

    .feature-icon{
      width:48px;
      height:48px;

      flex-shrink:0;

      border-radius:14px;

      background:
      linear-gradient(
      135deg,
      rgba(124,58,237,0.25),
      rgba(236,72,153,0.25)
      );

      border:
      1px solid rgba(255,255,255,0.10);

      display:flex;
      align-items:center;
      justify-content:center;
    }

    .feature-icon svg{
      width:22px;
      height:22px;

      stroke:#fff;
      fill:none;
      stroke-width:2;
    }

    .feature-title{
      color:#fff;

      font-size:16px;
      font-weight:700;

      margin-bottom:6px;
    }

    .feature-text{
      color:rgba(255,255,255,0.55);

      font-size:14px;

      line-height:1.7;
    }

    /* =========================
       CTA
    ========================== */

    .cta-section{
      padding:0 34px 40px;

      text-align:center;
    }

    .cta-button{
      display:inline-flex;
      align-items:center;
      justify-content:center;

      gap:10px;

      width:100%;

      max-width:320px;

      padding:18px 24px;

      border-radius:18px;

      text-decoration:none;

      color:#fff;

      font-size:15px;
      font-weight:700;

      background:
      linear-gradient(
      135deg,
      #7c3aed,
      #ec4899
      );

      box-shadow:
      0 20px 40px rgba(124,58,237,0.35),
      inset 0 1px 1px rgba(255,255,255,0.25);
    }

    .cta-button svg{
      width:18px;
      height:18px;

      stroke:#fff;
      fill:none;
      stroke-width:2;
    }

    /* =========================
       FOOTER
    ========================== */

    .footer{
      border-top:
      1px solid rgba(255,255,255,0.06);

      text-align:center;

      padding:28px;
    }

    .footer p{
      color:rgba(255,255,255,0.28);

      font-size:12px;

      line-height:1.9;
    }

    /* =========================
       RESPONSIVE
    ========================== */

    @media(max-width:600px){

      .hero-title{
        font-size:40px;
      }

      .success-badge{
        width:90px;
        height:90px;
      }

      .success-badge svg{
        width:40px;
        height:40px;
      }

    }

  </style>
</head>

<body>

  <!-- BACKGROUND -->
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="orb orb3"></div>

  <!-- MAIN -->
  <div class="scene">

    <div class="card">

      <!-- HEADER -->
      <div class="header">

        <div class="logo">

          <div class="logo-icon">

            <svg viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>

          </div>

          <div class="brand">SmartShop</div>

        </div>

      </div>

      <!-- HERO -->
      <div class="hero">

        <div class="hero-glow"></div>

        <div class="success-badge">

          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>

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

      </div>

      <!-- FEATURES -->
      <div class="features">

        <div class="feature-card">

          <div class="feature-icon">

            <svg viewBox="0 0 24 24">
              <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>
            </svg>

          </div>

          <div>

            <div class="feature-title">
              Personalized Experience
            </div>

            <div class="feature-text">
              Smart recommendations and AI-powered product discovery
              tailored specifically for your shopping preferences.
            </div>

          </div>

        </div>

        <div class="feature-card">

          <div class="feature-icon">

            <svg viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>

          </div>

          <div>

            <div class="feature-title">
              Secure & Protected
            </div>

            <div class="feature-text">
              Enterprise-grade authentication and advanced security
              systems keep your account and transactions protected.
            </div>

          </div>

        </div>

        <div class="feature-card">

          <div class="feature-icon">

            <svg viewBox="0 0 24 24">
              <path d="M3 12h18"/>
              <path d="M12 3l9 9-9 9"/>
            </svg>

          </div>

          <div>

            <div class="feature-title">
              Seamless Shopping
            </div>

            <div class="feature-text">
              Experience ultra-fast browsing, premium UI interactions,
              and a smooth modern checkout experience.
            </div>

          </div>

        </div>

      </div>

      <!-- CTA -->
      <div class="cta-section">

        <a href="#" class="cta-button">

          SHOP NOW

          
            <path d="M5 12h14"/>
            <path d="M13 5l7 7-7 7"/>
          </svg>

        </a>

      </div>

      <!-- FOOTER -->
      <div class="footer">

        <p>© 2026 SmartShop. All rights reserved.</p>
        <p>E-Commerce Platform</p>

      </div>

    </div>

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