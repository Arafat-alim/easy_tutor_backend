const Jwt = require("jsonwebtoken");

const generateJWTToken = async (payload, expiresIn) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT Secret key is missing from Env variables");
    }
    const token = Jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
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
  generateJWTToken,
  validateToken,
};
