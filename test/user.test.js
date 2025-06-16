/* eslint-env jest */
const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
const User = require("../models").User;
const {
  Product,
  Holding,
  Transaction,
  Order,
  PriceAlert,
} = require("../models");
jest.mock("axios");
const axios = require("axios");
const { createOrder } = require("../services/orderService");
const { sendNotification } = require("../services/alertService");
const redisClient = require("../lib/redisClient");

let testUser;
let token;
beforeAll(async () => {
  redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
  });
  await redisClient.connect();
  testUser = await User.create({
    username: "testUser",
    email: "test@gmail.com",
    password: "12345678",
    role: "user",
  });

  const loginRes = await request(app).post("/auth/login").send({
    email: "test@gmail.com",
    password: "12345678",
  });
  token = loginRes.header["set-cookie"];
});
afterAll(async () => {
  await User.destroy({ where: {}, truncate: true, cascade: true });
  await redisClient.quit();
  await sequelize.close();
});
describe("GET /Profile", () => {
  it("要回傳個人page", async () => {
    const res = await request(app).get("/user/profile").set("Cookie", token);
    expect(res.status).toBe(200);
    // console.log(res.body);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("username");
    expect(res.body.user).toHaveProperty("email");
    expect(res.body.user).toHaveProperty("role");
  });
});

describe("createOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("應該成功下單並回傳成功", async () => {
    //模擬現價
    axios.get.mockResolvedValue({
      data: {
        bitcoin: { usd: 21000 },
      },
    });

    // 模擬資料庫
    Product.findOne = jest.fn().mockResolvedValue({ id: 1 });
    Holding.findOne = jest.fn().mockResolvedValue(null);
    Holding.create = jest.fn().mockResolvedValue({ id: 1 });
    Order.create = jest.fn().mockResolvedValue({ id: 1, price: 21000 });
    Transaction.create = jest.fn().mockResolvedValue({});
    let fackTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    sequelize.transaction = jest.fn().mockResolvedValue(fackTransaction);
    let user = { id: 1 };
    let orderData = {
      thirdPartyId: "bitcoin",
      type: "buy",
      quantity: 1,
    };
    let result = await createOrder(user, orderData);
    expect(result.price).toBe(21000);
    expect(Order.create).toHaveBeenCalled();
    expect(Transaction.create).toHaveBeenCalled();
    expect(fackTransaction.commit).toHaveBeenCalled();
  });
});

describe("POST /priceAlert", () => {
  it("新增通知", async () => {
    const res = await request(app)
      .post("/user/priceAlert")
      .send({
        productId: 1,
        targetPrice: 20000,
        condition: "gte",
      })
      .set("Cookie", token);

    console.log(res.body);
    expect(res.status).toBe(201);
    expect(res.body.alert).toHaveProperty("userId");
    expect(res.body.alert).toHaveProperty("productId");
    expect(res.body.alert).toHaveProperty("targetPrice");
    expect(res.body.alert).toHaveProperty("condition");
    expect(res.body.alert).toHaveProperty("isNotified");
  });
});
describe("測試通知觸發", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await PriceAlert.destroy({ where: {} });
  });

  it("應該印出通知訊息", async () => {
    Product.findByPk = jest.fn().mockResolvedValue({
      id: 1,
      name: "Bitcoin",
    });
    //監聽console.log的function
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await sendNotification(testUser.id, 1, 21000, 20000);
    //應該要有被呼叫且內容是
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `通知:  使用者${testUser.username} Bitcoin 現在價格已達21000 您設定的目標價: 20000`
      )
    );

    consoleSpy.mockRestore();
  });
});
