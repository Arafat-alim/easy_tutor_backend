const crypto = require("crypto"); // Import the crypto module

const generateOtpCode = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  const otp = crypto.randomInt(min, max + 1).toString(); //Using crypto module for more secure random number generation
  return otp;
};

module.exports = generateOtpCode;
