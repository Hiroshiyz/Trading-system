require("dotenv").config();
const sequelize = require("./config/database");
const app = require("./app");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL Database.");

    app.listen(PORT, () => {
      console.log(
        `Server running at http://localhost:${PORT}`,
        `running on ${process.env.NODE_ENV} environment`
      );
    });
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
})();
