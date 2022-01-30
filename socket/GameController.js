import log from "../logger.js";

class GameController {
  /**
   * room_id {
   *        player : [socket.id,socket.id],
   *        turn: socket.id,
   *        board: [19x19] // default:-1
   * }
   */
  _game = new Map();

  add(room_id, player) {
    log.info(`Created Game[${room_id}]`);
    this._game.set(room_id, {
      player: player,
      turn: player[Math.floor(Math.random() * 2)],
      board: Array(19).fill(Array(19).fill(-1)), // arr[19][19] fill with -1
    });
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
    let m_game = this._game.get(room_id); // modified game
    m_game["board"][x][y] = m_game["player"].indexOf(m_game["turn"]); // 0 or 1
    this._game.set(room_id, m_game);
    return true;
  }

  nextTurn(room_id) {
    let m_game = this._game.get(room_id); // modified game
    m_game["turn"] = !m_game["player"].indexOf(m_game["turn"]);
    this._game.set(room_id, m_game);
    return m_game["turn"];
  }
}

export default new GameController();
