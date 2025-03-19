const express = require("express");
const {
  handleSignIn,
  handleSignOut,
  handleSignUp,
  handleUpdateUserRole,
  handleVerifyForgotPasswordCode,
  handleSendMobileVerificationCode,
  handleVerifyMobileVerificaitonCode,
  handleUserProfile,
  handleSendEmailVerificationCode,
  handleSendForgotPasswordCodeViaEmail,
  handleVerifyEmailVerificaitonCode,
} = require("../controllers/authController.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

const authRouter = express.Router();

authRouter.post("/register", handleSignUp);
authRouter.post("/login", handleSignIn);
authRouter.get("/logout", handleSignOut);
authRouter.get("/profile", authMiddleware, handleUserProfile);

// authRouter.patch("/add-mobile", handleUpdateMobile);
authRouter.post("/mobile/verification-code", handleSendMobileVerificationCode);
authRouter.post(
  "/mobile/verification",
  authMiddleware,
  handleVerifyMobileVerificaitonCode
);

authRouter.post("/email/verification-code", handleSendEmailVerificationCode);
authRouter.post("/email/verify", handleVerifyEmailVerificaitonCode);

authRouter.patch("/update-role", authMiddleware, handleUpdateUserRole);

authRouter.post("/password/reset-code", handleSendForgotPasswordCodeViaEmail);
authRouter.patch("/password/reset", handleVerifyForgotPasswordCode);

// authRouter.patch("/update-username", authMiddleware, handleUpdateUsername)

module.exports = authRouter;
