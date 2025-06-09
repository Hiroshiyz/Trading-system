const { DataTypes } = require("sequelize");
const sequelize = require("../database");

//各個虛擬貨幣管理
const Product = sequelize.define("products", {
  symbol: { type: DataTypes.STRING, allowNull: false }, // BTC/USDT
  name: { type: DataTypes.STRING, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Product;
