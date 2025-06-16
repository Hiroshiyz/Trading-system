const axios = require("axios");
const { Product } = require("../models");

async function fetchProductsFromAPI() {
  //第三方APICoinGecko
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/coins/markets",
    {
      params: {
        vs_currency: "usd",
        order: "market_cap-desc",
        per_page: 100, //前十大
        page: 1,
      },
    }
  );
  return response.data; //回傳一個array
}

async function syncProducts() {
  try {
    const APIProducts = await fetchProductsFromAPI();

    const upserts = APIProducts.map((p) => {
      const symbol = `${p.symbol.toUpperCase()}/USDT`;
      const name = p.name;
      const thirdPartyId = p.id;

      return Product.upsert({
        symbol,
        name,
        thirdPartyId,
        isAvailable: true,
      });
    });

    await Promise.all(upserts); //全部執行完畢才能完成動作
    console.log(" Product 同步成功存取資料庫");
  } catch (error) {
    console.error(" 同步失敗:", error.message);
  }
}
module.exports = {
  syncProducts,
};
