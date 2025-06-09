const router = require("express").Router();

//測試連接 api
router.use((req, res, next) => {
  console.log("admin api 正在被使用");
  next();
});

router.get("/test", (req, res) => {
  return res.json({ user: req.user });
});
module.exports = router;
