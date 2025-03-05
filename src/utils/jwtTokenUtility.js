const Jwt = require("jsonwebtoken");

const generateToken = async (userData) => {
  try {
    if (!process.env.JWT_EXPIRES_IN) {
      throw new Error("JWT Expired key is missing from Env variables");
    } else if (!process.env.JWT_SECRET) {
      throw new Error("JWT Secret key is missing from Env variables");
    }
    const token = Jwt.sign(userData, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return token;
  } catch (err) {
    console.error("Failed to generate token: ", err);
    throw err;
  }
};

const validateToken = async (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT Secret key is missing from Env variables");
    }
    return Jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Failed to validate token: ", err);
    throw err;
  }
};

module.exports = {
  generateToken,
  validateToken,
};
