import crypto from "crypto";
import jwt from "jsonwebtoken";
import log from "../logger.js";

import RoomController from "./RoomController.js";
import GameController from "./GameController.js";

import ClientEvents from "./constants/ClientEvents.js";
import AppConfig from "../configs/AppConfig.js";

class SocketController {
  /**
   * User Disconnected
   * @param {*} socket
   */
  disconnect(io, socket) {
    let room_id = RoomController.quitUser(socket.id) || "robby";
    if (room_id != "robby") {
      io.in(room_id).emit(ClientEvents.COMMAND, {
        command: ClientEvents.QUITUSER,
        socket_id: socket.id,
      });
      this.updateRoomList(io, socket);

      if (RoomController.isRoomExist(room_id)) {
        io.in(room_id).emit(ClientEvents.COMMAND, {
          command: ClientEvents.ROOMINFO,
          room_info: RoomController.getRoomInfo(room_id),
          game_info: GameController.getGameInfo(room_id),
        });
      }
    }
    log.info(`User[${socket.id}] Disconnected from Room[${room_id}]`);
  }

  /**
   * Create Room and Join
   * @param {*} io
   * @param {*} socket
   */
  create(io, socket) {
    let room_id = crypto.randomBytes(4).toString("hex");

    socket.leave("robby");
    socket.join(room_id);

    // Spread Created Room
    RoomController.add(room_id);
    RoomController.setSpectator(room_id, socket.id); // T/F
    RoomController.setPlayer(room_id, socket.id); // T/F
    GameController.add(room_id);

    // update local RoomInfo
    this.updateRoomInfo(io, socket);

    // broadcast Room List to all
    this.updateRoomList(io, socket);
  }

  /**
   * Join Room as player or spectator
   * @param {*} io
   * @param {*} socket
   * @param {*} info
   */
  join(io, socket, info) {
    if (!info.room_id) {
      log.error(`User[${socket.id}] Join Room Failed`);
      return; // TODO: emit Error
    }
    let room_id = info.room_id;

    if (RoomController.setSpectator(room_id, socket.id)) {
      log.info(`User[${socket.id}] Joined Room[${room_id}]`);

      socket.leave("robby");
      socket.join(room_id);

      RoomController.setPlayer(room_id, socket.id); // T/F auto join as player if room less than 2

      this.updateRoomInfo(io, socket); // update local RoomInfo
    }
  }

  /**
   * set Game Ready && Start Game
   * @param {*} io
   * @param {*} socket
   */
  ready(io, socket) {
    let room_id = this.getRoomId(socket);
    // if (!RoomController.isReady(room_id)) {
    //   log.error(`User[${socket.id}] Ready Failed Room[${room_id}] is playing`);
    //   return;
    // }
    RoomController.setReady(room_id, socket.id);

    if (RoomController.isReady(room_id)) {
      RoomController.setStatus(room_id, "playing");
      GameController.set(room_id, RoomController.getPlayer(room_id));
      GameController.initializeStone(room_id);
    }

    this.updateRoomInfo(io, socket);
  }

  /**
   * User Put Stone check validation and broadcast
   * @param {*} io
   * @param {*} socket
   * @param {*} info {x,y}
   */
  putStone(io, socket, info) {
    console.log(info);
    if (info.index < 0) {
      log.error(`User[${socket.id}] putStone Failed`);
      return; // TODO: emit Error
    }

    let room_id = this.getRoomId(socket);
    if (GameController.getTurn(room_id) === socket.id) {
      if (GameController.putStone(room_id, info.index)) {
        this.updateRoomInfo(io, socket);
      }
    }
    // io.in(room_id).emit(ClientEvents.COMMAND, {
    //   command: ClientEvents.PUTSTONE,
    //   user: socket.id,
    //   x: info.x,
    //   y: info.y,
    // });
    // io.in(room_id).emit(ClientEvents.COMMAND, {
    //   command: ClientEvents.TURN,
    //   turn: GameController.nextTurn(room_id),
    // });
  }

  send_socket_id(io, socket){
    socket.emit(ClientEvents.COMMAND, {
      command: ClientEvents.SENDID,
      socket_id: socket.id,
    });
  }

  /**
   * Update Room List in robby for request
   * @param {*} io
   * @param {*} socket
   */
  updateRoomList_solo(io, socket) {
    socket.emit(ClientEvents.COMMAND, {
      command: ClientEvents.UPDATEROOM,
      room_list: RoomController.getRoomList(),
    });
    this.send_socket_id(io, socket);
  }

  /**
   * Update Room List in robby
   * @param {*} io
   * @param {*} socket
   */
  updateRoomList(io, socket) {
    io.in("robby").emit(ClientEvents.COMMAND, {
      command: ClientEvents.UPDATEROOM,
      room_list: RoomController.getRoomList(),
    });
  }

  /**
   * Update Room Info in Specific Room
   * @param {*} io
   * @param {*} socket
   */
  updateRoomInfo(io, socket) {
    let room_id = this.getRoomId(socket);
    io.in(room_id).emit(ClientEvents.COMMAND, {
      command: ClientEvents.ROOMINFO,
      room_info: RoomController.getRoomInfo(room_id),
      game_info: GameController.getGameInfo(room_id),
    });
  }

  /**
   * Util : AutoJoin
   */
  autoJoin(io, socket) {
    let room_available = RoomController.getRoomList().filter(
      ({ room_status }) => room_status === "waiting"
    );
    if (room_available.length > 0) {
      this.join(io, socket, { room_id: room_available.shift()["room_id"] });
      this.ready(io, socket);
    }
  }

  /**
   * Util : AutoCreate
   */
  autoCreate(io, socket) {
    this.create(io, socket);
    this.ready(io, socket);
  }

  /**
   *  Util : get User Room id
   * @param {*} socket
   */
  getRoomId(socket) {
    let temp = socket.rooms.values();
    temp.next(); // socket.id
    return temp.next().value;
  }

  /**
   * Automation of Room cases
   */
  test() {
    /***** TEST SCRIPT START ******/
    let room_id;
    for (let i = 0; i < 5; i++) {
      room_id = crypto.randomBytes(4).toString("hex");
      RoomController.add(room_id);
    }
    console.log(
      "Test Room Created : " + JSON.stringify(RoomController.get(room_id))
    );
    /***** TEST SCRIPT END ******/
  }
}

export default new SocketController();
