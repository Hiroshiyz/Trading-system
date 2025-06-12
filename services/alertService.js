const { PriceAlert, Product, User } = require("../models");
const axios = require("axios");

//模擬抓及時價格
async function getRealTimePriceByProductId(productId) {
  const product = await Product.findByPk(productId);
  if (!product) throw new Error("找不到產品");
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/coins/markets",
    {
      params: {
        vs_currency: "usd",
        id: product.thirdPartyId,
      },
    }
  );
  if (!res.data || res.data.length === 0) throw new Error("查無價格");
  return res.data[0].current_price;
}
//模擬發送通知
async function sendNotification(userId, productId, currentPrice, targetPrice) {
  let user = await User.findByPk(userId);
  let product = await Product.findByPk(productId);

  if (!user || !product) return;
  console.log(
    `通知:  使用者${user.username} ${product.name} 現在價格已達${currentPrice} 您設定的目標價: ${targetPrice}`
  );
}

async function checkPriceAlert() {
  let alerts = await PriceAlert.findAll({ where: { isNotified: false } });
  if (alerts === 0) return;

  let productIds = [...new Set(alerts.map((a) => a.productId))];
  let prices = {};
  //即時更新資料
  for (let id of productIds) {
    try {
      prices[id] = await getRealTimePriceByProductId(id);
    } catch (error) {
      console.log(error + `抓取價格失敗, productId : ${id}`);
    }
  }
  //將當前價格根據alert對應的productId放入
  for (let alert of alerts) {
    let currentPrice = prices[alert.productId];
    if (!currentPrice) continue;

    let alertCondition = false;
    if (alert.condition === "lte" && currentPrice <= alert.targetPrice)
      alertCondition = true;
    if (alert.condition === "gte" && currentPrice >= alert.targetPrice)
      alertCondition = true;

    if (alertCondition) {
      await sendNotification(
        alert.userId,
        alert.productId,
        currentPrice,
        alert.targetPrice
      );
      alert.isNotified = true;
      await alert.save();
    }
  }
}

module.exports = { checkPriceAlert };
