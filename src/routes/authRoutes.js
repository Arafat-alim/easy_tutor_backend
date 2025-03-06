const express = require("express");
const {
  handleSignIn,
  handleSignOut,
  handleSignUp,
  handleUpdateMobile,
  handleUpdateUserRole,
  handleSendForgotPasswordCode,
  handleVerifyForgotPasswordCode,
  handleSendMobileVerificationCode,
  validateMobileVerificationCode,
  handleVerifyMobileVerificaitonCode,
  handleUserProfile,
  handleSendEmailVerificationCode,
} = require("../controllers/authController.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

const authRouter = express.Router();

authRouter.post("/register", handleSignUp);
authRouter.post("/login", handleSignIn);
authRouter.get("/logout", handleSignOut);
authRouter.get("/profile", authMiddleware, handleUserProfile);

// authRouter.patch("/add-mobile", handleUpdateMobile);
authRouter.post(
  "/mobile/verification-code",
  authMiddleware,
  handleSendMobileVerificationCode
);
authRouter.post(
  "/mobile/verification",
  authMiddleware,
  handleVerifyMobileVerificaitonCode
);

authRouter.post("/email/verification-code", handleSendEmailVerificationCode);
// authRouter.post("/email/verification", handleVerifyEmailVerificaitonCode);

authRouter.patch("/update-role", authMiddleware, handleUpdateUserRole);

authRouter.post("/password/reset-code", handleSendForgotPasswordCode);
authRouter.patch("/password/reset", handleVerifyForgotPasswordCode);

module.exports = authRouter;
