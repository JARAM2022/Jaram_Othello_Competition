import log from "../logger.js";
import fs from 'fs';
import path from 'path';

function createArray(length) {
  var arr = new Array(length || 0),
    i = length;

  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    while (i--) arr[length - 1 - i] = createArray.apply(this, args);
  }
  return arr;
}

function boardToTernary(board){
  let res = 0n;
  for(var i = 0; i<8; i ++){
    for(var j = 0; j<8; j ++){
      res *= 3n;
      res += (BigInt(board[i][j])+1n);
    }
  }
  return res;
}

function ternaryToBoard(num){
  let temp = num;
  let divTemp = 1144561273430837494885949696427n;
  let res = Array(8)
  .fill(null)
  .map(() => Array(8).fill(-1));
  for(var i = 0; i<8; i ++){
    for(var j = 0; j<8; j ++){
      res[i][j] = parseInt(temp / divTemp) - 1;
      temp = (temp % divTemp);
      divTemp /= 3n;
    }
  }
  return res;
}

function copyBoard(board){
  let res = Array(8)
  .fill(null)
  .map(() => Array(8).fill(-1));
  for(var i = 0; i<8; i ++){
    for(var j = 0; j<8; j ++){
      res[i][j] = board[i][j];
    }
  }
  return res;
}

function boardToLog(board){
  for(let i = 0; i< 8 ; i++){
      console.log(board[i][0]+1,board[i][1]+1,board[i][2]+1,board[i][3]+1,board[i][4]+1,board[i][5]+1,board[i][6]+1,board[i][7]+1);
  }
}

// console.log(ternaryToBoard(984971066491994656644n));


let gameCase = require('../data/GameCase.json');
// let caseCount = 0;

// function readGameCase(){
//   fs.readFileSync(path.resolve(__dirname, '../data/GameCase.json'), 'utf8', function readFileCallback(err, data){
//     if (err){
//         console.log(err);
//     } else {
//       gameCaseObj = JSON.parse(data); //now it an object
//       dat = JSON.parse(data);
//   }});
// }
// console.log(gameCase);


