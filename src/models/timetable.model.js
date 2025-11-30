const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Timetable",
    {
      timetableID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      season: {
        type: DataTypes.STRING(50),
        allowNull: true, // 예: '2025 Spring'
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: true, // UI에서 이름줄 수 있음
      },
    },
    {
      tableName: "TIMETABLE",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: false,
    }
  );
};
