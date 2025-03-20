const { verifyGoogleToken } = require("../utils/googleAuthUtility");
const Auth = require("../models/Auth.js");
const {
  generateTokenExpirationDate,
} = require("../utils/generateTokenExpirationDate.js");
const Token = require("../models/Token.js");
const { generateJWTToken } = require("../utils/jwtTokenUtility.js");

const googleSignInService = async (googleToken) => {
  let error;
  try {
    const payload = await verifyGoogleToken(googleToken);
    console.log("🚀 ~ googleSignInService ~ payload:", payload);
    const { email } = payload;

    const user = await Auth.findByEmail(email);

    if (!user) {
      error = new Error("User not found. Please sign up");
      error.code = 404;
      throw error;
    }

    //! Generate tokens
    const prepareData = {
      user_id: user.id,
    };
    const accessToken = await generateJWTToken(prepareData, "15m");
    const refreshToken = await generateJWTToken(prepareData, "7d");

    //! save refresh token

    const expiresAt = generateTokenExpirationDate();
    await Token.save(user.id, refreshToken, expiresAt);

    //! Return user profile and tokens
    const profile = {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      mobile_verified: user.mobile_verified,
      email_verified: user.email_verified,
    };

    return { accessToken, refreshToken, profile };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  googleSignInService,
};
