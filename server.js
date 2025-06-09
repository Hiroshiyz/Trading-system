const express = require("express");
const app = express();
const sequelize = require("./database");
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const { authRoute, userRoute, adminRoute } = require("./routes");
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");
const authorize = require("./middleware/authorize");
const cookieParser = require("cookie-parser");
//database
sequelize
  .authenticate()
  .then(() => {
    console.log("正在連接 postgreSQl Database");
  })
  .catch((e) => {
    console.log(e);
  });
//middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");

//router
app.use("/api/auth", authRoute);
app.use(
  "/api/admin",
  passport.authenticate("jwt", { session: false }),
  authorize(["admin"]),
  adminRoute
);
app.use(
  "/api/user",
  passport.authenticate("jwt", { session: false }),
  authorize(["user", "admin"]),
  userRoute
);
//server
app.listen(process.env.PORT, () => {
  console.log("server running at " + process.env.PORT);
});
