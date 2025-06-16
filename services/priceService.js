const axios = require("axios");
const redisClient = require("../lib/redisClient");
const TOP10_KEY = "top10-crypto-prices";
const CACHE_TTL = 60;
async function getTop10Conis() {
  // 先查快取
  try {
    let cached = await redisClient.get(TOP10_KEY);
    if (cached) {
      console.log("來自redis快取資料ˇ");
      return JSON.parse(cached);
    }
    //response.data
    let { data } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 10,
          page: 1,
        },
      }
    );
    //redis要用字串存入 key-value
    await redisClient.set(TOP10_KEY, JSON.stringify(data), { EX: CACHE_TTL });
    console.log("來自API並存入快取");
    return data;
  } catch (e) {
    return console.error;
  }
}

async function getRealTimePrices(ids) {
  try {
    let cached = await redisClient.get(ids);
    if (cached) {
      console.log("來自快取的即時價格");
      let parsed = JSON.parse(cached);
      //因為這邊會回完一個物件{bitcoin:{usd:xxxx}}
      return parsed[ids]?.usd;
    }
    let { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          vs_currencies: "usd",
          ids,
        },
      }
    );

    await redisClient.set(ids, JSON.stringify(data), {
      EX: CACHE_TTL,
    });

    return data[ids]?.usd;
  } catch (error) {
    console.log(error);
    throw new Error("無法取得價格");
  }
}
module.exports = {
  getTop10Conis,
  getRealTimePrices,
};
