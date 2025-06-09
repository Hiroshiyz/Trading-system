const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("tradingdb", "postgres", "123456", {
  host: process.env.HOST,
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
