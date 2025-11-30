const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Message",
    {
      messageID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      convID: { type: DataTypes.INTEGER, allowNull: false },
      userID: { type: DataTypes.INTEGER, allowNull: true }, // assistant messages = null
      role: { type: DataTypes.ENUM("user", "assistant"), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      tableName: "MESSAGE",
      timestamps: true,
      createdAt: "timestamp",
      updatedAt: false,
    }
  );
};
