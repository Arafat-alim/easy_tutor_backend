const Token = require("../models/Token");
const {
  generateTokenExpirationDate,
} = require("../utils/generateTokenExpirationDate");
const { generateJWTToken } = require("../utils/jwtTokenUtility");

const refreshTokenService = async (userData) => {
  let error;
  const { refreshToken } = userData;
  try {
    const tokenData = await Token.find(refreshToken);

    if (!tokenData || new Date(tokenData.expires_at) < new Date()) {
      error = new Error("Invalid token or token is expired");
      error.code = 400;
      throw error;
    }

    //! generate a new access token
    const newAccessToken = await generateJWTToken(
      { userId: tokenData.user_id },
      "15m"
    );
    const newRefreshToken = await generateJWTToken(
      { userId: tokenData.user_id },
      "7d"
    );

    //! save new refresh token into the database
    const expiredAt = generateTokenExpirationDate();
    const counted = await Token.update(
      refreshToken,
      newRefreshToken,
      expiredAt
    );

    if (!counted) {
      error = new Error(
        "Something went wrong while generating the refresh token"
      );
      error.code = 400;
      throw error;
    }
    return { newAccessToken, newRefreshToken };
  } catch (error) {
    console.error("Error occured: ", error);
    throw error;
  }
};

const signOutService = async (refreshToken) => {
  let error;
  try {
    const tokenData = await Token.find(refreshToken);

    if (!tokenData) {
      error = new Error("Invalid token");
      error.code = 400;
      throw error;
    }
    // Delete the refresh token from the database
    await Token.delete(refreshToken);
    return true;
  } catch (err) {
    console.error("Error occured: ", err);
    throw err;
  }
};

module.exports = {
  refreshTokenService,
  signOutService,
};
