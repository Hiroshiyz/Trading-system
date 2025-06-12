const User = require("./user-model");
const Holding = require("./holding-model");
const Transaction = require("./transaction-model");
const Order = require("./order-model");
const Product = require("./product-model");
const PriceAlert = require("./priceAlert-model");

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
// 一筆訂單可能會有部分成交
Order.hasMany(Transaction);
Transaction.belongsTo(Order);

//一個使用者會有一個價格通知
User.hasMany(PriceAlert);
PriceAlert.belongsTo(User);
Product.hasMany(PriceAlert);
PriceAlert.belongsTo(Product);
module.exports = {
  User,
  Order,
  Holding,
  Product,
  Transaction,
  PriceAlert,
};
