const generateUsername = require("../utils/generateUsername.js");
const Auth = require("../models/Auth.js");
const generateOtpCode = require("../utils/generateOtpCode.js");
const {
  doHash,
  hmacProcess,
  doHashValidation,
} = require("../utils/hashing.js");
const { generateToken } = require("../utils/jwtTokenUtility.js");
const trimmer = require("../utils/trimmer.js");
const sendEmail = require("../utils/sendMail.js");
const { sendSMS } = require("../utils/sendSMS.js");

const signUpUser = async (userData) => {
  try {
    const { email, mobile, password } = userData;
    const hashedPassword = await doHash(password);
    const username = generateUsername(email);
    const prepareData = {
      email,
      username,
      mobile,
      password: hashedPassword,
    };

    const user = await Auth.create(prepareData);
    if (user[0] === 0) {
      const emailOptions = {
        to: email,
        subject: `Welcome! ${username}`,
        username: "JohnDoe",
        headerText: "Welcome!",
        bodyText:
          "Thank you for registering! Please verify your email to access more features.",
        actionText: "Visit Dashboard",
        actionUrl: "https://dev-arafat.netlify.app/",
        footerText: "We're excited to have you on board!",
        verificationCode: null,
      };

      sendEmail(emailOptions)
        .then(() => console.log("Email sent successfully"))
        .catch((err) => console.error("Failed to send email:", err));
    }

    return { email, mobile };
  } catch (err) {
    console.error("Error in signUpUser:", err);

    if (err.code === "ER_DUP_ENTRY") {
      throw err;
    }

    throw err;
  }
};

const signInUser = async (userData) => {
  try {
    const { email, password } = userData;
    let error;

    //! find user
    const user = await Auth.findByEmail(email);

    if (!user) {
      error = new Error("User not found!");
      error.status = 404;
      throw error;
    }

    const matched = await doHashValidation(password, user.password);

    if (!matched) {
      error = new Error("Wrong Credentials, password is incorrect");
      error.status = 400;
      throw error;
    }
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      mobile_verified: user.mobile_verified,
      email_verified: user.email_verified,
    };

    //! Return token and sanitized user profile
    const profile = {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      avatar: user.avatar,
      role: user.role,
      mobile_verified: user.mobile_verified,
      email_verified: user.email_verified,
    };
    const accessToken = await generateToken(payload);

    return { accessToken, profile };
  } catch (err) {
    throw err;
  }
};

const updateMobileUser = async (userData) => {
  try {
    let error;
    const { mobile, email } = userData;
    const user = await Auth.findByEmail(email);

    if (!user) {
      error = new Error("User is not registered");
      error.status = 404;
      throw error;
    }

    if (user.mobile === mobile) {
      throw new Error(`${mobile} number is already added.`);
    }

    const updatedUserCount = await Auth.findByEmailAndUpdateMobile(
      email,
      mobile
    );

    if (updatedUserCount === 0) {
      throw new Error("User not found for the update");
    }

    return { email, mobile };
  } catch (err) {
    throw err;
  }
};

const updateUserRole = async (userData) => {
  let error;
  const trimmedObj = trimmer(userData);
  const { email, role } = trimmedObj;
  try {
    const updatedUserCount = await Auth.findByEmailAndUpdateRole(email, role);

    if (updatedUserCount === 0) {
      error = new Error("User not found for update");
      error.status = 404;
      throw error;
    }
    return true;
  } catch (err) {
    console.error("Failed to add user role: ", err);
    throw err;
  }
};

