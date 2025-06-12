const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./config/passport")(passport);
const { authRoute, userRoute, adminRoute } = require("./routes");
const authorize = require("./middleware/authorize");
const Product = require("./models").Product;

// middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

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
//查看目前所有幣種
app.get("/products", async (req, res) => {
  try {
    let allProducts = await Product.findAll({});
    return res.json({ allProducts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
//手動測試
app.post("/sync-products", async (req, res) => {
  try {
    await productService.syncProducts();
    res.json({ message: "同步完成" });
  } catch (error) {
    res.status(500).json({ message: "同步失敗", error: error.message });
  }
});
module.exports = app;
