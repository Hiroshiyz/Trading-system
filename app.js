const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./config/passport")(passport);
const { authRoute, userRoute, adminRoute } = require("./routes");
const authorize = require("./middleware/authorize");

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
    return res.json(allProducts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
module.exports = app;
