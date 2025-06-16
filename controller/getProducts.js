const Product = require("../models").Product;

async function getProduct(req, res) {
  try {
    //遇到數字就轉換
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    //sequelize的語法 count為總共數量 rows為呈現幾筆資料
    let { count, rows } = await Product.findAndCountAll({
      limit,
      offset,
      order: [["name", "ASC"]],
    });

    return res.json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
}

module.exports = getProduct;
