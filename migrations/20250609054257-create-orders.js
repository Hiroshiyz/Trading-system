"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      quantity: { type: Sequelize.FLOAT, allowNull: false },
      price: { type: Sequelize.FLOAT, allowNull: false },
      type: {
        type: Sequelize.ENUM("buy", "sell"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "fulfilled"),
        defaultValue: "pending",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("orders");
  },
};
