import crypto from 'crypto';

/**
 * Generates a secure 4-digit verification OTP string (e.g. "4829").
 */
export function generateFourDigitOtp(): string {
  // Generate random integer between 1000 and 9999
  const otpNumber = crypto.randomInt(1000, 10000);
  return otpNumber.toString();
}
