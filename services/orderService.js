const sequelize = require("../config/database");
const { Product, Transaction, Holding, Order } = require("../models");
const { getRealTimePrices } = require("./priceService");

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
    const realTimePrice = await getRealTimePrices(orderData.thirdPartyId);

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
    //postman會把數字轉成字串 用Number轉回來
    let orderQuantity = Number(orderData.quantity);

    if (isNaN(orderQuantity) || orderQuantity < 0) {
      throw new Error("訂單數量錯誤");
    }
    if (!holding) {
      if (orderData.type === "buy") {
        //新增持倉
        holding = await Holding.create(
          {
            userId: user.id,
            productId: product.id,
            quantity: orderData.quantity,
            averagePrice: realTimePrice, //此時的價格是平均成本
          },
          { transaction: t }
        );
      } else {
        //sell
        throw new Error("失敗：無法賣出，並未持有該資產");
      }
    } else {
      //更新持倉數量 更新持倉平均成本
      if (orderData.type === "buy") {
        let oldTotalCost = holding.quantity * holding.averagePrice; //舊的持有成本
        let newQuantity = holding.quantity + orderQuantity; //新增持倉數量
        let newCost = orderQuantity * realTimePrice; //新持有的成本
        let newAverage = (newCost + oldTotalCost) / newQuantity; //總成本/總數量 = 平均購買成本
        await holding.update(
          { quantity: newQuantity, averagePrice: newAverage },
          { transaction: t }
        );
      } else {
        //賣出只看盈虧 減掉數量即可
        let newQuantity = holding.quantity - orderQuantity;
        //看賣出是否符合就好
        if (newQuantity < 0) {
          throw new Error(
            `持倉不足：目前數量 ${holding.quantity}，欲賣出 ${orderData.quantity}`
          );
        }

        await holding.update({ quantity: newQuantity }, { transaction: t });
      }
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
