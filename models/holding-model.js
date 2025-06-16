const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Holding = sequelize.define(
  "holding",
  {
    quantity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    averagePrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }, // 新增欄位：平均買入價格
  },

  {
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["productId"],
      },
      {
        unique: true,
        fields: ["userId", "productId"], // 避免同一人持有同一檔股票多筆記錄
      },
    ],
  }
);
//每個使用者持股 (只有使用者才能傭有)

module.exports = Holding;
