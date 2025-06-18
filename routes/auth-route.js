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
      return res.status(409).json({ message: "使用者已存在" });
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
      return res.status(400).json({ message: "並未找到此使用者" });
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
      let accessToken = jwt.sign(tokenObject, privateKey, {
        algorithm: "RS256",
        expiresIn: "15m",
      });
      let refreshToken = jwt.sign(tokenObject, privateKey, {
        algorithm: "RS256",
        expiresIn: "7d",
      });
      res.cookie("token", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, // 1 天
        secure: false, // 本機開發用 HTTP 時設 false
        sameSite: "lax",
      });
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/auth/refresh", // 限制只有 /auth/refresh 可發送這個 cookie
      });
      //base64
      return res.json({ message: "成功登入", foundUser });
    } else {
      return res.status(403).json({ message: "密碼錯誤" });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
});
//登出
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "已經登出" });
});

//refresh token讓效期延長
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(refreshToken, publicKey, {
      algorithms: ["RS256"],
    });

    const newAccessToken = jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      privateKey,
      {
        algorithm: "RS256",
        expiresIn: "15m",
      }
    );
    //重新建立token
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure: false,
      sameSite: "lax",
    });

    return res.json({ message: "Access token refreshed" });
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
});
module.exports = router;
