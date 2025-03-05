require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRouter = require("./routes/authRoutes");
const apiLimiter = require("./middlewares/apiLimiter");
const userRouter = require("./routes/userRoutes");

const app = express();

//! rate limiter

//! middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

//! routes
// app.use("/api/", apiLimiter);
app.use("/api/v1/auth", authRouter);

//! Test route
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
