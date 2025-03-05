const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");

const userRouter = express.Router();

module.exports = userRouter;
