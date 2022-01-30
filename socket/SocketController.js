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
  disconnect(socket) {
    log.info(`User[${socket.id}] Disconnected`);
  }

  /**
   * Spread Room List in robby
   * @param {*} io
   * @param {*} socket
   */
  getRoomInfo(io, socket) {
    socket.emit(ClientEvents.COMMAND, {
      command: ClientEvents.GETROOM,
      room_list: RoomController.getRoomList(),
    });
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

    // broadcast Room List to all
    io.in("robby").emit(ClientEvents.COMMAND, {
      command: ClientEvents.GETROOM,
      room_list: RoomController.getRoomList(),
    });
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

    if (RoomController.setSpectator(info.room_id, socket.id)) {
      log.info(`User[${socket.id}] Joined Room[${info.room_id}]`);
      socket.leave("robby");
      socket.join(info.room_id);
    }
  }

  /**
   * set Game Ready && Start Game
   * @param {*} io
   * @param {*} socket
   */
  ready(io, socket) {
    let room_id = this.getRoomId(socket);
    RoomController.setReady(room_id, socket.id);

    if (RoomController.isReady(room_id)) {
      RoomController.setStatus(room_id, "playing");
      GameController.add(room_id, RoomController.getPlayer(room_id));
      io.in(room_id).emit(ClientEvents.COMMAND, {
        command: ClientEvents.TURN,
        turn: GameController.getTurn(room_id),
      });
    }
  }

  /**
   * User Put Stone check validation and broadcast
   * @param {*} io
   * @param {*} socket
   * @param {*} info {x,y}
   */
  putStone(io, socket, info) {
    if (!info.x | !info.y) {
      log.error(`User[${socket.id}] putStone Failed`);
      return; // TODO: emit Error
    }

    let room_id = this.getRoomId(socket);
    if (
      GameController.getTurn(room_id) === socket.id &&
      GameController.putStone(room_id, info.x, info.y)
    ) {
      io.in(room_id).emit(ClientEvents.COMMAND, {
        command: ClientEvents.putStone,
        user: socket.id,
        x: info.x,
        y: info.y,
      });
      io.in(room_id).emit(ClientEvents.COMMAND, {
        command: ClientEvents.turn,
        turn: GameController.nextTurn(room_id),
      });
    }
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
    temp.next();
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
