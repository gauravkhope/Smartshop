# Gmail & Password Reset Testing Guide

## Step 1: Set Up Gmail App Password

### 1. Enable 2-Factor Authentication on your Google Account
1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the steps to enable 2FA (you'll need your phone)

### 2. Create an App Password
1. After enabling 2FA, go back to https://myaccount.google.com/security
2. Scroll down to "How you sign in to Google"
3. Click on "App passwords"
4. Click "Select app" → Choose "Mail"
5. Click "Select device" → Choose "Other (Custom name)"
6. Type "SmartShop" as the name
7. Click "Generate"
8. **Copy the 16-character password** (it will look like: abcd efgh ijkl mnop)

### 3. Update Your .env File
Open `apps/backend/.env` and update these values:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # The app password (remove spaces)
EMAIL_FROM_NAME="SmartShop"
FRONTEND_URL=http://localhost:3000
```

**Important:** Remove all spaces from the app password!

## Step 2: Restart Backend Server

### In Terminal/PowerShell:
```powershell
# Stop current backend (Ctrl+C)

# Navigate to backend directory
cd "c:\MEGA PROJECTS\EnterPrise Level E-Commerce\E-Commerce Project 1\ai-ecommerce-enterprise\apps\backend"

# Regenerate Prisma Client
npx prisma generate

# Start backend
npm run dev
```

The server should start at http://localhost:5555

## Step 3: Test Welcome Email (Registration)

### Option A: Using Frontend
1. Open http://localhost:3000/register
2. Fill in the registration form:
   - Name: Test User
   - Email: **YOUR EMAIL** (use your real email to receive the email)
   - Password: Test123
   - Confirm Password: Test123
3. Check "I agree to Terms & Conditions"
4. Click "Create Account"
5. **Check your email inbox** for the welcome email

### Option B: Using API (curl/Postman)
```powershell
# In PowerShell
curl -X POST http://localhost:5555/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"your-email@gmail.com\",\"password\":\"Test123\"}'
```

**Expected Result:**
- ✅ Account created successfully
- ✅ Welcome email received in inbox
- ✅ Email has gradient design with "Welcome to SmartShop" header

## Step 4: Test Forgot Password Flow

### Full Flow Test:

#### 4.1 Request Password Reset
1. Open http://localhost:3000/forgot-password
2. Enter your email address (the one you used for registration)
3. Click "Send Reset Instructions"
4. You should see a success message

#### 4.2 Check Email
1. Go to your email inbox
2. Look for email with subject: "Password Reset Request - SmartShop"
3. Open the email
4. You should see:
   - Beautiful gradient header
   - "Reset Password" button
   - The reset link
   - Security notice (1-hour expiration)

#### 4.3 Reset Password
1. Click the "Reset Password" button in the email
2. You'll be redirected to http://localhost:3000/reset-password?token=xxxxx
3. Enter new password: NewPass123
4. Confirm password: NewPass123
5. Click "Reset Password"
6. You should see success message and redirect to login

#### 4.4 Login with New Password
1. Go to http://localhost:3000/login
2. Use your email and the NEW password: NewPass123
3. You should be logged in successfully

### API Testing (Alternative):

#### 4.1 Request Reset Token
```powershell
# Request password reset
curl -X POST http://localhost:5555/api/auth/forgot-password `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"your-email@gmail.com\"}'
```

**Expected Response:**
```json
{
  "message": "If an account exists with this email, you will receive password reset instructions.",
  "resetToken": "abc123...xyz789"  // Copy this token for testing
}
```

#### 4.2 Reset Password with Token
```powershell
# Use the token from previous response
curl -X POST http://localhost:5555/api/auth/reset-password `
  -H "Content-Type: application/json" `
  -d '{\"token\":\"PASTE_TOKEN_HERE\",\"password\":\"NewPass123\"}'
```

**Expected Response:**
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

## Step 5: View Login History

1. Login to your account at http://localhost:3000/login
2. Click the hamburger menu (☰) in top right
3. Click "My Profile" → "Login History"
4. You should see:
   - All your login attempts
   - Device type (Desktop/Mobile/Tablet)
   - Browser used (Chrome/Firefox/Safari/Edge)
   - IP address
   - Timestamp ("Just now", "2 hours ago", etc.)
   - Current session badge on most recent login

## Troubleshooting

### Email Not Received?
1. **Check Spam Folder** - Gmail might filter it
2. **Check Backend Console** - Look for "Password reset email sent: <message-id>"
3. **Verify Email Settings** - Check .env file has correct EMAIL_USER and EMAIL_PASSWORD
4. **App Password Issues** - Make sure you're using App Password, not your regular Gmail password
5. **2FA Not Enabled** - You MUST enable 2-Factor Authentication first

### Error: "Invalid login: 535-5.7.8"
- You're using regular password instead of App Password
- Go back to Step 1 and create an App Password

### Error: "ECONNREFUSED"
- Backend server not running
- Check if port 5555 is available
- Restart backend server

### Error: "Invalid or expired reset token"
- Token has expired (1 hour limit)
- Request a new reset token
- Make sure you're copying the full token

### Backend Console Shows: "Error sending password reset email"
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Verify Gmail App Password is correct (no spaces)
- Make sure 2FA is enabled on Google account

## What You Should See

### Backend Console Logs:
```
Password reset token for your-email@gmail.com: abc123...xyz789
Password reset email sent: <message-id>
Welcome email sent: <message-id>
```

### Email Inbox:
1. **Welcome Email**:
   - Subject: "Welcome to SmartShop! 🎉"
   - Gradient header with welcome message
   - Feature list
   - "Start Shopping" button

2. **Password Reset Email**:
   - Subject: "Password Reset Request - SmartShop"
   - Gradient header
   - "Reset Password" button
   - Security warning about 1-hour expiration
   - Alternative reset link

### Frontend Success Messages:
- Registration: "User registered successfully"
- Forgot Password: "Password reset email sent!"
- Reset Password: "Password reset successful!"
- Login: Redirect to homepage

## Testing Checklist

- [ ] Gmail App Password created
- [ ] .env file updated with EMAIL_USER and EMAIL_PASSWORD
- [ ] Backend server restarted with Prisma generate
- [ ] Frontend server running on http://localhost:3000
- [ ] Created new account and received welcome email
- [ ] Requested password reset and received email
- [ ] Clicked reset link and changed password
- [ ] Logged in with new password successfully
- [ ] Viewed login history page

## Security Features to Verify

1. **Token Expiration**: Try using a reset token after 1 hour (should fail)
2. **One-Time Use**: Try using the same reset token twice (should fail)
3. **Email Privacy**: Request reset for non-existent email (should show same message)
4. **Login Tracking**: Each login should appear in login history
5. **Password Strength**: Try weak password (should show validation errors)

## Next Steps After Testing

Once everything works:
1. Keep your real Gmail credentials in .env (never commit!)
2. Test with multiple email addresses
3. Try different browsers to see different login history entries
4. Ready to move to Sprint 3: Cart & Checkout!

Need help? Check the EMAIL_SETUP.md file for more detailed configuration options.
