const axios = require("axios");
const sequelize = require("../config/database");
const { Product, Transaction, Holding, Order } = require("../models");
async function getRealTimePrice(thirdPartyId) {
  //先獲取第三方API的資料
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/coins/markets",
    {
      params: { vs_currency: "usd", id: thirdPartyId },
    }
  );
  if (!res.data || res.data.length === 0) {
    throw new Error("查無即時價格");
  }
  return res.data[0].current_price;
}
module.exports.createOrder = async (user, orderData) => {
  const t = await sequelize.transaction();
  try {
    //先從資料庫抓取相對應的coin 拿取相對應的主key
    const product = await Product.findOne({
      where: { thirdPartyId: orderData.thirdPartyId },
      transaction: t,
    });

    if (!product) {
      throw new Error("找不到對應幣種產品");
    }
    //拿取及時價格
    const realTimePrice = await getRealTimePrice(orderData.thirdPartyId);
    //建立訂單
    let order = await Order.create(
      {
        userId: user.id,
        productId: product.id,
        type: orderData.type,
        quantity: orderData.quantity,
        price: realTimePrice,
        status: "fulfilled",
      },
      { transaction: t }
    );
    //檢查是否有此倉
    let holding = await Holding.findOne(
      {
        where: {
          userId: user.id,
          productId: product.id,
        },
      },
      { transaction: t }
    );
    if (!holding) {
      if (orderData.type === "buy") {
        //新增持倉
        holding = await Holding.create(
          {
            userId: user.id,
            productId: product.id,
            quantity: orderData.quantity,
          },
          { transaction: t }
        );
      } else {
        //sell
        throw new Error("失敗：無法賣出，並未持有該資產");
      }
    } else {
      //更新持倉數量
      let newQuantity =
        orderData.type === "buy"
          ? holding.quantity + orderData.quantity
          : holding.quantity - orderData.quantity;

      if (newQuantity < 0) {
        throw new Error(
          `持倉不足：目前數量 ${holding.quantity}，欲賣出 ${orderData.quantity}`
        );
      }

      await holding.update({ quantity: newQuantity }, { transaction: t });
    }
    //建立交易紀錄
    let total = realTimePrice * orderData.quantity;
    await Transaction.create(
      {
        userId: user.id,
        productId: product.id,
        quantity: orderData.quantity,
        price: realTimePrice,
        type: orderData.type,
        total: total,
        orderId: order.id,
      },
      { transaction: t }
    );
    //提出交易

    await t.commit();
    return order;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
