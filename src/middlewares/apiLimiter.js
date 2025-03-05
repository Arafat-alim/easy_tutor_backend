const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429, // Too Many Requests
    message:
      "Too many requests from this IP, please try again after 15 minutes", // Custom error message
  },
  skip: function (req) {
    return req.ip === "127.0.0.1"; // Skip rate limiting for localhost
  },
});

module.exports = apiLimiter;
