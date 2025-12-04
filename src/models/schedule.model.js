const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Schedule",
    {
      itemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      calendarID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "상위 캘린더 ID",
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
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
      isAllDay: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "exam, class, personal 등 타입",
      },
      location: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
    },
    {
      tableName: "SCHEDULE",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: false,
    }
  );
};
