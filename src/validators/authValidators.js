const Joi = require("joi");

const signUpSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .trim()
    .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$"))
    .messages({
      "string.pattern.base":
        "Password must be alphanumeric and between 8 and 30 characters",
    }),
  mobile: Joi.string().trim().length(10).pattern(/^\d+$/).required().messages({
    "string.length": "Mobile number must be exactly 10 digits",
    "string.pattern.base": "Mobile number must contain only digits",
    "any.required": "Mobile number is required",
  }),
});

const validateSignup = (data) => {
  return signUpSchema.validate(data, { abortEarly: false });
};

// ! validateSignIn
const signInSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .trim()
    .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$"))
    .messages({
      "string.pattern.base":
        "Password must be alphanumeric and between 8 and 30 characters",
    }),
});

const validateSignIn = (data) => {
  return signInSchema.validate(data, { abortEarly: false });
};

//! add mobile schema
const addMobileSchema = Joi.object({
  mobile: Joi.string().trim().length(10).pattern(/^\d+$/).required().messages({
    "string.length": "Mobile number must be exactly 10 digits",
    "string.pattern.base": "Mobile number must contain only digits",
    "any.required": "Mobile number is required",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
});
const validateAddMobile = (data) => {
  return addMobileSchema.validate(data, { abortEarly: false });
};

//! add user role
const addUserRoleSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  role: Joi.string()
    .valid("admin", "teacher", "institute", "student") //Enum validation for role
    .required() // Role is also required
    .messages({
      "any.only": "Role must be one of: admin, teacher, institute, student", //Custom message for invalid role
      "any.required": "Role is required", //Message for missing role
    }),
});

const validateAddUserRole = (data) => {
  return addUserRoleSchema.validate(data, { abortEarly: false });
};

//! validateSendForgotPasswordCode
const sendForgotPasswordCodeSchema = Joi.object({
  mobile: Joi.string().trim().length(10).pattern(/^\d+$/).required().messages({
    "string.length": "Mobile number must be exactly 10 digits",
    "string.pattern.base": "Mobile number must contain only digits",
    "any.required": "Mobile number is required",
  }),
});

const validateSendForgotPasswordCode = (data) => {
  return sendForgotPasswordCodeSchema.validate(data, { abortEarly: false });
};

//! validateVerifyPasswordCode

const verifyForgotPasswordCodeSchema = Joi.object({
  otp: Joi.string()
    .trim()
    .required()
    .length(6)
    .pattern(/^[0-9]+$/)
    .messages({
      //6-digit numeric OTP
      "string.empty": "OTP is required",
      "string.length": "OTP must be 6 digits long",
      "string.pattern.base": "OTP must be numeric",
      "any.required": "OTP is required",
    }),

  mobile: Joi.string().trim().length(10).pattern(/^\d+$/).required().messages({
    "string.length": "Mobile number must be exactly 10 digits",
    "string.pattern.base": "Mobile number must contain only digits",
    "any.required": "Mobile number is required",
  }),
  password: Joi.string()
    .trim()
    .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$"))
    .messages({
      "string.pattern.base":
        "Password must be alphanumeric and between 8 and 30 characters",
    }),
});

const validateVerifyPasswordCode = (data) => {
  return verifyForgotPasswordCodeSchema.validate(data, { abortEarly: false });
};

//! validateSendMobileVerificationCode
const sendMobileVerificationCodeSchema = Joi.object({
  mobile: Joi.string().trim().length(10).pattern(/^\d+$/).required().messages({
    "string.length": "Mobile number must be exactly 10 digits",
    "string.pattern.base": "Mobile number must contain only digits",
    "any.required": "Mobile number is required",
  }),
});

const validateSendMobileVerificationCode = (data) => {
  return sendMobileVerificationCodeSchema.validate(data, { abortEarly: false });
};

const validateOtpMobileSchema = Joi.object({
  mobile: Joi.string().trim().length(10).pattern(/^\d+$/).required().messages({
    "string.length": "Mobile number must be exactly 10 digits",
    "string.pattern.base": "Mobile number must contain only digits",
    "any.required": "Mobile number is required",
  }),

  enteredMobile: Joi.string()
    .trim()
    .length(10)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "string.length": "User input Mobile number must be exactly 10 digits",
      "string.pattern.base":
        "User input Mobile number must contain only digits",
      "any.required": "User input Mobile number is required",
    }),

  otp: Joi.string()
    .trim()
    .required()
    .length(6)
    .pattern(/^[0-9]+$/)
    .messages({
      //6-digit numeric OTP
      "string.empty": "OTP is required",
      "string.length": "OTP must be 6 digits long",
      "string.pattern.base": "OTP must be numeric",
      "any.required": "OTP is required",
    }),
});

const validateOtpAndMobile = (data) => {
  return validateOtpMobileSchema.validate(data, { abortEarly: false });
};

const validateEmailSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
});

const validateEmail = (data) => {
  return validateEmailSchema.validate(data, { abortEarly: false });
};

const validateEmailAndMobileSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  mobile: Joi.string().trim().length(10).pattern(/^\d+$/).required().messages({
    "string.length": "User input Mobile number must be exactly 10 digits",
    "string.pattern.base": "User input Mobile number must contain only digits",
    "any.required": "User input Mobile number is required",
  }),
});

const validateEmailAndMobile = (data) => {
  return validateEmailAndMobileSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateSignup,
  validateSignIn,
  validateAddMobile,
  validateAddUserRole,
  validateSendForgotPasswordCode,
  validateVerifyPasswordCode,
  validateSendMobileVerificationCode,
  validateOtpAndMobile,
  validateEmail,
  validateEmailAndMobile,
};
