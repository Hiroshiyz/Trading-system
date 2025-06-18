const { PriceAlert, Product, User } = require("../models");
const { getRealTimePrices } = require("./priceService");

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
  console.log("checkPirceAlert開始執行");
  let alerts = await PriceAlert.findAll({
    where: { isNotified: false },
    include: { model: Product },
  });

  if (alerts.length === 0) return;
  //避免有重複的
  let thirdPartyIds = [...new Set(alerts.map((a) => a.product.thirdPartyId))];
  let prices = {};

  //即時更新資料
  for (let id of thirdPartyIds) {
    try {
      prices[id] = await getRealTimePrices(id);
    } catch (error) {
      return console.log(error + `抓取價格失敗, productId : ${id}`);
    }
  }

  //將當前價格根據alert對應的productId放入
  for (let alert of alerts) {
    console.log(alert.product.thirdPartyId);
    let currentPrice = prices[alert.product.thirdPartyId];
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

module.exports = { checkPriceAlert, sendNotification };
