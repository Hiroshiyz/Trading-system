# 模擬交易平台

為了瞭解市面上交易所 App 是如何運作，並著手實作專案，此專案可用來模擬虛擬貨幣買賣交易，並提供簡易的Ｋ線圖

---

## 目錄

- [專案介紹](#專案介紹)
- [安裝](#安裝)
- [環境變數設定](#環境變數設定)
- [使用說明](#使用說明)
- [API 路由](#api-路由)
- [授權與認證](#授權與認證)
- [測試](#測試)
- [貢獻](#貢獻)
- [授權](#授權)

---

## 專案介紹

此專案為 trading system，使用 Node.js + Express + Passport JWT 做身份驗證，搭配 PostgreSQL 作為資料庫，使用 sequelize (ORM) 創建 並用 migrations 紀錄版本。

目前完成：

- 使用者註冊、登入
- JWT 產生與 Cookie 儲存 (HttpOnly) //為了防止 XSS 且使不易被 JS 讀取
- Passport JWT 中介軟體驗證
- 角色權限控管 (User / Admin)
- 錯誤處理與基本驗證

---

## 安裝

```bash
git clone https://github.com/你的帳號/專案名稱.git
cd 你的專案名稱
npm install
```

## 環境變數設定

建立 `.env` 檔案，內容示例：

```env
PORT = 你的port
HOST = "預設是localhost"
PRIVATE_KEY_PATH=./keys/private.key  //皆為預設值
PUBLIC_KEY_PATH=./keys/public.key    //皆為預設值
```

## 使用說明

建議先安裝 `nodemon` 套件

```bash
nodemon sersver.js
```

## API 路由

| 方法 | 路由             | 說明           | 權限       |
| ---- | ---------------- | -------------- | ---------- |
| POST | /auth/login      | 使用者登入     | 公開       |
| POST | /auth/logout     | 使用者登出     | 登入用戶   |
| GET  | /user/profile    | 取得使用者資料 | User/Admin |
| GET  | /admin/dashboard | 管理員專用頁面 | Admin      |

## 授權與認證

- 使用 Passport.js 搭配 passport-jwt 驗證 JWT Token。

- JWT Token 透過 HttpOnly Cookie 存取。

- 角色權限控管由 middleware authorizeRole 實作

## 測試

建議可以先用 Postman 測試 API，需先登入取得 cookie。
後續可用 EJS 測試
若要跨域`cors` 請設定 並將:

```js
res.cookie("token", token, {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000, // 1 天
  secure: true, // 因為要同時設 sameSite=None，必須開啟 HTTPS
  sameSite: "none",
});
```
