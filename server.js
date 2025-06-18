require("dotenv").config();
const sequelize = require("./config/database");
const { checkPriceAlert } = require("./services/alertService");
const PORT = process.env.PORT;
const redisClient = require("./lib/redisClient");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const app = require("./app");
const server = createServer(app);
const wss = new WebSocketServer({ server });
const handlewss = require("./lib/websocket");

(async () => {
  try {
    //連接postgreSQL
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL Database.");

    //連接Redis
    await redisClient.connect();
    console.log("Connect to Redis");

    //連接express server
    handlewss(wss);
    server.listen(PORT, () => {
      console.log(
        "webSocket are running",
        `Server running at http://localhost:${PORT}`,
        `running on ${process.env.NODE_ENV} environment`
      );
    });
  } catch (error) {
    console.log("Unable to connect to database:", error);
  }
})();

setInterval(() => {
  //一分鐘確認一次
  checkPriceAlert().catch(console.error);
}, 40 * 1000);
