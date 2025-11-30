const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Schedule",
    {
      calendarID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userID: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      startDate: { type: DataTypes.DATE, allowNull: true },
      endDate: { type: DataTypes.DATE, allowNull: true },
      isAllDay: { type: DataTypes.BOOLEAN, defaultValue: false },
      type: { type: DataTypes.STRING(50), allowNull: true },
      repeatRule: { type: DataTypes.STRING(255), allowNull: true },
      color: { type: DataTypes.STRING(20), allowNull: true },
    },
    {
      tableName: "SCHEDULE",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: false,
    }
  );
};
