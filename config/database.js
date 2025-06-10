const { Sequelize } = require("sequelize");
require("dotenv").config();

const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    database: "tradingdb",
    username: "postgres",
    password: "123456",
    host: process.env.HOST || "localhost",
    dialect: "postgres",
    logging: false,
  },
  test: {
    database: "tradingdb_test",
    username: "postgres",
    password: "123456",
    host: process.env.HOST || "localhost",
    dialect: "postgres",
    logging: false,
  },
  production: {
    database: "tradingdb_public",
    username: "postgres",
    password: "123456",
    host: process.env.HOST || "localhost",
    dialect: "postgres",
    logging: false,
  },
};

const currentConfig = config[env];

const sequelize = new Sequelize(
  currentConfig.database,
  currentConfig.username,
  currentConfig.password,
  {
    host: currentConfig.host,
    dialect: currentConfig.dialect,
    logging: currentConfig.logging,
  }
);

module.exports = sequelize;
