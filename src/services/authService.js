const generateUsername = require("../utils/generateUsername.js");
const Auth = require("../models/Auth.js");
const OTP = require("../models/OTP.js");
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
const {
  generateAvatarURLUsingEmail,
} = require("../utils/generateAvatarURLUsingEmail.js");
const {
  sendMobileOTPVerificationCodeService,
  sendEmailOTPVerificationCodeService,
} = require("./OTPService.js");
const { isOTPExpired } = require("../utils/isOTPExpired.js");

const JWT_SECRET = process.env.JWT_SECRET;
const enabledEmailOTP = process.env.ENABLED_OTP_EMAIL;

const signUpUser = async (userData) => {
  let error;
  try {
    const { email, mobile, password } = userData;
    // ! check user already exists or not
    const existingUser = await Auth.findByEmail(email);
    if (existingUser) {
      error = new Error("User already exists!, Please login");
      error.status = 400;
      throw error;
    }

    const avatarURL = generateAvatarURLUsingEmail(email);
    const hashedPassword = await doHash(password);
    const username = generateUsername(email);
    const prepareData = {
      email,
      username,
      mobile,
      password: hashedPassword,
      avatar: avatarURL,
    };

    const user = await Auth.create(prepareData);

    if (user[0] === 0) {
      const emailOTP = await OTP.generateOTP();
      const mobileOTP = await OTP.generateOTP();
      const hashedEmailOTP = await hmacProcess(emailOTP, JWT_SECRET);
      const hashedMobileOTP = await hmacProcess(emailOTP, JWT_SECRET);
      const existingUser = await Auth.findByEmail(prepareData.email);
      if (existingUser) {
        const newEmailOTPEntry = await OTP.saveOTP({
          userId: existingUser.id,
          otp_code: emailOTP,
          type: "email",
          hashed_code: hashedEmailOTP,
          expiresIn: 15,
        });
        const newMobileOTPEntry = await OTP.saveOTP({
          userId: existingUser.id,
          otp_code: mobileOTP,
          type: "mobile",
          hashed_code: hashedMobileOTP,
          expiresIn: 5,
        });

        newEmailOTPEntry &&
          (await sendEmailOTPVerificationCodeService(
            prepareData.email,
            emailOTP
          ));

        newMobileOTPEntry &&
          (await sendMobileOTPVerificationCodeService(
            prepareData.mobile,
            mobileOTP
          ));
      }
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
  const { email, role } = trimmer(userData);
  try {
    const updatedUserCount = await Auth.findByEmailAndUpdateRole(email, role);

    if (updatedUserCount === 0) {
      error = new Error("User not found for update. Please try again later");
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

      enabledEmailOTP && (await sendEmail(emailOptions));
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
  let error;
  let response;
  const { mobile } = userData;
  const enteredMobile = mobile.trim();
  try {
    const user = await Auth.findByMobile(enteredMobile);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    const otpCode = await OTP.generateOTP();
    const hashedCode = await hmacProcess(otpCode, process.env.JWT_SECRET);
    const updatedCount = await Auth.findByUserIdAndUpdateMobileVerification(
      user.id
    );

    if (!updatedCount) {
      error = new Error(
        "Unexpected error: Failed to update user for email verification"
      );
      error.status = 400;
      throw error;
    }

    const existingOTP = await OTP.findUserOTPDetailsByUserIdAndType(
      user.id,
      "mobile"
    );

    if (existingOTP && Object.keys(existingOTP).length) {
      // Updating the existing otp
      response = await OTP.update({
        userId: user.id,
        otp_code: otpCode,
        type: "mobile",
        hashed_code: hashedCode,
        expiresIn: 5,
      });
    } else {
      // save new otp
      response = await OTP.saveOTP({
        userId: user.id,
        otp_code: otpCode,
        type: "mobile",
        hashed_code: hashedCode,
        expiresIn: 5,
      });
    }
    if (response) {
      sendMobileOTPVerificationCodeService(user.mobile, otpCode);
    } else {
      error = new Error("Failed to send Mobile verification code");
      error.status = 400;
      throw error;
    }
  } catch (err) {
    throw err;
  }
};

const validateMobileVerificationCodeService = async (userData) => {
  let error;
  const { mobile, otp } = trimmer(userData);
  try {
    const user = await Auth.findByMobile(mobile);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    if (user.mobile_verified) {
      error = new Error("Mobile number is already verified");
      error.status = 400;
      throw error;
    }

    const existingOTP = await OTP.findUserOTPDetailsByUserIdAndType(
      user.id,
      "mobile"
    );
    if (!existingOTP || !Object.keys(existingOTP).length) {
      error = new Error(
        "Either mobile is already verified, else please send verification code"
      );
      error.status = 400;
      throw error;
    }

    const otpExpired = isOTPExpired(existingOTP.expires_at);

    if (otpExpired || existingOTP.deleted_at || existingOTP.verified) {
      error = new Error("OTP is expired.");
      error.status = 410;
      throw error;
    }
    if (!existingOTP.hashed_code) {
      error = new Error("Something went wrong, please try again later");
      error.status = 400;
      throw error;
    }

    const hashedCode = await hmacProcess(otp, JWT_SECRET);

    if (hashedCode === existingOTP.hashed_code) {
      const userResponse = await Auth.findByUserIdAndValidateMobile(user.id);
      if (!userResponse) {
        error = new Error(
          "Something went wrong while verifying the mobile otp"
        );
        error.status = 400;
        throw error;
      }

      const otpResponse = await OTP.findByUserIdAndTypeAndValidateOTP(
        user.id,
        "mobile"
      );

      if (!otpResponse) {
        error = new Error("Something went wrong while verifying the email");
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
  let error;
  let response;
  const { email } = trimmer(userData);
  try {
    const user = await Auth.findByEmail(email);
    if (!user) {
      error = new Error("User not Found!");
      error.status = 404;
      throw error;
    }
    const otpCode = await OTP.generateOTP();
    const hashedCode = await hmacProcess(otpCode, process.env.JWT_SECRET);
    const updatedCount = await Auth.findByUserIdAndUpdateEmailVerification(
      user.id
    );

    if (!updatedCount) {
      error = new Error(
        "Unexpected error: Failed to update user for email verification"
      );
      error.status = 400;
      throw error;
    }
    const existingOTP = await OTP.findUserOTPDetailsByUserIdAndType(
      user.id,
      "email"
    );

    if (!existingOTP || !Object.keys(existingOTP).length) {
      // save new otp
      response = await OTP.saveOTP({
        userId: user.id,
        otp_code: otpCode,
        type: "email",
        hashed_code: hashedCode,
        expiresIn: 15,
      });
    } else {
      // Updating the existing OTP
      response = await OTP.update({
        userId: user.id,
        otp_code: otpCode,
        type: "email",
        hashed_code: hashedCode,
        expiresIn: 15,
      });
    }
    response &&
      (await sendEmailOTPVerificationCodeService(user.email, otpCode));
  } catch (err) {
    console.error("Error in sendEmailVerificationCodeService:", err.message);
    throw err;
  }
};

const verifyEmailService = async (userData) => {
  let error;
  const { email, otp } = trimmer(userData);
  try {
    const user = await Auth.findByEmail(email);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    if (user.email_verified) {
      error = new Error("Email address is already verified");
      error.status = 400;
      throw error;
    }

    //! find user in otp_verifications table
    const existingOTP = await OTP.findUserOTPDetailsByUserIdAndType(
      user.id,
      "email"
    );
    if (!existingOTP || !Object.keys(existingOTP).length) {
      error = new Error(
        "Either email address is already verified, else please send verification code"
      );
      error.status = 400;
      throw error;
    }

    const otpExpired = isOTPExpired(existingOTP.expires_at);

    if (otpExpired || existingOTP.deleted_at || existingOTP.verified) {
      error = new Error("OTP is expired.");
      error.status = 410;
      throw error;
    }

    if (!existingOTP.hashed_code) {
      error = new Error("Something went wrong, please try again later");
      error.status = 400;
      throw error;
    }

    const hashedCode = await hmacProcess(otp, JWT_SECRET);

    if (hashedCode === existingOTP.hashed_code) {
      const userResponse = await Auth.findByUserIdAndValidateEmail(user.id);
      if (!userResponse) {
        error = new Error("Something went wrong while verifying the email");
        error.status = 400;
        throw error;
      }
      const otpResponse = await OTP.findByUserIdAndTypeAndValidateOTP(
        user.id,
        "email"
      );
      if (!otpResponse) {
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

      enabledEmailOTP && (await sendEmail(emailOptions));
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
