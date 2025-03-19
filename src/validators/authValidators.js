const Joi = require("joi");

// Define individual validation rules
const emailValidation = Joi.string().trim().email().required().messages({
  "string.email": "Email must be a valid email address",
  "any.required": "Email is required",
});

const mobileValidation = Joi.string()
  .trim()
  .length(10)
  .pattern(/^\d+$/)
  .required()
  .messages({
    "string.length": "Mobile number must be exactly 10 digits",
    "string.pattern.base": "Mobile number must contain only digits",
    "any.required": "Mobile number is required",
  });

const passwordValidation = Joi.string()
  .trim()
  .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$"))
  .required()
  .messages({
    "string.pattern.base":
      "Password must be alphanumeric and between 8 and 30 characters",
    "any.required": "Password is required",
  });

const otpValidation = Joi.string()
  .trim()
  .required()
  .length(6)
  .pattern(/^[0-9]+$/)
  .messages({
    "string.empty": "OTP is required",
    "string.length": "OTP must be 6 digits long",
    "string.pattern.base": "OTP must be numeric",
    "any.required": "OTP is required",
  });

const roleValidation = Joi.string()
  .valid("admin", "teacher", "institute", "student")
  .required()
  .messages({
    "any.only": "Role must be one of: admin, teacher, institute, student",
    "any.required": "Role is required",
  });

// Define schemas
const signUpSchema = Joi.object({
  email: emailValidation,
  password: passwordValidation,
  mobile: mobileValidation,
});

const signInSchema = Joi.object({
  email: emailValidation,
  password: passwordValidation,
});

const addMobileSchema = Joi.object({
  mobile: mobileValidation,
  email: emailValidation,
});

const validateEmailAndRoleSchema = Joi.object({
  email: emailValidation,
  role: roleValidation,
});

const sendForgotPasswordCodeSchema = Joi.object({
  mobile: mobileValidation,
});

const verifyForgotPasswordCodeSchema = Joi.object({
  otp: otpValidation,
  email: emailValidation,
  password: passwordValidation,
});

const sendMobileVerificationCodeSchema = Joi.object({
  mobile: mobileValidation,
});

const validateOtpEmailAndMobileSchema = Joi.object({
  email: emailValidation,
  mobile: mobileValidation,
  otp: otpValidation,
});

const validateEmailAndMobileSchema = Joi.object({
  email: emailValidation,
  mobile: mobileValidation,
});

const validateEmailAndOtpSchema = Joi.object({
  email: emailValidation,
  otp: otpValidation,
});

const validateMobileSchema = Joi.object({
  mobile: mobileValidation,
});

const validateOTPSchema = Joi.object({
  otp: otpValidation,
});

// Validation functions
const validateSignup = (data) => {
  return signUpSchema.validate(data, { abortEarly: false });
};

const validateSignIn = (data) => {
  return signInSchema.validate(data, { abortEarly: false });
};

const validateAddMobile = (data) => {
  return addMobileSchema.validate(data, { abortEarly: false });
};

const validateEmailAndRole = (data) => {
  return validateEmailAndRoleSchema.validate(data, { abortEarly: false });
};

const validateSendForgotPasswordCode = (data) => {
  return sendForgotPasswordCodeSchema.validate(data, { abortEarly: false });
};

const validateVerifyPasswordCode = (data) => {
  return verifyForgotPasswordCodeSchema.validate(data, { abortEarly: false });
};

const validateSendMobileVerificationCode = (data) => {
  return sendMobileVerificationCodeSchema.validate(data, { abortEarly: false });
};

const validateOtpEmailAndMobile = (data) => {
  return validateOtpEmailAndMobileSchema.validate(data, { abortEarly: false });
};

const validateEmail = (data) => {
  return Joi.object({ email: emailValidation }).validate(data, {
    abortEarly: false,
  });
};

const validateEmailAndMobile = (data) => {
  return validateEmailAndMobileSchema.validate(data, { abortEarly: false });
};

const validateEmailAndOtp = (data) => {
  return validateEmailAndOtpSchema.validate(data, { abortEarly: false });
};

const validateMobile = (data) => {
  return validateMobileSchema.validate(data, { abortEarly: false });
};

const validateOTP = (data) => {
  return validateOTPSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateSignup,
  validateSignIn,
  validateAddMobile,
  validateEmailAndRole,
  validateSendForgotPasswordCode,
  validateVerifyPasswordCode,
  validateSendMobileVerificationCode,
  validateOtpEmailAndMobile,
  validateEmail,
  validateEmailAndMobile,
  validateEmailAndOtp,
  validateMobile,
  validateOTP,
};
