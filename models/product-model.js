const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

//各個虛擬貨幣管理
const Product = sequelize.define(
  "products",
  {
    symbol: { type: DataTypes.STRING, allowNull: false }, // BTC/USDT
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
    thirdPartyId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
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
