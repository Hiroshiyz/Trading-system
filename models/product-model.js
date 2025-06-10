const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

//各個虛擬貨幣管理
const Product = sequelize.define(
  "products",
  {
    symbol: { type: DataTypes.STRING, allowNull: false }, // BTC/USDT
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    indexes: [
      {
        fields: ["name"],
      },
    ],
  }
);

module.exports = Product;
