const Auth = require("../models/Auth");
const OTP = require("../models/OTP");
const trimmer = require("../utils/trimmer");

const deleteUserService = async (userData) => {
  let error;
  const { email } = trimmer(userData);
  try {
    const user = await Auth.findByEmail(email);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const updatedCount = await Auth.findByUserIdAndDeleteUser(user.id);
    //   TODO: Delete otp_verification_token and expired the session
    // TODO Please remove the unique mark from email ID and mobile number
    // const updatedCountTwo = await OTP.findByUserIdAndDisabledRow(user.id);

    if (!updatedCount) {
      throw new Error(
        "Unexpected error: Failed to update user with code. User not found or update failed"
      );
    }
    return true;
  } catch (err) {
    console.error("Something went wrong while deleting the user", err);
    throw err;
  }
};

module.exports = {
  deleteUserService,
};
