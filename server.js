import App from "./app.js";
import AppConfig from "./configs/AppConfig.js";
import Socket from "./socket/SocketRoute.js";

import http from "http";
// import https from "https";

const port = AppConfig.PORT || 3000;

const app = App.get();
const server = http.createServer(app);

/* socket io server connect */
Socket.attach(server);
// const io = new Server(server);
app.set("io", Socket);

server
  .listen(port, () => {
    return console.log(`Express server listening at ${port}`);
  })
  .on("error", (_error) => {
    return console.log(_error);
  });

export default app;
