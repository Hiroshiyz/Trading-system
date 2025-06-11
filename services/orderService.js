const axios = require("axios");
const sequelize = require("../config/database");
const { Product, Transaction, Holding, Order } = require("../models");
async function getRealTimePrice(thridPartyId) {
  //先獲取第三方API的資料
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/coins/markets",
    {
      params: { vs_currency: "usd", ids: thridPartyId },
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
      where: { thridPartyId: orderData.thridPartyId },
      transaction: t,
    });

    if (!product) {
      throw new Error("找不到對應幣種產品");
    }
    //拿取及時價格
    const realTimePrice = await getRealTimePrice(orderData.thridPartyId);
    //建立訂單
    let order = await Order.create(
      {
        UserId: user.id,
        ProductId: product.id,
        type: orderData.type,
        quantity: orderData.quantity,
        price: realTimePrice,
        status: "filled",
      },
      { transaction: t }
    );
    //檢查是否有此倉
    let holding = await Holding.findOne(
      {
        where: {
          UserId: user.id,
          ProductId: product.id,
        },
      },
      { transaction: t }
    );
    if (!holding) {
      if (orderData.type === "buy") {
        //新增持倉
        holding = await Holding.create(
          {
            UserId: user.id,
            ProductId: product.id,
            quantity: orderData.quantity,
          },
          { transaction: t }
        );
      } else {
        throw new Error("失敗:無法賣出並未持有");
      }
    } else {
      //更新持倉數量
      let newQuantity =
        orderData.type === "buy"
          ? holding.quantity + orderData.quantity
          : holding.quantity - orderData.quantity;

      if (newQuantity < 0) {
        throw new Error("持倉不足無法賣出");
      }

      await holding.update({ quantity: newQuantity }, { transaction: t });
    }
    //建立交易紀錄
    await Transaction.create(
      {
        UserId: user.id,
        ProductId: product.id,
        quantity: orderData.quantity,
        price: realTimePrice,
        type: orderData.type,
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
