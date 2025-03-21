const { verifyGoogleToken } = require("../utils/googleAuthUtility");
const Auth = require("../models/Auth.js");
const {
  generateTokenExpirationDate,
} = require("../utils/generateTokenExpirationDate.js");
const Token = require("../models/Token.js");
const { generateJWTToken } = require("../utils/jwtTokenUtility.js");
const {
  generateAvatarURLUsingEmail,
} = require("../utils/generateAvatarURLUsingEmail.js");
const access_token_expiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "1hr";
const refresh_token_expiresIn =
  process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d";

const googleSignInService = async (userData) => {
  let error;
  try {
    const payload = userData;

    if (!payload) {
      error = new Error("Payload not found");
      error.status = 400;
      throw error;
    }
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
      role: user.role,
      email: user.email,
      is_blocked: user.is_blocked,
    };

    const accessToken = await generateJWTToken(
      prepareData,
      access_token_expiresIn
    );
    const refreshToken = await generateJWTToken(
      prepareData,
      refresh_token_expiresIn
    );

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

const googleSignUpService = async (userData) => {
  let error;
  try {
    const payload = userData;
    if (!payload) {
      error = new Error("Payload not found");
      error.status = 400;
      throw error;
    }

    const { email, name, picture } = payload;

    // Check if user already exists
    const existingUser = await Auth.findByEmail(email);
    if (existingUser) {
      const error = new Error("User already exists. Please sign in.");
      error.status = 409;
      throw error;
    }

    // Create new user
    const username = name.replace(/\s+/g, "_").toLowerCase();
    const avatarUrl = picture || generateAvatarURLUsingEmail(email);

    const userInfo = {
      email,
      username,
      full_name: name,
      password: null, // No password for Google sign-up
      avatar: avatarUrl,
      email_verified: true,
      mobile_verified: false,
    };

    const user = await Auth.create(userInfo);
    if (!user || user.length === 0) {
      throw new Error("User creation failed.");
    }

    //! find recently added user in the database usign email
    const recentlyAddedUser = await Auth.findByEmail(userInfo.email);

    if (!recentlyAddedUser) {
      error = new Error("Recently Added user not found, try later");
      error.status = 404;
      throw error;
    }

    //! Generate tokens
    const prepareData = {
      user_id: recentlyAddedUser.id,
      role: recentlyAddedUser.role,
      email: recentlyAddedUser.email,
      is_blocked: recentlyAddedUser.is_blocked,
    };

    // Generate tokens
    const accessToken = await generateJWTToken(
      prepareData,
      access_token_expiresIn
    );
    const refreshToken = await generateJWTToken(
      prepareData,
      refresh_token_expiresIn
    );

    // Save refresh token with expiration
    const expiresAt = generateTokenExpirationDate();
    await Token.save(recentlyAddedUser.id, refreshToken, expiresAt);

    // Prepare user profile
    const profile = {
      id: recentlyAddedUser.id,
      email: recentlyAddedUser.email,
      mobile: recentlyAddedUser.mobile,
      avatar: recentlyAddedUser.avatar,
      role: recentlyAddedUser.role,
      mobile_verified: recentlyAddedUser.mobile_verified,
      email_verified: recentlyAddedUser.email_verified,
    };

    return { accessToken, refreshToken, profile };
  } catch (err) {
    console.error("Error occurred in googleSignUpService: ", err);
    throw err;
  }
};

module.exports = {
  googleSignInService,
  googleSignUpService,
};
