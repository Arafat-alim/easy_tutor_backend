/**
 * Generates a future date representing the OTP expiration time.
 * The OTP is set to expire a specified number of minutes from the current date and time.
 *
 * @param {number} minutes - The number of minutes from now when the OTP should expire.
 * @returns {Date} The OTP expiration date.
 * @throws {Error} If the provided minutes value is not a positive number or not a number.
 */
function generateOtpExpiresAt(minutes) {
  if (typeof minutes !== "number" || minutes <= 0 || isNaN(minutes)) {
    // Validate Input
    throw new Error("Invalid input: minutes must be a positive number.");
  }

  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + minutes);

  //Validate the expirationDate
  if (isNaN(expirationDate.getTime())) {
    throw new Error("Invalid expiration date calculation.");
  }

  return expirationDate;
}

module.exports = { generateOtpExpiresAt };
