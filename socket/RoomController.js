import log from "../logger.js";

class RoomController {
  /**
   * room_id: {
   *        room_status: "waiting" or "playing"
   *        player : Map (socket.id=>status,socket.id=>status),
   *        spectator : Map (socket.id=>status ...)
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

  getRoomList() {
    return [...this._room].map(([key, value]) => ({
      room_id: key,
      room_status: value["room_status"],
    }));
  }

  setStatus(room_id, status) {
    log.info(`Room[${room_id}] set Status[${status}]`);
    let m_room = this._room.get(room_id); // modified room
    m_room["room_status"] = status;
    this._room.set(room_id, m_room);
  }

  getPlayer(room_id) {
    // use before game start
    if (!this._room.has(room_id)) {
      log.error(`Room[${room_id}] Not Found`);
      return false;
    }
    return [...this._room.get(room_id)["player"].keys()];
  }

  setSpectator(room_id, socket_id) {
    if (!this._room.has(room_id)) {
      log.error(`Room[${room_id}] Not Found`);
      return false;
    }

    log.info(`User[${socket_id}] be Spectator in Room[${room_id}]`);
    let m_room = this._room.get(room_id); // modified room
    m_room["spectator"].add(socket_id);
    this._room.set(room_id, m_room);

    return true;
  }

  setPlayer(room_id, socket_id) {
    if (!this._room.has(room_id)) {
      log.error(`Room[${room_id}] Not Found`);
      return false;
    }

    log.info(`User[${socket_id}] be Player in Room[${room_id}]`);

    let m_room = this._room.get(room_id); // modified room
    m_room["spectator"].delete(socket_id);
    m_room["player"].set(socket_id, 0);
    this._room.set(room_id, m_room);
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
    let m_room = this._room.get(room_id); // modified room
    m_room["player"].set(socket_id, 1);
    this._room.set(room_id, m_room);
    return true;
  }
}

export default new RoomController();
