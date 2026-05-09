import { Redis } from "@upstash/redis";

// Initialize Redis client with Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Validate Redis connection on startup
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("⚠️ Warning: Upstash Redis environment variables not configured");
}

// Type definitions
export interface OtpData {
  name: string;
  otp: string;
  attempts: number;
  verified: boolean;
}

export interface OtpVerifyResult {
  status:
    | "verified"
    | "invalid"
    | "max_attempts"
    | "blocked"
    | "not_found"
    | "already_used";
  otpData?: OtpData;
  remainingAttempts?: number;
}

export interface PasswordResetData {
  userId: number;
  code: string;
  verified: boolean;
}

// Constants
const OTP_EXPIRY_SECONDS = 10 * 60; // 10 minutes
const LOGIN_BLOCK_SECONDS = 10 * 60; // 10 minutes
const MAX_OTP_ATTEMPTS = 3;
const MAX_OTP_REQUESTS = 3;
const MAX_LOGIN_ATTEMPTS = 3;
const OTP_KEY_PREFIX = "otp:";
const RATE_KEY_PREFIX = "rate:";
const BLOCK_KEY_PREFIX = "block:";
const LOGIN_ATTEMPT_KEY_PREFIX = "login-attempts:";
const LOGIN_BLOCK_KEY_PREFIX = "login-block:";
const PASSWORD_RESET_KEY_PREFIX = "password-reset:";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const getOtpKey = (email: string): string => `${OTP_KEY_PREFIX}${normalizeEmail(email)}`;
const getRateKey = (email: string): string => `${RATE_KEY_PREFIX}${normalizeEmail(email)}`;
const getBlockKey = (email: string): string => `${BLOCK_KEY_PREFIX}${normalizeEmail(email)}`;
const getLoginAttemptKey = (email: string): string => `${LOGIN_ATTEMPT_KEY_PREFIX}${normalizeEmail(email)}`;
const getLoginBlockKey = (email: string): string => `${LOGIN_BLOCK_KEY_PREFIX}${normalizeEmail(email)}`;

function parseRedisObject<T extends object>(
  value: unknown
): Partial<T> {
  if (!value) {
    return {};
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Partial<T>;
    } catch {
      return {};
    }
  }

  if (typeof value === "object") {
    return value as Partial<T>;
  }

  return {};
}

/**
 * Store OTP in Redis with 10-minute expiry
 * @param email - User email (will be normalized)
 * @param name - User name
 * @param otp - 6-digit OTP
 */
export async function storeOtp(
  email: string,
  name: string,
  otp: string
): Promise<void> {
  try {
    const key = getOtpKey(email);

    const otpData: OtpData = {
      name,
      otp,
      attempts: 0,
      verified: false,
    };

    // Set with expiry using EX (expire in seconds)
    await redis.setex(key, OTP_EXPIRY_SECONDS, JSON.stringify(otpData));
  } catch (error) {
    console.error("Redis error storing OTP:", error);
    throw new Error("Failed to store OTP. Please try again.");
  }
}

/**
 * Retrieve OTP data from Redis
 * @param email - User email (will be normalized)
 * @returns OTP data or null if not found or expired
 */
export async function getOtpData(email: string): Promise<OtpData | null> {
  try {
    const key = getOtpKey(email);

    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    const otpData = parseRedisObject<OtpData>(data);
    return {
      name: otpData.name || "",
      otp: otpData.otp || "",
      attempts: typeof otpData.attempts === "number" ? otpData.attempts : 0,
      verified: Boolean(otpData.verified),
    };
  } catch (error) {
    console.error("Redis error retrieving OTP:", error);
    throw new Error("Failed to retrieve OTP. Please try again.");
  }
}

/**
 * Check whether an email is currently blocked due to failed OTP attempts.
 */
export async function checkBlocked(email: string): Promise<boolean> {
  try {
    const key = getBlockKey(email);
    const blocked = await redis.get(key);
    return Boolean(blocked);
  } catch (error) {
    console.error("Redis error checking blocked status:", error);
    throw new Error("Failed to validate request. Please try again.");
  }
}

/**
 * Limit OTP requests to max 3 per 10 minutes per email.
 */
