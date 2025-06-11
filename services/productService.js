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
        per_page: 10, //前十大
        page: 1,
      },
    }
  );
  return response.data; //回傳一個array
}

async function syncProducts() {
  const APIProducts = await fetchProductsFromAPI();

  for (let p of APIProducts) {
    const symbol = `${p.symbol.ToUpperCase()}/USDT`; //讓他放BTC / USDT這樣
    const name = p.name;
    const thirdPartyId = p.ids;

    await Product.upsert({
      symbol,
      name,
      thirdPartyId,
      isAvailable: true,
    });
    //判定主key存在此筆資料?or不存在 if存在則更新不存在及新增
  }
  console.log("Product 同步成功存取資料庫");
}

module.exports = {
  syncProducts,
};
