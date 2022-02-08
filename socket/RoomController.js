import log from "../logger.js";

class RoomController {
  /**
   * room_id: {
   *        room_status: "waiting" or "playing"
   *        player : Map (socket.id=>status,socket.id=>status),
   *        spectator : Set (socket.id)
   * }
   */
  _room = new Map();

  add(room_id) {
    log.info(`Created Room[${room_id}]`);
    this._room.set(room_id, {
      room_status: "waiting",
      player: new Map(),
      spectator: new Set(),
    });
  }

  isRoomExist(room_id) {
    return this._room.has(room_id);
  }

  getRoomInfo(room_id) {
    if (!this._room.has(room_id)) {
      log.error(`Room[${room_id}] Not Found`);
      return false;
    }
    return {
      room_id: room_id,
      room_status: this._room.get(room_id)["room_status"],
      player: [...this._room.get(room_id)["player"]],
      spectator: [...this._room.get(room_id)["spectator"]],
    };
  }

  quitUser(socket_id) {
    for (let [room_id, { room_status, player, spectator }] of this._room) {
      let flag = true;
      if (player.has(socket_id)) {
        player.delete(socket_id);
      } else if (spectator.has(socket_id)) {
        spectator.delete(socket_id);
      } else {
        flag = false;
      }

      if (player.size + spectator.size === 0 || ((player.size + spectator.size) === 1 && player.has(TEST_AI))) this._room.delete(room_id);

      if (flag) {
        if (room_status == "playing") {
          //TODO : lose game
          log.info("TODO : lose game");
        } else if (room_status === "waiting" && spectator.size > 0) {
          this.setPlayer(room_id, spectator.values().next().value);
        }

        return room_id;
      }
    }
  }

  getRoomList() {
    return [...this._room].map(([key, value]) => ({
      room_id: key,
      room_status: value["room_status"],
    }));
  }

  setStatus(room_id, status) {
    log.info(`Room[${room_id}] set Status[${status}]`);
    this._room.get(room_id)["room_status"] = status; // modified room
  }

  setSpectator(room_id, socket_id) {
    if (!this._room.has(room_id)) {
      log.error(`Room[${room_id}] Not Found`);
      return false;
    }

    log.info(`User[${socket_id}] be Spectator in Room[${room_id}]`);
    this._room.get(room_id)["spectator"].add(socket_id);
    return true;
  }

  getPlayer(room_id) {
    // use before game start
    if (!this._room.has(room_id)) {
      log.error(`Room[${room_id}] Not Found`);
      return false;
    }
    return [...this._room.get(room_id)["player"].keys()];
  }

  setPlayer(room_id, socket_id) {
    if (!this._room.has(room_id)) {
      log.error(`Room[${room_id}] Not Found`);
      return false;
    }

    if (this._room.get(room_id)["player"].size > 1) {
      return false;
    }

    log.info(`User[${socket_id}] be Player in Room[${room_id}]`);
    this._room.get(room_id)["spectator"].delete(socket_id);
    this._room.get(room_id)["player"].set(socket_id, 0);
    return true;
  }

  isReady(room_id) {
    if (!this._room.has(room_id)) {
      log.error(`Room[${room_id}] Not Found`);
      return false;
    }
    return (
      [...this._room.get(room_id)["player"].values()].filter((i) => i === 1)
        .length === 2
    );
  }

  setReady(room_id, socket_id) {
    if (!this._room.has(room_id)) {
      log.error(`Room[${room_id}] Not Found`);
      return false;
    }

    if (
      !this._room.get(room_id)["player"].has(socket_id) &&
      this._room.get(room_id)["player"].size >= 2
    ) {
      log.error(`Room[${room_id}] player is Full`);
      return false;
    }

    log.info(`User[${socket_id}] ready in Room[${room_id}]`);
    this._room.get(room_id)["player"].set(socket_id, 1);
    return true;
  }

  initializePLayer(room_id){
    if (!this._room.has(room_id)) {
      log.error(`Room[${room_id}] Not Found`);
      return false;
    }
    if(this._room.get(room_id)["room_status"] === "playing"){
      for(let i = 0; i<2; i++){
        this._room.get(room_id)["player"].set(this._room.get(room_id)["player"][i], 0);
      }
      this._room.get(room_id)["room_status"] === "waiting";
    }
    return true;
    
  }
}

export default new RoomController();
