const Auth = require("../models/Auth");
const OTP = require("../models/OTP");
const { hmacProcess } = require("../utils/hashing");
const sendEmail = require("../utils/sendMail");
const { sendSMS } = require("../utils/sendSMS");

const enabledEmailOTP = process.env.ENABLED_OTP_EMAIL || "true";
const enabledMobileOTP = process.env.ENABLED_OTP_MOBILE || "true";

const sendMobileOTPVerificationCodeService = async (mobile) => {
  let error;
  if (!mobile) {
    error = new Error("Mobile number is missing");
    error.status = 400;
    throw error;
  }
  const enteredMobile = mobile.trim();
  try {
    const user = await Auth.findByMobile(mobile);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    if (user.mobile) {
      const otp = await OTP.generateOTP();
      const hashedCodeValue = await hmacProcess(otp, process.env.JWT_SECRET);
      const prepareData = {
        userId: user.id,
        otp_code: otp,
        hashed_code: hashedCodeValue,
        expiresIn: 5,
        type: "mobile",
      };
      const result = await OTP.saveOTP(prepareData);
      if (result) {
        enabledMobileOTP === "true" && (await sendSMS(enteredMobile, otp));
      }
    }
  } catch (error) {
    throw error;
  }
};

const sendEmailOTPVerificationCodeService = async (email, otp) => {
  let error;
  if (!email) {
    error = new Error("Email is missing");
    error.status = 400;
    throw error;
  }

  try {
    const user = await Auth.findByEmail(email);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    if (user.email) {
      const emailOptions = {
        to: email,
        subject: `Hi ${user.username}, Verify Your Email`,
        username: user.username,
        headerText: "Email Verification",
        bodyText: `Welcome to Easy Tutor! Please use the code below to verify your email address. This code will expire in 15 minutes.`,
        verificationCode: otp,
        footerText: "Thanks for joining us!",
      };
      enabledEmailOTP === "true" && (await sendEmail(emailOptions));
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  sendMobileOTPVerificationCodeService,
  sendEmailOTPVerificationCodeService,
};
