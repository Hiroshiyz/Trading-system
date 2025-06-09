const router = require("express").Router();

//測試連接 api
router.use((req, res, next) => {
  console.log("user api 正在被使用");
  next();
});

router.get("/profile", (req, res) => {
  res.json({ user: req.user });
});
module.exports = router;
