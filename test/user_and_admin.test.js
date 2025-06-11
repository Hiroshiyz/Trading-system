const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
const User = require("../models").User;
const Holding = require("../models").Holding;
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
    console.log(res.body);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("username");
    expect(res.body.user).toHaveProperty("email");
    expect(res.body.user).toHaveProperty("role");
  });
});
