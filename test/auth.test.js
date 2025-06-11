const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");

const User = require("../models").User;
//初始化
beforeAll(async () => {
  await User.create({
    username: "customer",
    email: "abc123@gmail.com",
    password: "12345678",
    role: "user",
  });
});
afterAll(async () => {
  await User.destroy({ where: {}, truncate: true, cascade: true });
  await sequelize.close();
});

describe("POST /register", () => {
  const invalidEmails = ["anc1@", "anc.com", "@example.com", "123@.com"];

  invalidEmails.forEach((email) => {
    it(`email的格式錯誤 ${email}`, async () => {
      const res = await request(app).post("/auth/register").send({
        username: "customer",
        email: email,
        password: "12345678",
        role: "user",
      });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/email/i);
    });
  });

  it("應該要回傳409，如果有此使用者", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "customer",
      email: "abc123@gmail.com",
      password: "12345678",
      role: "user",
    });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("使用者已存在");
  });

  it("註冊帳號成功", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "customer",
      email: "abc1231@gmail.com",
      password: "123456788",
      role: "user",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.newUser).toHaveProperty("id");
    expect(res.body.newUser).toHaveProperty("email");
    expect(res.body.newUser).toHaveProperty("username");
    expect(res.body.newUser).toHaveProperty("role");
  });
});
describe("POST /login", () => {
  const invalidEmails = ["anc1@", "anc.com", "@example.com", "123@.com"];
  invalidEmails.forEach((email) => {
    it(`email的格式錯誤 ${email}`, async () => {
      const res = await request(app).post("/auth/register").send({
        username: "customer",
        email: email,
        password: "12345678",
        role: "user",
      });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/email/i);
    });
  });
  it("回傳400使用者不存在", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "abc13@gmail.com",
      password: "12345678",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("並未找到此使用者");
  });
  it("密碼錯誤", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "abc123@gmail.com",
      password: "12342141242",
    });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("密碼錯誤");
  });
  it("登入成功,並且成功製作token到cookie", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "abc123@gmail.com",
      password: "12345678",
    });
    expect(res.status).toBe(200);
    expect(res.body.token);
    console.log(res.body.token);
    expect(res.body.foundUser).toHaveProperty("id");
    expect(res.body.foundUser).toHaveProperty("username");
    expect(res.body.foundUser).toHaveProperty("email");
    expect(res.body.foundUser).toHaveProperty("password");
  });
});
