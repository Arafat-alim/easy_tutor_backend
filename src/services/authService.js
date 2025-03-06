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
    console.log("your_output", user[0]);
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

    // Handle specific errors
    if (err.code === "ER_DUP_ENTRY") {
      throw new Error(err.sqlMessage);
    }

    // Rethrow the error for the controller to handle
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
  const { email, role } = userData;
  try {
    const updatedUserCount = await Auth.findByEmailAndUpdateRole(email, role);

    if (updatedUserCount === 0) {
      error = new Error("User not found for update");
      error.status = 404;
      throw error;
    }
    return {
      email,
      role,
    };
  } catch (err) {
    console.error("Failed to add user role: ", err);
    throw err;
  }
};

const sendAndAddForgotPasswordCodeService = async (userData) => {
  const { mobile } = userData;
  let error;
  try {
    const user = await Auth.findByMobile(mobile);
    if (!user) {
      error = new Error("User not found!");
      error.status = 404;
      throw error;
    }

    const codeValue = generateOtpCode(6);
    console.log("codeValue__", codeValue);
    //! send codeValue to mobile
    //! write your sending code value...
    // Send `codeValue` to mobile using a reliable method (e.g., Twilio, Nexmo, SNS)
    // const sendSmsResult = await sendSms(
    //   mobile,
    //   `Your forgot password code is: ${codeValue}`
    // ); //Replace with your actual SMS sending logic

    // if (!sendSmsResult.success) {
    //   Check for sms sending failures. Replace with actual error check based on your sms api
    //   console.error("Failed to send SMS:", sendSmsResult.error);
    //   throw new Error("Failed to send code. Please try again later."); //Generic error for sending failure.
    // }

    if (user.mobile) {
      const hashedCodeValue = await hmacProcess(
        codeValue,
        process.env.JWT_SECRET
      );
      //! save code value to users_otp table and users table
      const updatedCount = await Auth.findByMobileAndUpdateForgotPasswordCode(
        user.mobile,
        hashedCodeValue
      );
      if (updatedCount === 0) {
        throw new Error(
          "Unexpected error: Failed to update user with code. User not found or update failed"
        );
      }
    }
    return true;
  } catch (err) {
    throw err;
  }
};

const verifyForgotPasswordCodeService = async (userData) => {
  const { mobile, otp, password } = userData;
  try {
    let error;
    const user = await Auth.findByMobile(mobile);
    if (!user) {
      throw new Error("User not found");
    }

    if (Date.now() - user.forgot_password_code_validation > 5 * 60 * 1000) {
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
      const response = await Auth.findByMobileAndUpdatePassword(
        mobile,
        hashedNewPassword
      );
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
    console.log("codeValue__", codeValue);
    //! send codeValue to mobile
    //! write your sending code value...
    await sendSMS(mobile, codeValue);
    if (user.mobile) {
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
  const { mobile, otp, enteredMobile } = trimmedObj;
  try {
    let error;
    const user = await Auth.findByMobile(mobile);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    if (Date.now() - user.mobile_verification_code_validation > 5 * 60 * 1000) {
      error = new Error("OTP Expired");
      error.status = 410;
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
      const response = await Auth.findByMobileAndUpdateMobile(
        user.mobile,
        enteredMobile
      );
      console.log("res", response);
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
  let error;
  try {
    const { email } = userData;
    console.log("test email", email);
    const user = await Auth.findByEmailAndGetSelectiveFields(email);

    if (!user) {
      error = new Error("User not Found!");
      error.status = 404;
      throw error;
    }

    const codeValue = await generateOtpCode(6);
    //! hash code
  } catch (err) {
    throw err;
  }
};

module.exports = {
  signUpUser,
  signInUser,
  updateMobileUser,
  updateUserRole,
  sendAndAddForgotPasswordCodeService,
  verifyForgotPasswordCodeService,
  sendMobileVerificationCodeService,
  validateMobileVerificationCodeService,
  verifyProfileByEmail,
  sendEmailVerificationCodeService,
};
