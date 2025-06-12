const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PriceAlert = sequelize.define("priceAlerts", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  targetPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  condition: {
    type: DataTypes.ENUM("lte", "gte"),
    allowNull: false,
  },
  isNotified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = PriceAlert;
