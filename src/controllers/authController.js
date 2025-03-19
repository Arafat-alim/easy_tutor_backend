const {
  validateSignup,
  validateSignIn,
  validateAddMobile,
  validateAddUserRole,
  validateVerifyPasswordCode,
  validateEmail,

  validateEmailAndOtp,
  validateEmailAndRole,
  validateMobile,
  validateMobileAndOTP,
} = require("../validators/authValidators.js");
const {
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
} = require("../services/authService.js");
const { hideMobileNumber } = require("../utils/hideMobileNumber.js");

//! handle Signup
const handleSignUp = async (req, res) => {
  try {
    const { error } = validateSignup(req.body);

    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.details.map((err) => err.message),
      });
    }

    const data = await signUpUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User sign up successfully",
      data,
    });
  } catch (err) {
    console.error("Failed to signup:", err);

    if (err.code === "ER_DUP_ENTRY") {
      const { email, mobile } = req.body;

      let errorMessage = "Duplicate entry detected: ";

      if (err.sqlMessage?.includes(email)) {
        errorMessage += "Email is already registered.";
      } else if (err.sqlMessage?.includes(mobile)) {
        errorMessage += "Mobile number is already registered.";
      } else {
        errorMessage =
          "The email address or mobile number you entered is already registered with us.";
      }

      return res.status(409).json({
        // Use 409 Conflict status code
        success: false,
        message: errorMessage,
      });
    }

    return res.status(err.status || 500).json({
      success: false,
      message: "Failed to signup",
      error: err.message,
    });
  }
};

//! handle SignIn
const handleSignIn = async (req, res) => {
  try {
    const { error } = validateSignIn(req.body);
    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error?.details.map((err) => err.message),
      });
    }
    const { accessToken, profile } = await signInUser(req.body);

    return res.status(200).json({
      success: true,
      message: "User sign in successfully",
      profile,
      token: {
        access: accessToken,
      },
    });
  } catch (err) {
    console.error("Failed to signin: ", err);
    if (err.status === 301) {
      return res.status(err.status).json({
        success: false,
        message: "Failed to sign up",
        error: err.message,
      });
    }
    if (err.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Failed to sign in",
        error: err.message,
      });
    }
    return res.status(err.status || 500).json({
      success: false,
      message: "Failed to sign in",
      error: err.message,
    });
  }
};

//! handle signout
const handleSignOut = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User sign out successfully",
      data: "Task accompolished",
    });
  } catch (err) {
    console.error("Failed to signout: ", err);
    return res.status(err.status || 500).json({
      success: false,
      message: "Failed to signout",
      error: err.message,
    });
  }
};

//! handle add mobile
const handleUpdateMobile = async (req, res) => {
  try {
    const { error } = validateAddMobile(req.body);
    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error!",
        error: error?.details.map((err) => err.message),
      });
    }

    const { email, mobile } = await updateMobileUser(req.body);

    return res.status(201).json({
      success: true,
      message: `User - ${email}, mobile updated to - ${mobile}`,
    });
  } catch (err) {
    console.error("Failed to add mobile number: ", err);
    if (err.message.includes("Duplicate entry")) {
      // Check for the specific duplicate key error
      return res.status(409).json({
        success: false,
        message: "Mobile number already exists",
      });
    }
    return res.status(err.status || 500).json({
      success: false,
      message: "Failed to add mobile number",
      error: err.message,
    });
  }
};

//! handle add role

const handleUpdateUserRole = async (req, res) => {
  const { email } = req.user;
  const { role } = req.body;
  const prepareData = {
    email,
    role,
  };
  try {
    const { error } = validateEmailAndRole(prepareData);
    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error!",
        error: error?.details.map((err) => err.message),
      });
    }

    await updateUserRole(prepareData);

    return res.status(201).json({
      success: true,
      message: "Role successfully updated!",
    });
  } catch (err) {
    console.error("Failed to add user role: ", err);
    return res.status(err.status || 500).json({
      success: false,
      message: "Failed to add user role!",
      error: err.message,
    });
  }
};