export async function checkRateLimit(
  email: string
): Promise<{ allowed: boolean; requestCount: number; remainingRequests: number }> {
  try {
    const key = getRateKey(email);
    const requestCount = await redis.incr(key);

    if (requestCount === 1) {
      await redis.expire(key, OTP_EXPIRY_SECONDS);
    }

    const allowed = requestCount <= MAX_OTP_REQUESTS;
    const remainingRequests = Math.max(0, MAX_OTP_REQUESTS - requestCount);

    return {
      allowed,
      requestCount,
      remainingRequests,
    };
  } catch (error) {
    console.error("Redis error checking rate limit:", error);
    throw new Error("Failed to validate request rate. Please try again.");
  }
}

async function blockEmailForOtp(email: string): Promise<void> {
  const key = getBlockKey(email);
  await redis.setex(key, OTP_EXPIRY_SECONDS, "1");
}

async function updateOtpDataKeepingTtl(email: string, otpData: OtpData): Promise<void> {
  const key = getOtpKey(email);
  const ttl = await redis.ttl(key);
  const expirySeconds = ttl > 0 ? ttl : OTP_EXPIRY_SECONDS;
  await redis.setex(key, expirySeconds, JSON.stringify(otpData));
}

/**
 * Mark OTP as verified in Redis
 * @param email - User email (will be normalized)
 */
export async function markOtpVerified(email: string): Promise<void> {
  try {
    const key = getOtpKey(email);

    const data = await redis.get(key);

    if (!data) {
      throw new Error("OTP not found");
    }

    const parsed = parseRedisObject<OtpData>(data);
    const otpData: OtpData = {
      name: parsed.name || "",
      otp: parsed.otp || "",
      attempts: typeof parsed.attempts === "number" ? parsed.attempts : 0,
      verified: Boolean(parsed.verified),
    };
    otpData.verified = true;

    await updateOtpDataKeepingTtl(email, otpData);
  } catch (error) {
    console.error("Redis error marking OTP verified:", error);
    throw new Error("Failed to verify OTP. Please try again.");
  }
}

/**
 * Delete OTP from Redis
 * @param email - User email (will be normalized)
 */
export async function deleteOtp(email: string): Promise<void> {
  try {
    const key = getOtpKey(email);

    await redis.del(key);
  } catch (error) {
    console.error("Redis error deleting OTP:", error);
    throw new Error("Failed to delete OTP. Please try again.");
  }
}

/**
 * Verify OTP matches the stored value
 * @param email - User email (will be normalized)
 * @param otp - OTP to verify
 * @returns OTP data if valid, null if not found/expired/invalid
 */
export async function verifyOtp(
  email: string,
  otp: string
): Promise<OtpVerifyResult> {
  try {
    if (await checkBlocked(email)) {
      return { status: "blocked" };
    }

    const otpData = await getOtpData(email);

    if (!otpData) {
      return { status: "not_found" };
    }

    // OTP can only be verified once.
    if (otpData.verified) {
      return { status: "already_used" };
    }

    if (otpData.otp !== otp) {
      const nextAttempts = otpData.attempts + 1;

      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        await blockEmailForOtp(email);
        await deleteOtp(email);
        return { status: "max_attempts" };
      }

      const updatedOtpData: OtpData = {
        ...otpData,
        attempts: nextAttempts,
      };

      await updateOtpDataKeepingTtl(email, updatedOtpData);

      return {
        status: "invalid",
        remainingAttempts: MAX_OTP_ATTEMPTS - nextAttempts,
      };
    }

    return {
      status: "verified",
      otpData,
    };
  } catch (error) {
    console.error("Redis error verifying OTP:", error);
    throw new Error("Failed to verify OTP. Please try again.");
  }
}

export async function checkLoginBlocked(email: string): Promise<boolean> {
  try {
    const blocked = await redis.get(getLoginBlockKey(email));
    return Boolean(blocked);
  } catch (error) {
    console.error("Redis error checking login blocked status:", error);
    throw new Error("Failed to validate login request. Please try again.");
  }
}

export async function registerLoginFailure(
  email: string
): Promise<{ remainingAttempts: number; blocked: boolean }> {
  try {
    const attemptKey = getLoginAttemptKey(email);
    const blockKey = getLoginBlockKey(email);

    const attempts = await redis.incr(attemptKey);
    if (attempts === 1) {
      await redis.expire(attemptKey, LOGIN_BLOCK_SECONDS);
    }

    const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - attempts);

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      await redis.setex(blockKey, LOGIN_BLOCK_SECONDS, "1");
      await redis.del(attemptKey);
      // Keep current attempt response as invalid with 0 remaining.
      // The next request will be blocked by checkLoginBlocked().
      return { remainingAttempts: 0, blocked: false };
    }

    return { remainingAttempts, blocked: false };
  } catch (error) {
    console.error("Redis error registering login failure:", error);
    throw new Error("Failed to process login attempt. Please try again.");
  }
}

