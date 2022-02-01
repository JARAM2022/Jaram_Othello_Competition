/**
 * Socket
 */

import { Server } from "socket.io";

import log from "../logger.js";
import SocketController from "./SocketController.js";
import ServerEvents from "./constants/ServerEvents.js";
import GameEvents from "./constants/GameEvents.js";

const io = new Server();

// SocketController.test(); // testcase

/**
 * default route
 * user will listen -> command
 */
io.of("/").on(ServerEvents.CONNECTION, (socket) => {
  /* Socket joined */
  log.info(`User[${socket.id}] Connected at /`);
  socket.join("robby");
  SocketController.updateRoomList_solo(io, socket);

  /* Socket disconnected */
  socket.on(ServerEvents.DISCONNECT, () =>
    SocketController.disconnect(io, socket)
  );

  /**
   * handle Room
   */
  socket.on(ServerEvents.GETROOM, () =>
    SocketController.updateRoomList(io, socket)
  );

  socket.on(ServerEvents.CREATEROOM, () => SocketController.create(io, socket));

  socket.on(ServerEvents.JOINROOM, (info) =>
    SocketController.join(io, socket, info)
  );

  socket.on(ServerEvents.READY, (info) =>
    SocketController.ready(io, socket, info)
  );

  socket.on(ServerEvents.AUTOJOIN, () => SocketController.autoJoin(io, socket));

  socket.on(ServerEvents.AUTOCREATE, () =>
    SocketController.autoCreate(io, socket)
  );

  /**
   * handle Game
   */
  socket.on(GameEvents.PUTSTONE, (info) => {
    SocketController.putStone(io, socket, info);
  });
});

export default io;