//! forgot password
const handleSendForgotPasswordCodeViaEmail = async (req, res) => {
  try {
    const { error } = validateEmail(req.body);
    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error!",
        error: error?.details.map((err) => err.message),
      });
    }

    await sendForgotPasswordCodeViaEmailService(req.body);

    return res.status(200).json({
      success: true,
      message: `We've sent a password reset code to your email id. Please enter it to reset your password - ${req.body.email}`,
    });
  } catch (err) {
    console.error("Failed to send forgot password code: ", err);
    return res.status(err.status || 500).json({
      success: false,
      message: "Failed to perform forgot password. Please try again later.",
      error: err.message,
    });
  }
};

//! verify forgot otp
const handleVerifyForgotPasswordCode = async (req, res) => {
  try {
    const { error } = await validateVerifyPasswordCode(req.body);

    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error!",
        error: error?.details.map((err) => err.message),
      });
    }

    await verifyForgotPasswordCodeService(req.body);

    return res.status(200).json({
      success: true,
      message: `Password has been changed successfully.`,
    });
  } catch (err) {
    console.error("Failed to verify forgot password code: ", err);
    if (err.status === 400 || err.status === 403 || err.status === 404) {
      return res.status(err.status).json({
        success: false,
        message: "Failed to verify forgot password. please try again later",
        error: err.message,
      });
    }
    return res.status(err.status || 500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//! handle send mobile verification code

const handleSendMobileVerificationCode = async (req, res) => {
  try {
    const { error } = await validateMobile(req.body);

    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error!",
        error: error?.details.map((err) => err.message),
      });
    }

    await sendMobileVerificationCodeService(req.body);

    const mobileNumber = hideMobileNumber(req.body.mobile);
    return res.status(200).json({
      success: true,
      message: `Mobile Verification code sent to +91${mobileNumber}`,
    });
  } catch (err) {
    console.error("Failed to send mobile verification code: ", err);
    if (err.status === 404) {
      return res.status(err.status).json({
        success: false,
        message: "Failed to send mobile verification code",
        error: err.message,
      });
    }
    return res.status(err.status || 500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const handleVerifyMobileVerificaitonCode = async (req, res) => {
  try {
    const { error } = await validateMobileAndOTP(req.body);
    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error!",
        error: error?.details.map((err) => err.message),
      });
    }
    await validateMobileVerificationCodeService(req.body);
    return res.status(200).json({
      success: true,
      message: "Mobile number is verified successfully!",
    });
  } catch (err) {
    console.error("Failed to verify the mobile verification code", err);
    return res.status(err.status || 500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const handleUserProfile = async (req, res) => {
  try {
    const { email } = req.user;
    const { error } = await validateEmail({ email });
    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error?.details.map((err) => err.message),
      });
    }

    const user = await verifyProfileByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }

    return res.status(200).json({
      success: false,
      profile: user,
    });
  } catch (err) {
    console.error("Failed to handle user profile", err);
    return res.status(err.status || 500).json({
      success: false,
      message: "Failed to handle user profile",
      error: err.message,
    });
  }
};

const handleSendEmailVerificationCode = async (req, res) => {
  try {
    const { error } = await validateEmail(req.body);
    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "validation Error!",
        error: error?.details.map((err) => err.message),
      });
    }

    await sendEmailVerificationCodeService(req.body);

    return res.status(200).json({
      success: true,
      message: `Email Verification code sent to ${req.body.email}`,
    });
  } catch (err) {
    console.error("failed to send email verification code: ", err);
    return res.status(err.status || 500).json({
      success: false,
      message:
        "Failed to send email verification code. Please try again later!",
      error: err.message,
    });
  }
};

const handleVerifyEmailVerificaitonCode = async (req, res) => {
  try {
    const { error } = await validateEmailAndOtp(req.body);
    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error!",
        error: error.details.map((err) => err.message),
      });
    }

    await verifyEmailService(req.body);
    return res.status(200).json({
      success: true,
      message: "Email is verified!",
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: "Failed to Verify your email address, please try again later",
      error: err.message,
    });
  }
};

module.exports = {
  handleSignUp,
  handleSignIn,
  handleSignOut,
  handleUpdateMobile,
  handleUpdateUserRole,
  handleSendForgotPasswordCodeViaEmail,
  handleVerifyForgotPasswordCode,
  handleSendMobileVerificationCode,
  handleVerifyMobileVerificaitonCode,
  handleUserProfile,
  handleSendEmailVerificationCode,
  handleVerifyEmailVerificaitonCode,
};
