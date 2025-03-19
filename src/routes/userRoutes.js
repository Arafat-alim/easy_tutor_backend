const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const { handleDeleteUser } = require("../controllers/userController");

const userRouter = express.Router();

userRouter.delete("/delete", handleDeleteUser);

module.exports = userRouter;
