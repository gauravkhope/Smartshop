# Email Service Configuration Guide

This guide will help you set up email functionality for password resets, welcome emails, and order confirmations.

## Option 1: Gmail (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "SmartShop" as the name
4. Click Generate
5. Copy the 16-character password (no spaces)

### Step 3: Update .env File
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The app password from step 2
EMAIL_FROM_NAME="SmartShop"
FRONTEND_URL=http://localhost:3000
```

## Option 2: SendGrid (Recommended for Production)

### Step 1: Create SendGrid Account
1. Sign up at https://sendgrid.com/
2. Verify your email address
3. Create an API Key with "Mail Send" permissions

### Step 2: Install SendGrid Package
```bash
npm install @sendgrid/mail
```

### Step 3: Update emailService.ts
Replace the `createTransporter` function with SendGrid configuration.

### Step 4: Update .env File
```env
SENDGRID_API_KEY=your-api-key-here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME="SmartShop"
FRONTEND_URL=https://yourdomain.com
```

## Option 3: Custom SMTP Server

### Update .env File
```env
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM_NAME="SmartShop"
FRONTEND_URL=https://yourdomain.com
```

## Testing Email Functionality

### 1. Test Password Reset Email
```bash
# Use the forgot-password endpoint
curl -X POST http://localhost:5555/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. Test Welcome Email
Create a new account at http://localhost:3000/register

### 3. Check Console Logs
The backend will log:
- Email sent successfully: Message ID
- Reset tokens (for testing - remove in production)
- Any email errors

## Email Templates Included

### 1. Password Reset Email
- Beautiful gradient design matching your brand
- Secure reset link with 1-hour expiration
- Security notice
- Plain text alternative

### 2. Welcome Email
- Welcome message with CTA button
- List of available features
- Brand colors and styling

### 3. Order Confirmation Email (Ready for Sprint 3)
- Order ID and total
- Track order button
- Professional styling

## Security Best Practices

1. **Never commit real credentials** - Use environment variables
2. **Use App Passwords** - Don't use your actual Gmail password
3. **Enable 2FA** - Add extra security layer
4. **Expire tokens** - Reset tokens expire in 1 hour
5. **Rate limiting** - Prevent spam (implement in Sprint 3)

## Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
- Make sure you're using an App Password, not your regular Gmail password
- Enable "Less secure app access" (not recommended) OR use App Password

### Error: "ECONNREFUSED"
- Check your SMTP_HOST and SMTP_PORT
- Verify firewall isn't blocking port 587

### Error: "self signed certificate"
- Add `tls: { rejectUnauthorized: false }` to transporter config (dev only)

### Email not received
- Check spam folder
- Verify recipient email is correct
- Check backend console for errors
- Try with a different email provider

## For Production

1. Use a professional email service (SendGrid, AWS SES, Mailgun)
2. Set up SPF, DKIM, and DMARC records
3. Use a custom domain email address
4. Remove test mode console logs
5. Add email queue system (Bull, BullMQ)
6. Implement retry logic
7. Add email tracking/analytics

## Next Steps

After configuring email:
1. Test forgot password flow
2. Test registration flow
3. Update email templates with your branding
4. Add more email types (order confirmation, shipping updates)
5. Set up email templates in your email service dashboard
