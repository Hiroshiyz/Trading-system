const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./config/passport")(passport);
const { authRoute, userRoute, adminRoute } = require("./routes");
const authorize = require("./middleware/authorize");
const getProduct = require("./controller/getProducts");
const productService = require("./services/productService");
const { getTop10Conis } = require("./services/priceService");
const cors = require("cors");
// middleware
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use((err, req, res, next) => {
  console.log(err.stack);
  return res.status(500).json({ error: "server Error" });
});
// passport initialize
app.use(passport.initialize());

// routes
app.use("/auth", authRoute);
app.use(
  "/admin",
  passport.authenticate("jwt", { session: false }),
  authorize(["admin"]),
  adminRoute
);
app.use(
  "/user",
  passport.authenticate("jwt", { session: false }),
  authorize(["user"]),
  userRoute
);
//查看前10大資訊
app.get("/products/top-10", async (req, res) => {
  let top10 = await getTop10Conis();
  if (!top10) {
    return res.status(404).json({ message: "目前發生錯誤查無資訊" });
  }
  return res.json({ top10 });
});
//查看目前所有幣種
app.get("/products", getProduct);
//手動測試
app.post("/sync-products", async (req, res) => {
  try {
    await productService.syncProducts();
    res.json({ message: "同步完成" });
  } catch (error) {
    res.status(500).json({ message: "同步失敗", error: error.message });
  }
});

app.get(/(.*)/, (req, res) => {
  return res.status(404).json({ message: "你所找的頁面不存在" });
});

module.exports = app;
