module.exports = function handleWebSocket(wss) {
  wss.on("connection", (ws) => {
    console.log(" WebSocket client connected");

    // 初次連線訊息
    ws.send(JSON.stringify({ message: "WebSocket 已連線成功！" }));

    // 接收訊息
    ws.on("message", (data) => {
      console.log(" 收到訊息：", data.toString());
    });

    // 離線
    ws.on("close", () => {
      console.log(" Client 離線");
    });
  });
};
