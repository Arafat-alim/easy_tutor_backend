const Token = require("../models/Token");
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

    //! Generate tokens
    const prepareData = {
      user_id: tokenData.id,
      role: tokenData.role,
      email: tokenData.email,
      is_blocked: tokenData.is_blocked,
    };

    //! generate a new access token
    const newAccessToken = await generateJWTToken(
      prepareData,
      access_token_expiresIn
    );

    // const newRefreshToken = await generateJWTToken(prepareData, "7d");

    // //! save new refresh token into the database
    // const expiredAt = generateTokenExpirationDate();
    // const counted = await Token.update(
    //   refreshToken,
    //   newRefreshToken,
    //   expiredAt
    // );

    // if (!counted) {
    //   error = new Error(
    //     "Something went wrong while generating the refresh token"
    //   );
    //   error.code = 400;
    //   throw error;
    // }
    return { newAccessToken };
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
