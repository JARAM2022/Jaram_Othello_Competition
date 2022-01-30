"use strict";
import Sequelize from 'sequelize';
import DBCONFIG from '../configs/DatabaseConfig.js';

import GameModel from './GameModel.js';
import UserModel from './UserModel.js';

/* Database Connetion */
const Connection = new Sequelize(
  DBCONFIG.DATABASE,
  DBCONFIG.USERNAME,
  DBCONFIG.PASSWORD,
  {
    host: DBCONFIG.HOST,
    dialect: DBCONFIG.DIALECT,
    timezone: DBCONFIG.TIMEZONE,
  }
);

/* Model Connection */
const Game = GameModel(Connection, Sequelize.DataTypes);
const User = UserModel(Connection, Sequelize.DataTypes);

export default { Connection, Game, User };