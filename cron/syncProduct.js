const cron = require("node-cron");

const productService = require("../services/productService");

cron.schedule("0 * * * *", async () => {
  //分 時 日 月 星期
  console.log("同步幣種資料....");
  try {
    await productService.syncProducts();
  } catch (e) {
    console.log(e + "同步失敗");
  }
});
