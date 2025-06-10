"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("holdings", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      symbol: { type: Sequelize.STRING, allowNull: false },
      quantity: { type: Sequelize.FLOAT, allowNull: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("holdings");
  },
};
