"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //  Holdings
    await queryInterface.addColumn("holdings", "UserId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("holdings", ["UserId"]);
    await queryInterface.removeColumn("holdings", "symbol");

    await queryInterface.addColumn("holdings", "ProductId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    });
    await queryInterface.addIndex("holdings", ["ProductId"]);
    await queryInterface.addIndex("holdings", ["UserId", "ProductId"]);
    //  Orders
    await queryInterface.addColumn("orders", "UserId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("orders", ["UserId"]);

    await queryInterface.addColumn("orders", "ProductId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("orders", ["ProductId"]);

    //  Transactions
    await queryInterface.addColumn("transactions", "UserId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("transactions", ["UserId"]);

    await queryInterface.addColumn("transactions", "ProductId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addColumn("transactions", "OrderId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addIndex("transactions", ["ProductId"]);
    await queryInterface.addIndex("transactions", ["OrderId"]);

    //user
    await queryInterface.addIndex("users", ["email", "username"]);
  },

  async down(queryInterface, Sequelize) {
    // Holdings
    await queryInterface.removeIndex("holdings", ["UserId"]);
    await queryInterface.removeIndex("holdings", ["UserId , ProductId"]); // 注意，這裡有 typo，應該修掉（詳見下方）
    await queryInterface.removeIndex("holdings", ["ProductId"]);

    await queryInterface.removeColumn("holdings", "UserId");
    await queryInterface.removeColumn("holdings", "ProductId");

    await queryInterface.addColumn("holdings", "symbol", {
      type: Sequelize.STRING, // 根據你原本的欄位型別，如果不是 STRING 要改
      allowNull: false, // 根據實際需求調整
    });

    // Orders
    await queryInterface.removeIndex("orders", ["userId"]);
    await queryInterface.removeIndex("orders", ["productId"]);
    await queryInterface.removeColumn("orders", "UserId");
    await queryInterface.removeColumn("orders", "ProductId");

    // Transactions
    await queryInterface.removeIndex("transactions", ["UserId"]);
    await queryInterface.removeIndex("transactions", ["ProductId"]);
    await queryInterface.removeColumn("transactions", "UserId");
    await queryInterface.removeColumn("transactions", "ProductId");

    // Users
    await queryInterface.removeIndex("users", ["email", "username"]);
  },
};
