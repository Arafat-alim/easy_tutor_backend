const errorHandler = async (err, res) => {
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(400).json({
      success: false,
      message: "Mobile number already exists",
      error: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
};
