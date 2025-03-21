const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user; // Assuming JWT sets this
    if (!user || user.is_blocked || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};

// Usage
// app.get("/api/v1/admin/users", roleMiddleware(["admin"]), getUsers);

module.exports = {
  roleMiddleware,
};
