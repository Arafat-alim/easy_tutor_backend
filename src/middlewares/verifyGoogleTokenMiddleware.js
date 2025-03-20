const { verifyGoogleToken } = require("../utils/googleAuthUtility");

const verifyGoogleTokenMiddleware = async (req, res, next) => {
  let error;
  try {
    // Extract the Google token from the headers or body
    let googleToken;
    const authHeader = req.headers.Authorization || req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      googleToken = authHeader.split(" ")[1];
    } else if (req.body.googleToken) {
      googleToken = req.body.googleToken;
    }

    if (!googleToken) {
      error = new Error("No Google token provided, authorization denied");
      error.status = 401;
      throw error;
    }

    // Verify the Google token
    const payload = await verifyGoogleToken(googleToken);

    // Attach the payload to the request object
    req.payload = payload;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error("Error in verifyGoogleTokenMiddleware: ", err);

    // Handle specific errors
    if (err.message === "No Google token provided, authorization denied") {
      return res.status(401).json({
        success: false,
        message: err.message,
      });
    } else if (err.message === "Invalid Google token: No payload found") {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token",
      });
    } else if (
      err.message === "Google token has expired. Please sign in again."
    ) {
      return res.status(401).json({
        success: false,
        message: "Google token has expired",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Authentication failed",
        error: err.message,
      });
    }
  }
};

module.exports = verifyGoogleTokenMiddleware;
