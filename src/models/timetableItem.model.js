const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "TimetableItem",
    {
      itemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      timetableID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      courseName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      dayOfWeek: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
    },
    {
      tableName: "TIMETABLE_ITEM",
      timestamps: false,
    }
  );
};