export async function clearLoginAttempts(email: string): Promise<void> {
  try {
    await redis.del(getLoginAttemptKey(email));
    await redis.del(getLoginBlockKey(email));
  } catch (error) {
    console.error("Redis error clearing login attempts:", error);
    throw new Error("Failed to finalize login. Please try again.");
  }
}

/**
 * Store password reset code in Redis with 10-minute expiry
 * @param email - User email (will be normalized)
 * @param userId - User ID from database
 * @param code - 6-digit reset code
 */
export async function storePasswordResetCode(
  email: string,
  userId: number,
  code: string
): Promise<void> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const key = `${PASSWORD_RESET_KEY_PREFIX}${normalizedEmail}`;

    const resetData: PasswordResetData = {
      userId,
      code,
      verified: false,
    };

    // Set with expiry using EX (expire in seconds)
    await redis.setex(key, OTP_EXPIRY_SECONDS, JSON.stringify(resetData));
  } catch (error) {
    console.error("Redis error storing password reset code:", error);
    throw new Error("Failed to store reset code. Please try again.");
  }
}

/**
 * Retrieve password reset data from Redis
 * @param email - User email (will be normalized)
 * @returns Password reset data or null if not found or expired
 */
export async function getPasswordResetData(
  email: string
): Promise<PasswordResetData | null> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const key = `${PASSWORD_RESET_KEY_PREFIX}${normalizedEmail}`;

    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    const parsed = parseRedisObject<PasswordResetData>(data);
    const resetData: PasswordResetData = {
      userId: typeof parsed.userId === "number" ? parsed.userId : 0,
      code: parsed.code || "",
      verified: Boolean(parsed.verified),
    };

    if (!resetData.userId || !resetData.code) {
      return null;
    }

    return resetData;
  } catch (error) {
    console.error("Redis error retrieving password reset data:", error);
    throw new Error("Failed to retrieve reset code. Please try again.");
  }
}

/**
 * Verify password reset code matches the stored value
 * @param email - User email (will be normalized)
 * @param code - Reset code to verify
 * @returns Password reset data if valid, null if not found/expired/invalid
 */
export async function verifyPasswordResetCode(
  email: string,
  code: string
): Promise<PasswordResetData | null> {
  try {
    const resetData = await getPasswordResetData(email);

    if (!resetData) {
      return null; // Expired or not found
    }

    if (resetData.code !== code) {
      return null; // Invalid code
    }

    return resetData;
  } catch (error) {
    console.error("Redis error verifying password reset code:", error);
    throw new Error("Failed to verify reset code. Please try again.");
  }
}

/**
 * Mark password reset code as verified in Redis
 * @param email - User email (will be normalized)
 */
export async function markPasswordResetVerified(email: string): Promise<void> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const key = `${PASSWORD_RESET_KEY_PREFIX}${normalizedEmail}`;

    const data = await redis.get(key);

    if (!data) {
      throw new Error("Reset code not found");
    }

    const parsed = parseRedisObject<PasswordResetData>(data);
    const resetData: PasswordResetData = {
      userId: typeof parsed.userId === "number" ? parsed.userId : 0,
      code: parsed.code || "",
      verified: Boolean(parsed.verified),
    };

    if (!resetData.userId || !resetData.code) {
      throw new Error("Reset code payload is invalid");
    }

    resetData.verified = true;

    // Keep the remaining TTL
    const ttl = await redis.ttl(key);
    const expirySeconds = ttl > 0 ? ttl : OTP_EXPIRY_SECONDS;

    await redis.setex(key, expirySeconds, JSON.stringify(resetData));
  } catch (error) {
    console.error("Redis error marking password reset verified:", error);
    throw new Error("Failed to verify reset code. Please try again.");
  }
}

/**
 * Delete password reset code from Redis
 * @param email - User email (will be normalized)
 */
export async function deletePasswordResetCode(email: string): Promise<void> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const key = `${PASSWORD_RESET_KEY_PREFIX}${normalizedEmail}`;

    await redis.del(key);
  } catch (error) {
    console.error("Redis error deleting password reset code:", error);
    throw new Error("Failed to delete reset code. Please try again.");
  }
}

export default redis;
