// 中介層（middleware）設計題

// 請實作一個 Express middleware，用於檢查 API token 是否存在，無 token 則回傳 401。
const tokenHandler = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) return res.status(401).json({ mssage: "Unauthorized" });
};
