const moment = require("moment-timezone");

function isOTPExpired(otpExpiryDateString) {
  console.log(
    "🚀 ~ isOTPExpired ~ otpExpiryDateString:",
    otpExpiryDateString.toString()
  );
  let otpExpiryDate;

  // Parse the date string using Moment.js
  if (otpExpiryDateString.toString().includes("T")) {
    // If the date string is in ISO 8601 format (e.g., "2025-03-19T19:25:06.000Z")
    otpExpiryDate = moment.utc(otpExpiryDateString);
  } else {
    // If the date string is in local format (e.g., "2025-03-20 00:55:06")
    // Parse it as IST (UTC+5:30) and convert to UTC
    otpExpiryDate = moment.tz(otpExpiryDateString, "Asia/Kolkata").utc();
  }

  // Check if the date is invalid
  if (!otpExpiryDate.isValid()) {
    throw new Error("Invalid OTP expiry date string");
  }

  // Get the current date in UTC
  const currentDateUTC = moment.utc();

  // Compare the dates
  return currentDateUTC.isAfter(otpExpiryDate);
}
module.exports = { isOTPExpired };
