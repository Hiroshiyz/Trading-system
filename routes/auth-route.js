const router = require("express").Router();
const User = require("../models").User;
const { registerValidation, LoginValidation } = require("../config/validation");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const privateKeyPath = path.resolve(process.env.PRIVATE_KEY_PATH);
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
//測試連接 api
router.use((req, res, next) => {
  console.log("auth api 正在被使用");
  next();
});
router.get("/test", (req, res) => {
  return res.send("測試");
});
//註冊
router.post("/register", async (req, res) => {
  //利用joi 驗證格式 並且傳遞錯誤訊息
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    let { username, password, email, role } = req.body;
    //先判定是否被註冊過
    let foundUser = await User.findOne({ where: { email } });
    if (foundUser) {
      return res.status(409).send("使用者已存在");
    }
    //建立新用戶
    let newUser = await User.create({
      username,
      password,
      email,
      role,
    });
    return res.json({ message: "註冊成功", newUser });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});
//登入
router.post("/login", async (req, res) => {
  //利用joi 驗證格式 並且傳遞錯誤訊息
  let { error } = LoginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    //判斷是否有此使用者
    let { email, password } = req.body;
    let foundUser = await User.findOne({ where: { email } });
    if (!foundUser) {
      return res.status(400).send("並未找到此使用者");
    }
    //驗證帳號密碼是否正確
    //並製作token
    let isMatch = await foundUser.comparePassword(password);
    if (isMatch) {
      let tokenObject = {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
      };
      let token = jwt.sign(tokenObject, privateKey, {
        algorithm: "RS256",
        expiresIn: "7d",
      });
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 天
        secure: false, // 本機開發用 HTTP 時設 false
        sameSite: "lax",
      });
      //base64
      return res.json({ message: "成功登入", token, foundUser });
    } else {
      return res.status(403).send("密碼錯誤");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});
//登出
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.send("已經登出");
});
module.exports = router;
