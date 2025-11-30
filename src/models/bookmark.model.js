const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Bookmark",
    {
      markID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: true },
      contents: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "BOOKMARK",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: false,
    }
  );
};
