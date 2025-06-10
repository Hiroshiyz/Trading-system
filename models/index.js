const User = require("./user-model");
const Holding = require("./holding-model");
const Transaction = require("./transaction-model");
const Order = require("./order-model");
const Product = require("./product-model");

//一個user會有多筆買賣 多筆交易紀錄 多個持倉
User.hasMany(Holding);
Holding.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Transaction);
Transaction.belongsTo(User);

//一個訂單對一檔股票 但一檔股票會被很多不同使用者訂單對應
Product.hasMany(Order);
Order.belongsTo(Product);
//一檔股票 會對應很多持倉
Product.hasMany(Holding);
Holding.belongsTo(Product);
//一檔股票會 對應很多交易紀錄
Product.hasMany(Transaction);
Transaction.belongsTo(Product);

module.exports = {
  User: require("./user-model"),
  Order: require("./order-model"),
  Holding: require("./holding-model"),
  Product: require("./product-model"),
  Transaction: require("./transaction-model"),
};