const sendForgotPasswordCodeViaEmailService = async (userData) => {
  const { email } = userData;
  const emailId = email.trim();
  let error;
  try {
    const user = await Auth.findByEmail(emailId);
    if (!user) {
      error = new Error("User not found!");
      error.status = 404;
      throw error;
    }

    if (user.email) {
      const codeValue = generateOtpCode(6);
      const hashedCodeValue = await hmacProcess(
        codeValue,
        process.env.JWT_SECRET
      );
      //! save code value to users_otp table and users table
      const updatedCount = await Auth.findByEmailAndUpdateForgotPasswordCode(
        user.email,
        hashedCodeValue
      );
      if (updatedCount === 0) {
        throw new Error(
          "Unexpected error: Failed to update user with code. User not found or update failed"
        );
      }
      //! sending codes via email
      const emailOptions = {
        to: user.email,
        subject: `Hi ${user.username}, Your Forgot Password code is here`,
        username: user.username,
        headerText: "Forgot Password Code",
        bodyText: `You have requested a password reset. Please enter the below code to reset your password. This code will expire in 15 mins.`,
        actionText: "Visit Dashboard",
        actionUrl: "https://dev-arafat.netlify.app/",
        footerText: "We're excited to have you on board!",
        verificationCode: codeValue,
      };

      await sendEmail(emailOptions);
    }
    return true;
  } catch (err) {
    throw err;
  }
};

const verifyForgotPasswordCodeService = async (userData) => {
  const { email, otp, password } = userData;
  try {
    let error;
    const user = await Auth.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    const timeLimit = process.env.TIME_LIMIT || 15;

    if (
      Date.now() - user.forgot_password_code_validation >
      timeLimit * 60 * 1000
    ) {
      error = new Error("Code expired");
      error.status = 410;
      throw error;
    }

    if (!user.forgot_password_code || !user.forgot_password_code_validation) {
      error = new Error(
        "Something went wrong with the forgot password code or forgot password code validation"
      );
      error.status = 403;
      throw error;
    }

    const hashedCode = await hmacProcess(otp, process.env.JWT_SECRET);
    const hashedNewPassword = await doHash(password);

    if (user.forgot_password_code === hashedCode) {
      const response = await Auth.findByEmailAndUpdatePassword(
        user.email,
        hashedNewPassword
      );
      if (!response) {
        error = new Error(
          "Something went wrong while changing the new password"
        );
        error.status = 400;
        throw error;
      }
      //! Notfiying user password has been changed
      const emailOptions = {
        to: user.email,
        subject: `Hi ${user.username}, Your Password Has Been Changed`,
        username: user.username,
        headerText: "Password Change Confirmation",
        bodyText: `This email confirms that your password for ${user.username} has been successfully changed. If you did not initiate this change, please contact us immediately.`,
        footerText: "For any assistance, please contact our support team.",
      };
      await sendEmail(emailOptions);
      return true;
    } else {
      error = new Error("Invalid Code");
      error.status = 403;
      throw error;
    }
  } catch (err) {
    console.error("Failed to verify forgotten password code service: ", err);
    throw err;
  }
};

