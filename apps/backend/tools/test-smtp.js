require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');

async function run() {
  const service = process.env.EMAIL_SERVICE;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  console.log('Using config:', { service, user, host, port });

  const transporter = service === 'gmail'
    ? nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
    : nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter verified ✔️');

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'SmartShop'}" <${user}>`,
      to: user,
      subject: 'SMTP test from SmartShop',
      text: 'If you received this, SMTP is working.'
    });

    console.log('Test email sent. MessageId:', info.messageId);
    try {
      const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
      if (preview) console.log('Preview URL:', preview);
    } catch (e) {}
  } catch (err) {
    console.error('SMTP test failed:', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

run();
