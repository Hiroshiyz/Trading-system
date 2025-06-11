const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
//模擬買入 賣出 ..
const Order = sequelize.define(
  "orders",
  {
    type: { type: DataTypes.ENUM("buy", "sell"), allowNull: false }, // 買or賣
    symbol: { type: DataTypes.STRING, allowNull: false }, //btc usdt
    price: { type: DataTypes.FLOAT, allowNull: false },
    quantity: { type: DataTypes.FLOAT, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "filled"), //下單狀態
      defaultValue: 0,
    },
  },
  {
    indexes: [
      {
        fields: ["ProductId"],
      },
      {
        fields: ["UserId"],
      },
    ],
  }
);

module.exports = Order;
