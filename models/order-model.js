const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
//模擬買入 賣出 ..
const Order = sequelize.define(
  "orders",
  {
    type: { type: DataTypes.ENUM("buy", "sell"), allowNull: false }, // 買or賣
    price: { type: DataTypes.FLOAT, allowNull: true },
    orderType: { type: DataTypes.ENUM("limit", "market") },
    quantity: { type: DataTypes.FLOAT, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "fulfilled", "cancelled"), //下單狀態
      defaultValue: "pending",
    },
  },
  {
    indexes: [
      {
        fields: ["productId"],
      },
      {
        fields: ["userId"],
      },
    ],
  }
);

module.exports = Order;
