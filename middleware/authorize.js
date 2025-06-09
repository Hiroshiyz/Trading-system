function authorizeRole(roleArray) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send("未驗證使用者");
    }
    if (!roleArray.includes(req.user.role)) {
      return res.status(403).send("無權限訪問");
    }
    next();
  };
}

module.exports = authorizeRole;
