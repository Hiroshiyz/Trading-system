const router = require("express").Router();
const { Product, User, Transaction } = require("../models");
const productService = require("../services/productService");

//測試連接 api
router.use((req, res, next) => {
  console.log("admin api 正在被使用");
  next();
});

router.get("/dashboard", (req, res) => {
  //顯示後台管理者資料
  return res.json({ user: req.user });
});
//用戶列表查看
router.get("/userList", async (req, res) => {
  try {
    let allUser = await User.findAll({
      where: { role: "user" },
      attributes: { exclude: ["password"] }, // exclude放 attributes 裡面，且 password 要用key
    });
    return res.json({ allUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
//查看使用者特定資料 (只能查看歷史交易紀錄)
router.get("/userList/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let foundUser = await User.findOne({
      where: { id },
      attributes: { exclude: ["password"] },
      include: { model: Transaction },
    });
    return res.json({ foundUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//顯示幣種狀態
router.patch("/products/:id/visibility", async (req, res) => {
  try {
    let { id } = req.params;
    let foundProduct = await Product.findOne({ where: { id } });
    if (!foundProduct) return res.status(400).json({ message: "不存在此幣" });
    let visibility = await foundProduct.update({
      isAvailable: req.body.isAvailable,
    });
    return res.json({ message: "已更新動態", visibility });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