const sendMobileVerificationCodeService = async (userData) => {
  const { mobile, email } = userData;
  const enteredMobile = mobile.trim();
  const emailId = email.trim();
  let error;
  try {
    const user = await Auth.findByEmail(emailId);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const codeValue = await generateOtpCode(6);
    if (user.mobile) {
      await sendSMS(enteredMobile, codeValue);
      const hashedCodeValue = await hmacProcess(
        codeValue,
        process.env.JWT_SECRET
      );
      const updatedCount =
        await Auth.findByMobileAndUpdateMobileVerificationCode(
          user.mobile,
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

const validateMobileVerificationCodeService = async (userData) => {
  const trimmedObj = trimmer(userData);
  const { mobile, otp, email } = trimmedObj;
  let error;
  try {
    const user = await Auth.findByEmail(email);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    const timeLimit = process.env.TIME_LIMIT || 15;
    if (
      Date.now() - user.mobile_verification_code_validation >
      timeLimit * 60 * 1000
    ) {
      error = new Error("OTP Expired");
      error.status = 410;
      throw error;
    }

    if (user.mobile !== mobile) {
      error = new Error("Mobile number does not matched");
      error.status = 400;
      throw error;
    }

    if (
      !user.mobile_verification_code ||
      !user.mobile_verification_code_validation
    ) {
      error = new Error(
        "Something went wrong with the mobile verification code or mobile verification code validation"
      );
      error.status = 403;
      throw error;
    }
    const hashedCode = await hmacProcess(otp, process.env.JWT_SECRET);

    if (hashedCode === user.mobile_verification_code) {
      const response = await Auth.findByEmailAndVerifyOTP(user.mobile);
      if (!response) {
        error = new Error(
          "Something went wrong while changing the new password"
        );
        error.status = 400;
        throw error;
      }
      return true;
    } else {
      error = new Error("Invalid Code");
      error.status = 403;
      throw error;
    }
  } catch (err) {
    throw err;
  }
};

const verifyProfileByEmail = async (userData) => {
  let error;
  try {
    const user = await Auth.findByEmailAndGetSelectiveFields(userData);

    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    return user;
  } catch (err) {
    throw err;
  }
};

const sendEmailVerificationCodeService = async (userData) => {
  const trimmedObj = trimmer(userData);
  const { email } = trimmedObj;
  let error;
  try {
    const user = await Auth.findByEmail(email);
    if (!user) {
      error = new Error("User not Found!");
      error.status = 404;
      throw error;
    }

    if (user.email_verified) {
      error = new Error("Email is verified");
      error.status = 400;
      throw error;
    }

    if (user.email) {
      const codeValue = await generateOtpCode(6);
      const hashedCodeValue = await hmacProcess(
        codeValue,
        process.env.JWT_SECRET
      );

      const updatedCount = await Auth.findByEmailAndUpdateEmailVerificationCode(
        user.email,
        hashedCodeValue
      );

      if (updatedCount === 0) {
        error = new Error(
          "Unexpected error: Failed to send email verification code"
        );
        error.status = 400;
        throw error;
      }

      const emailOptions = {
        to: user.email,
        subject: `Hi ${user.username}, Verify Your Email`,
        username: user.username,
        headerText: "Email Verification",
        bodyText: `Welcome to Easy Tutor! Please use the code below to verify your email address. This code will expire in 15 minutes.`,
        verificationCode: codeValue,
        footerText: "Thanks for joining us!",
      };

      await sendEmail(emailOptions);
    }
    //! hash code
  } catch (err) {
    throw err;
  }
};

const verifyEmailService = async (userData) => {
  const trimmedObj = trimmer(userData);
  const { email, otp } = trimmedObj;
  let error;
  try {
    const user = await Auth.findByEmail(email);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const timeLimit = process.env.TIME_LIMIT || 15;
    if (
      Date.now() - user.email_verification_code_validation >
      timeLimit * 60 * 1000
    ) {
      error = new Error("OTP Expired");
      error.status = 410;
      throw error;
    }

    if (
      !user.email_verification_code ||
      !user.email_verification_code_validation
    ) {
      error = new Error(
        "Something went wrong with the email verification code or email verification code validation"
      );
      error.status = 403;
      throw error;
    }
    const hashedCode = await hmacProcess(otp, process.env.JWT_SECRET);

    if (hashedCode === user.email_verification_code) {
      const response = await Auth.findByEmailAndVerify(user.email);

      if (!response) {
        error = new Error("Something went wrong while verifying the email");
        error.status = 400;
        throw error;
      }
      const emailOptions = {
        to: user.email,
        subject: "Email Verified - Welcome to Easy Tutor",
        username: user.username,
        headerText: "Verification Successful!",
        bodyText: `Thank you for verifying your email, ${user.username}! You can now enjoy all the features and services of Easy Tutor.`,
        footerText: "We're glad to have you on board!",
      };

      await sendEmail(emailOptions);
      return true;
    } else {
      error = new Error("Invalid Code");
      error.status = 403;
      throw error;
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  signUpUser,
  signInUser,
  updateMobileUser,
  updateUserRole,
  verifyForgotPasswordCodeService,
  sendMobileVerificationCodeService,
  validateMobileVerificationCodeService,
  verifyProfileByEmail,
  sendEmailVerificationCodeService,
  sendForgotPasswordCodeViaEmailService,
  verifyEmailService,
};
