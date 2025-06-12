"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Holdings
    await queryInterface.addColumn("holdings", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("holdings", ["userId"]);

    await queryInterface.addColumn("holdings", "productId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    });
    await queryInterface.addIndex("holdings", ["productId"]);
    await queryInterface.addIndex("holdings", ["userId", "productId"]);

    // Orders
    await queryInterface.addColumn("orders", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("orders", ["userId"]);

    await queryInterface.addColumn("orders", "productId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("orders", ["productId"]);

    // Transactions
    await queryInterface.addColumn("transactions", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("transactions", ["userId"]);

    await queryInterface.addColumn("transactions", "productId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("transactions", ["productId"]);

    await queryInterface.addColumn("transactions", "orderId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("transactions", ["orderId"]);

    // Users
    await queryInterface.addIndex("users", ["email"]);
  },

  async down(queryInterface, Sequelize) {
    // Holdings
    await queryInterface.removeIndex("holdings", ["userId"]);
    await queryInterface.removeIndex("holdings", ["userId", "productId"]);
    await queryInterface.removeIndex("holdings", ["productId"]);

    await queryInterface.removeColumn("holdings", "userId");
    await queryInterface.removeColumn("holdings", "productId");

    // Orders
    await queryInterface.removeIndex("orders", ["userId"]);
    await queryInterface.removeIndex("orders", ["productId"]);
    await queryInterface.removeColumn("orders", "userId");
    await queryInterface.removeColumn("orders", "productId");

    // Transactions
    await queryInterface.removeIndex("transactions", ["userId"]);
    await queryInterface.removeIndex("transactions", ["productId"]);
    await queryInterface.removeIndex("transactions", ["orderId"]);
    await queryInterface.removeColumn("transactions", "userId");
    await queryInterface.removeColumn("transactions", "productId");
    await queryInterface.removeColumn("transactions", "orderId");

    // Users
    await queryInterface.removeIndex("users", ["email"]);
  },
};
