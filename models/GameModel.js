const Game = (sequelize, DataTypes) =>
  sequelize.define(
    "Game",
    {
      roomNum: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      roomState: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 0, // 0 = ready, 1 = playing, 2 = end
      },
      player: {
        //player[0], player[1]
        type: DataTypes.TEXT,
        allowNull: false,
      },
      checkerboard: {
        //omok_pan[19][19]
        type: DataTypes.TEXT,
        allowNull: true,
      },
      turn: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 0, // 0 = player[0], 1 = player[1]
      },
    },
    {
      // Other model options
    }
  );

export default Game;
