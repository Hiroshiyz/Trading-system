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
const { checkPriceAlert } = require("../services/alertService");
let token;
beforeAll(async () => {
  await User.create({
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

describe("POST /orders", () => {
  let mockedPrice = 50000;
  axios.get.mockResolvedValue({
    data: [{ current_price: mockedPrice }],
  });
  it("格式不正確沒有填入數量回傳400", async () => {
    const res = await request(app)
      .post("/user/orders")
      .set("Cookie", token)
      .send({
        type: "buy",
        thirdPartyId: "bitcoin",
        //故意沒填
      });
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/quantity/i);
  });
  it("成功下單", async () => {
    const res = await request(app)
      .post("/user/orders")
      .set("Cookie", token)
      .send({
        type: "buy",
        thirdPartyId: "bitcoin",
        quantity: 1,
      });
    expect(res.status).toBe(201);
    console.log(res.body.message);
    expect(res.body.order).toHaveProperty("price");
  });
  it("成功賣出", async () => {
    mockedPrice = 600000;
    axios.get.mockResolvedValue({
      data: [{ current_price: mockedPrice }],
    });
    const res = await request(app)
      .post("/user/orders")
      .set("Cookie", token)
      .send({
        type: "sell",
        thirdPartyId: "bitcoin",
        quantity: 1,
      });
    expect(res.status).toBe(201);
    console.log(res.body.message);
    expect(res.body.order).toHaveProperty("price");
  });
});
describe("createOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("應該成功下單並回傳成功", async () => {
    //模擬現價
    axios.get.mockResolvedValue({
      data: [{ current_price: 50000 }],
    });

    // 模擬資料庫
    Product.findOne = jest.fn().mockResolvedValue({ id: 1 });
    Holding.findOne = jest.fn().mockResolvedValue(null);
    Holding.create = jest.fn().mockResolvedValue({ id: 1 });
    Order.create = jest.fn().mockResolvedValue({ id: 1, price: 50000 });
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
    expect(result.price).toBe(50000);
    expect(Order.create).toHaveBeenCalled();
    expect(Transaction.create).toHaveBeenCalled();
    expect(fackTransaction.commit).toHaveBeenCalled();
  });
});
describe("GET /holding", () => {
  it("持倉查詢", async () => {
    const res = await request(app).get("/user/holding").set("Cookie", token);
    // console.log(res.body.holding);
    expect(res.status).toBe(200);
    expect(res.body.holding[0]).toHaveProperty("quantity");
    expect(res.body.holding[0]).toHaveProperty("id");
    expect(res.body.holding[0]).toHaveProperty("product");
  });
});
describe("GET /transaction", () => {
  it("交易查詢", async () => {
    const res = await request(app)
      .get("/user/transaction")
      .set("Cookie", token);
    // console.log(res.body.transaction);
    expect(res.status).toBe(200);
    expect(res.body.transaction[0]).toHaveProperty("id");
    expect(res.body.transaction[0]).toHaveProperty("type");
    expect(res.body.transaction[0]).toHaveProperty("price");
    expect(res.body.transaction[0]).toHaveProperty("total");
    expect(res.body.transaction[0]).toHaveProperty("order");
  });
});

describe("POST /priceAlert", () => {
  it("新增通知", async () => {
    const res = await request(app)
      .post("/user/priceAlert")
      .send({
        productId: 1,
        targetPrice: 200000,
        condition: "lte",
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
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("大於目標價格時", async () => {
    axios.get.mockResolvedValue({
      data: [{ current_price: 21000 }],
    });
    await PriceAlert.create({
      userId: 67,
      productId: 1,
      targetPrice: 20000,
      condition: "gte",
      isNotified: false,
    });
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await checkPriceAlert();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("通知:"));
    consoleSpy.mockRestore();
  });
});
