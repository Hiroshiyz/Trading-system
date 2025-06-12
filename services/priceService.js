const axios = require("axios");
const NodeCache = require("node-cache");

const priceCache = new NodeCache({ stdTTL: 30 }); // 快取30秒

async function getRealTimePrice(productId, thirdPartyId) {
  // 先查快取
  let cachedPrice = priceCache.get(productId);
  if (cachedPrice !== undefined) {
    return { currentPrice: cachedPrice, fromCache: true };
  }

  // 沒有快取，呼叫第三方API
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/coins/markets",
    {
      params: {
        vs_currency: "usd",
        id: thirdPartyId,
      },
    }
  );

  if (!res.data || res.data.length === 0) {
    throw new Error("查無現價");
  }

  const currentPrice = res.data[0].current_price;

  // 設定快取
  priceCache.set(productId, currentPrice);

  return { currentPrice, fromCache: false };
}

module.exports = getRealTimePrice;
