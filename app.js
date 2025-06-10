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

module.exports = app;
