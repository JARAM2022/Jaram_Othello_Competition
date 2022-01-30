const User = (sequelize, DataTypes) =>
  sequelize.define(
    "User",
    {
      // Model attributes are defined here
      nickName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      // Other model options
    }
  );

export default User;
