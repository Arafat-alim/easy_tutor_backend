/**
 * Generates a future date representing the expiration time of a token.
 * The token is set to expire 7 days from the current date and time.  If a valid date is passed
 * in it will add 7 days to that date and return the result.
 *
 * @param {Date} [startDate=new Date()] - Optional. The starting date for calculating the expiration. Defaults to the current date and time.
 * @returns {Date} The expiration date.
 *  @throws {Error} if the provided startDate is not a valid date object.
 */
function generateTokenExpirationDate(startDate = new Date()) {
  if (
    Object.prototype.toString.call(startDate) !== "[object Date]" ||
    isNaN(startDate.getTime())
  ) {
    throw new Error("Invalid Date object provided");
  }

  // Calculate the expiration date (7 days from now)
  const expirationDate = new Date(startDate);
  expirationDate.setDate(startDate.getDate() + 7);

  // Validate the expirationDate
  if (isNaN(expirationDate.getTime())) {
    throw new Error("Invalid expiration date calculation.");
  }

  return expirationDate;
}

module.exports = { generateTokenExpirationDate };