function updateGameCase(key, value){
  gameCase[String(key)] = value;
  // console.log(jsonData);
  for(let i = 0; i<value[2].length;i++){
    gameCase[String(key)][2][i] = String(gameCase[String(key)][2][i]);
  }
  let json = JSON.stringify(gameCase);
  fs.writeFile(path.resolve(__dirname, '../data/GameCase.json'), json, 'utf8', (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
  // caseCount++;
  // if (caseCount > 5){
  //   fs.writeFile(path.resolve(__dirname, '../data/GameCase.json'), json, 'utf8', (err) => {
  //     if (err) throw err;
  //     console.log('Data written to file');
  //   });
  //   caseCount = 0;
  // } 
}


class GameController {
  /**
   * room_id {
   *        player : [socket.id,socket.id],
   *        turn: socket.id,
   *        board: [8x8] // default:-1,
   *        placeable: []
   *    
   * }
   */
  _game = new Map();
  //////
  

  add(room_id) {
    log.info(`Created Game[${room_id}]`);
    this._game.set(room_id, {
      player: [],
      turn: -1,
      board: Array(8)
        .fill(null)
        .map(() => Array(8).fill(-1)), // arr[8][8] fill with -1
      placeable: [],
    });
  }

  set(room_id, player) {
    log.info(`Setted Game[${room_id}]`);
    this._game.set(room_id, {
      player: player,
      turn: player[0],
      board: Array(8)
        .fill(null)
        .map(() => Array(8).fill(-1)), // arr[19][19] fill with -1
      placeable: gameCase[String(350258943680422884n)],
    });
    // console.log(this._game.get(room_id)["placeable"]);
  }
////////////
  initializeStone(room_id){
    this._game.get(room_id)["board"][3][3] = 1;
    this._game.get(room_id)["board"][3][4] = 0;
    this._game.get(room_id)["board"][4][3] = 0;
    this._game.get(room_id)["board"][4][4] = 1;
    return;
  }

  
///////
  getGameInfo(room_id) {
    if (!this._game.has(room_id)) {
      log.error(`Game[${room_id}] Not Found Or Not Started`);
      return { room_id: null, player: null, turn: null, board: null, placeable: null };
    }
    return {
      room_id: room_id,
      player: this._game.get(room_id)["player"],
      turn: this._game.get(room_id)["turn"],
      board: this._game.get(room_id)["board"],
      placeable: this._game.get(room_id)["placeable"],
    };
    
  }

  getTurn(room_id) {
    if (!this._game.has(room_id)) {
      log.error(`Game[${room_id}] Not Found`);
      return false;
    }

    return this._game.get(room_id)["turn"];
  }

  putStone(room_id, index) {
    if (!this._game.has(room_id)) {
      log.error(`Game[${room_id}] Not Found`);
      return false;
    }

    // if (this._game.get(room_id)["board"][x][y] !== -1) {
    //   log.error(`Game[${room_id}] Board[${x},${y}] is already placed!`);
    //   return false;
    // }
    log.info(
      `Game[${room_id}] Board[${this._game.get(room_id)["placeable"][0][index][0]},${this._game.get(room_id)["placeable"][0][index][1]}] is placed by ${
        this._game.get(room_id)["turn"]
      }`
    );

    let next_data = BigInt(this._game.get(room_id)["placeable"][2][index]);
    

    this._game.get(room_id)["board"] = ternaryToBoard(next_data);

    // console.log(boardToLog(this._game.get(room_id)["board"]));

    // this._game.get(room_id)["board"][x][y] = this._game
    //   .get(room_id)
    //   ["player"].indexOf(this._game.get(room_id)["turn"]); // 0 or 1

    return this.nextTurn(room_id,next_data)
  }

  isOnBoard(x,y){
    return ((x >= 0) && (x < 8) && (y >= 0) && (y < 8));
  }

  isValidPlace(room_id,next_index,current_index, x_check, y_check){
    // console.log("isvalidplace");
    // console.log(room_id, next_index, current_index, x_check, y_check);



    let data = [false, 0n];
    let board = copyBoard(this._game.get(room_id)["board"]);
    // console.log(board);
    if((board[x_check][y_check] != -1) || !this.isOnBoard(x_check, y_check)){
      return data;
    }
    let tiles_to_flip = [];
    let direction = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

    for(let i = 0; i<8; i++){
      let x = x_check;
      let y = y_check;
      x += direction[i][0];
      y += direction[i][1];
      // console.log(board);
      // console.log(`x ${x} y ${y}`);
      if (this.isOnBoard(x,y) && (board[x][y] === current_index)){
        x += direction[i][0];
        y += direction[i][1];
        if (!this.isOnBoard(x, y)){
          continue;
        }
            
        while(board[x][y] === current_index){
          x += direction[i][0];
          y += direction[i][1];
          if (!this.isOnBoard(x, y)){
            break;
          }
        }
        if (!this.isOnBoard(x, y)){
          continue;
        }
        if (board[x][y] === next_index){
          while(true){
            x -= direction[i][0];
            y -= direction[i][1];
            if (x === x_check && y === y_check){
              break;
            }
            tiles_to_flip.push([x, y]);
          }
        }
      } 
    }
  
    if(tiles_to_flip.length > 0){
      data[0] = true;
      for(let i = 0; i < tiles_to_flip.length; i++){
        board[tiles_to_flip[i][0]][tiles_to_flip[i][1]] = next_index;
      }
      board[x_check][y_check] = next_index;
      data[1] = boardToTernary(board);
    }
    return data;
  }

  calculatePlaceable(room_id, current_index, ternary_board){
    // console.log("calculatePLaceable");
    // console.log(room_id, current_index, ternary_board);
    let next_index = (current_index + 1)%2;
    let data = [[],[0,0],[],next_index];

    for(let x = 0; x < 8; x++){
      for(let y = 0; y < 8; y++){
        let stone = this._game.get(room_id)["board"][x][y];
        if(stone === 0)data[1][0]++;
        if(stone === 1)data[1][1]++;
      }
    }
    
    for(let x = 0; x < 8; x++){
      for(let y = 0; y < 8; y++){
        let valid_data = this.isValidPlace(room_id,next_index,current_index, x, y);
        if(valid_data[0]){
          data[0].push([x,y]);
          data[2].push(valid_data[1]);
        }
      }
    }

    if(!(data[0].length > 0)){
      data[3] = current_index;
      for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
          let valid_data = this.isValidPlace(room_id,current_index,next_index, x, y);
          if(valid_data[0]){
            data[0].push([x,y]);
            // console.log(valid_data[1]);
            data[2].push(valid_data[1]);
          }
        }
      }
    }

    if(!(data[0].length > 0)){
      data[3] = -1;
    }

    updateGameCase(ternary_board, data);
    return;

  }

  nextTurn(room_id, next_data) {
    // console.log(this._game.get(room_id)["placeable"]);
    if(!(gameCase.hasOwnProperty(String(next_data)))){
      this.calculatePlaceable(room_id, this._game.get(room_id)["placeable"][3],next_data);
    }

    this._game.get(room_id)["placeable"] = gameCase[String(next_data)];
    this._game.get(room_id)["turn"] = this._game.get(room_id)["player"][this._game.get(room_id)["placeable"][3]];


    if(gameCase[String(next_data)][0].length === 0){
      log.info(
        `Game[${room_id}] Done Score[${gameCase[String(next_data)][1][0]},${gameCase[String(next_data)][1][1]}]`
      );
      return -1
    };
    // this._game.get(room_id)["turn"] =
    //   this._game.get(room_id)["player"][
    //     (this._game
    //       .get(room_id)
    //       ["player"].indexOf(this._game.get(room_id)["turn"]) +
    //       1) %
    //       2
    //   ];

    // console.log(this._game.get(room_id)["board"]);
    return this._game.get(room_id)["turn"];
  }
}

export default new GameController();
