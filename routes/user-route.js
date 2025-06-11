const router = require("express").Router();
const orderService = require("../services/orderService");
//測試連接 api
router.use((req, res, next) => {
  console.log("user api 正在被使用");
  next();
});
//查看個人檔案
router.get("/profile", (req, res) => {
  res.json({ user: req.user });
});
//持倉

//下單
router.post("/orders", async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user, req.body);
    return res.status(201).json({ message: "下單成功", order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
//交易紀錄

//賣出

module.exports = router;
