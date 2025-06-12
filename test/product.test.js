const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
afterAll(async () => {
  await sequelize.close();
});
/* eslint-env jest */
describe("產品相關 API", () => {
  describe("GET /products", () => {
    it("應該回傳所有產品", async () => {
      const res = await request(app).get("/products");
      console.log(res.body.allProducts);
      expect(res.status).toBe(200);
      expect(res.body.allProducts[0]).toHaveProperty("name");
      expect(res.body.allProducts[0]).toHaveProperty("thirdPartyId");
    });
  });
});
