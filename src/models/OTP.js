const db = require("../config/db.js");
const crypto = require("crypto"); // Import the crypto module
const { generateOtpExpiresAt } = require("../utils/generateOtpExpiresAt.js");

class OTP {
  /**
   * Generates a random OTP of a specified length.
   * @param {number} [length=6] The length of the OTP to generate. Defaults to 6.
   * @returns {string} The generated OTP.
   */
  static async generateOTP(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;

    const otp = crypto.randomInt(min, max + 1).toString();
    return otp.toString();
  }

  /**
   * Saves an OTP code for a user with an expiration time.  Handles existing unverified OTPs.
   * @param {number} userId The ID of the user.
   * @param {string} otpCode The OTP code.
   * @param {number} [expiresIn=5] The expiration time for the OTP in minutes. Defaults to 5.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the OTP was saved successfully, `false` otherwise.
   */
  static async saveOTP({ userId, otp_code, type, hashed_code, expiresIn = 5 }) {
    try {
      const expiryDate = generateOtpExpiresAt(expiresIn);
      await db("otp_verifications").insert({
        user_id: userId,
        otp_code: otp_code,
        verified: false,
        type: type,
        hashed_code: hashed_code,
        expires_at: expiryDate,
      });
      return true;
    } catch (error) {
      console.error("Error saving OTP:", error); // Log the error for debugging
      return false;
    }
  }

  /**
   * Verifies an OTP code for a user.
   * @param {number} userId The ID of the user.
   * @param {string} otpCode The OTP code.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the OTP is valid, `false` otherwise.
   */
  static async verifyOTP(userId, otpCode) {
    try {
      const otpEntry = await db("otp_verifications")
        .where({
          user_id: userId,
          otp_code: otpCode,
          verified: false,
        })
        .where("expires_at", ">", db.raw("CURRENT_TIMESTAMP"))
        .first();

      if (!otpEntry) return false;

      const verificationUpdate = await db("otp_verifications")
        .where({ id: otpEntry.id })
        .update({ verified: true });
      console.log(
        "🚀 ~ OTP ~ verifyOTP ~ verificationUpdate:",
        verificationUpdate
      );
      return true;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return false;
    }
  }

  /**
   * Find OTP details using userId and type (It will denote the mobile or email otp).
   * @param {number} userId The ID of the user.
   * @param {string} type type of the otp. e.g mobile, email
   * @returns {Promise<boolean>} A promise that resolves to `true` if the OTP is valid, `false` otherwise.
   */

  static async findUserOTPDetailsByUserIdAndType(userId, type) {
    return db("otp_verifications")
      .where({
        user_id: userId,
        type: type,
        deleted_at: null,
      })
      .first();
  }

  static async update({ userId, otp_code, type, hashed_code, expiresIn = 5 }) {
    try {
      const expiryDate = generateOtpExpiresAt(expiresIn);
      await db("otp_verifications")
        .where({
          user_id: userId,
          type: type,
        })
        .update({
          otp_code: otp_code,
          verified: false,
          hashed_code: hashed_code,
          expires_at: expiryDate,
        });
      return true;
    } catch (error) {
      console.error("Failed to update: ", error);
      return false;
    }
  }

  static async findByUserIdAndValidateEmailOTP(userId) {
    return db("otp_verifications")
      .where({ user_id: userId, deleted_at: null })
      .update({ verified: true, deleted_at: db.fn.now(), hashed_code: null });
  }
}

module.exports = OTP;
