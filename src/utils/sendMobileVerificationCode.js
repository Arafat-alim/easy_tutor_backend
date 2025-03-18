const Auth = require("../models/Auth");
const { hmacProcess } = require("./hashing");
const { sendSMS } = require("./sendSMS");

const sendMobileVerificationCode = async (data) => {
  let error;
  const { mobile, mobileOTPCodes } = data;
  if (!mobile) {
    error = new Error("Mobile number is missing");
    error.status = 400;
    throw error;
  } else if (!mobileOTPCodes) {
    error = new Error("OTP Code is missing");
    error.status = 400;
    throw error;
  }

  try {
    const user = await Auth.findByMobile(mobile);
    console.log("🚀 ~ sendMobileVerificationCode ~ user:", user);
    if (!user) {
      error = new Error(
        "User not Found, while sending mobile otp verification code"
      );
      error.status = 404;
      throw error;
    }
    if (mobile) {
      await sendSMS(mobile, mobileOTPCodes);
      const hashedCodeValue = await hmacProcess(
        mobileOTPCodes,
        process.env.JWT_SECRET
      );
      const updatedCount =
        await Auth.findByMobileAndUpdateMobileVerificationCode(
          mobile,
          hashedCodeValue
        );
      if (updatedCount === 0) {
        throw new Error(
          "Unexpected error: Failed to update user with code. User not found or update failed"
        );
      }
      return true;
    }
  } catch (err) {
    throw err;
  }
};

module.exports = { sendMobileVerificationCode };
