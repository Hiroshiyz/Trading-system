const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Holding = sequelize.define("holding", {
  symbol: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
});
//每個使用者持股 (只有使用者才能傭有)

module.exports = Holding;
