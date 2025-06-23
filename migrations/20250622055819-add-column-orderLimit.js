"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("orders", "orderType", {
      type: Sequelize.ENUM("limit", "market"),
      allowNull: false,
    });
    await queryInterface.changeColumn("orders", "price", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.changeColumn("orders", "status", {
      type: Sequelize.ENUM("pending", "fulfilled", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("orders", "orderType");
    await queryInterface.changeColumn("orders", "price", {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
    await queryInterface.changeColumn("orders", "status", {
      type: Sequelize.ENUM("pending", "fulfilled"),
      defaultValue: "pending",
    });
  },
};
