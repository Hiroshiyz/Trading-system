/* eslint-env jest */
const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
const { User } = require("../models");
let token;
beforeAll(async () => {
  await User.create({
    username: "admintest",
    email: "test@gmail.com",
    password: "12345678",
    role: "admin",
  });
  await User.create({
    username: "test1",
    email: "test1@gmail.com",
    password: "12345678",
    role: "user",
  });
  await User.create({
    username: "test2",
    email: "test2@gmail.com",
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

describe("GET /dashboard", () => {
  it("成功回傳管理者資料", async () => {
    const res = await request(app).get("/admin/dashboard").set("Cookie", token);
    expect(res.status).toBe(200);

    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("email");
    expect(res.body.user).toHaveProperty("role");
  });
});

describe("GET /userList", () => {
  it("成功回傳所有使用者資料", async () => {
    const res = await request(app).get("/admin/userList").set("Cookie", token);
    expect(res.status).toBe(200);
    console.log(res.body);
    expect(res.body.allUser[0]).toHaveProperty("id");
    expect(res.body.allUser[0]).toHaveProperty("email");
    expect(res.body.allUser[0]).toHaveProperty("username");
  });
});

describe("GET /userList/:id", () => {
  const userId = 7; // 假設 user id
  it("成功回傳所有使用者資料", async () => {
    const res = await request(app)
      .get(`/admin/userList/${userId}`)
      .set("Cookie", token);
    expect(res.status).toBe(200);
    console.log(res.body);
    expect(res.body.foundUser).toHaveProperty("id");
    expect(res.body.foundUser).toHaveProperty("email");
    expect(res.body.foundUser).toHaveProperty("username");
  });
});
