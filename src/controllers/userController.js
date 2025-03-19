const { deleteUserService } = require("../services/userService");
const { validateEmail } = require("../validators/authValidators");

const handleDeleteUser = async (req, res) => {
  try {
    const { error } = validateEmail(req.body);
    if (error?.details) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.details.map((err) => err.message),
      });
    }
    const data = await deleteUserService(req.body);

    return res.status(200).json({
      success: true,
      message: "User deleted",
      data,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: "Failed to delete the user",
      error: error.message,
    });
  }
};

module.exports = { handleDeleteUser };
