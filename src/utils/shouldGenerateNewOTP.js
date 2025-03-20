const { findUserOTPDetailsByUserIdAndType } = require("../models/OTP");
const { isOTPExpired } = require("./isOTPExpired");

async function shouldGenerateNewOTP(userId, type) {
  try {
    const existingOTP = await findUserOTPDetailsByUserIdAndType(userId, type);
    return isOTPExpired(existingOTP.expires_at);
  } catch (err) {
    console.error("Something went wrong: ", err.message);
  }
}

module.exports = {
  shouldGenerateNewOTP,
};
