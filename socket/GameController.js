import log from "../logger.js";

function createArray(length) {
  var arr = new Array(length || 0),
    i = length;

  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    while (i--) arr[length - 1 - i] = createArray.apply(this, args);
  }

  return arr;
}

class GameController {
  /**
   * room_id {
   *        player : [socket.id,socket.id],
   *        turn: socket.id,
   *        board: [8x8] // default:-1
   * }
   */
  _game = new Map();

  add(room_id) {
    log.info(`Created Game[${room_id}]`);
    this._game.set(room_id, {
      player: [],
      turn: -1,
      board: Array(8)
        .fill(null)
        .map(() => Array(8).fill(-1)), // arr[8][8] fill with -1
    });
  }

  set(room_id, player) {
    log.info(`Setted Game[${room_id}]`);
    this._game.set(room_id, {
      player: player,
      turn: player[Math.floor(Math.random() * 2)],
      board: Array(8)
        .fill(null)
        .map(() => Array(8).fill(-1)), // arr[19][19] fill with -1
    });
  }

  getGameInfo(room_id) {
    if (!this._game.has(room_id)) {
      log.error(`Game[${room_id}] Not Found Or Not Started`);
      return { room_id: null, player: null, turn: null, board: null };
    }
    return {
      room_id: room_id,
      player: this._game.get(room_id)["player"],
      turn: this._game.get(room_id)["turn"],
      board: this._game.get(room_id)["board"],
    };
  }

  getTurn(room_id) {
    if (!this._game.has(room_id)) {
      log.error(`Game[${room_id}] Not Found`);
      return false;
    }

    return this._game.get(room_id)["turn"];
  }

  putStone(room_id, x, y) {
    if (!this._game.has(room_id)) {
      log.error(`Game[${room_id}] Not Found`);
      return false;
    }

    if (this._game.get(room_id)["board"][x][y] !== -1) {
      log.error(`Game[${room_id}] Board[${x},${y}] is already placed!`);
      return false;
    }

    log.info(
      `Game[${room_id}] Board[${x},${y}] is placed by ${
        this._game.get(room_id)["turn"]
      }`
    );
    this._game.get(room_id)["board"][x][y] = this._game
      .get(room_id)
      ["player"].indexOf(this._game.get(room_id)["turn"]); // 0 or 1
    this.nextTurn(room_id);
    return true;
  }

  nextTurn(room_id) {
    this._game.get(room_id)["turn"] =
      this._game.get(room_id)["player"][
        (this._game
          .get(room_id)
          ["player"].indexOf(this._game.get(room_id)["turn"]) +
          1) %
          2
      ];

    return this._game.get(room_id)["turn"];
  }
}

export default new GameController();
