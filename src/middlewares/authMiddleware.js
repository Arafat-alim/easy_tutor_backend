const Jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  let error;
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    let token;
    const authHeader = req.headers.Authorization || req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      error = new Error("No Token Provided, authorization denied");
      error.status = 401;
      throw error;
    }

    const decode = Jwt.verify(token, process.env.JWT_SECRET);

    req.user = decode;

    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    } else if (
      err.message === "JWT_SECRET is not defined in environment variables"
    ) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Authentication failed",
        errMsg: err.message,
      });
    }
  }
};

module.exports = authMiddleware;
