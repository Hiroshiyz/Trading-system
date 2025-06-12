const router = require("express").Router();
const {
  Holding,
  Transaction,
  Product,
  Order,
  PriceAlert,
} = require("../models");
const orderService = require("../services/orderService");
const { orderValiadtion, alertValiadtion } = require("../config/validation");
const getRealTimePrice = require("../services/priceService");
//測試連接 api
router.use((req, res, next) => {
  console.log("user api 正在被使用");
  next();
});
//查看個人檔案
router.get("/profile", (req, res) => {
  return res.json({ user: req.user });
});
//持倉
router.get("/holding", async (req, res) => {
  try {
    let holding = await Holding.findAll({
      where: { userId: req.user.id },
      include: { model: Product },
    });
    if (!holding) {
      return res.status(400).json({ message: "尚未持有任何幣" });
    }
    return res.json({ message: "所有持倉", holding });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
//下單 買 or 賣出
router.post("/orders", async (req, res) => {
  let { error } = orderValiadtion(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    //買賣邏輯
    const order = await orderService.createOrder(req.user, req.body);
    return res.status(201).json({ message: "下單成功", order });
  } catch (error) {
    console.log("下單錯誤" + error);
    return res.status(500).json({ message: error.message });
  }
});

//交易紀錄
router.get("/transaction", async (req, res) => {
  try {
    let transaction = await Transaction.findAll({
      where: { userId: req.user.id },
      include: { model: Order },
    });
    if (!transaction) {
      return res.status(400).json({ message: "尚未持有任何交易紀錄" });
    }
    return res.json({ message: "交易訂單", transaction });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
//新增通知
router.post("/priceAlert", async (req, res) => {
  let { error } = alertValiadtion(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    let { productId, targetPrice, condition } = req.body;
    let alert = await PriceAlert.create({
      userId: req.user.id,
      productId: productId,
      targetPrice,
      condition,
      isNotified: false,
    });

    return res.status(201).json({ message: "新增通知", alert });
  } catch (error) {
    console.error("新增錯誤查看", error);
    return res.status(500).json({ message: error.message });
  }
});

//查看及時價格
router.get("/price/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    // 先找到產品，取得 thirdPartyId
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "產品不存在" });

    const { currentPrice, fromCache } = await getRealTimePrice(
      productId,
      product.thirdPartyId
    );

    return res.json({ productId, currentPrice, fromCache });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
module.exports = router;
