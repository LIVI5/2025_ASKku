const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      userID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING(254), unique: true, allowNull: false },
      name: { type: DataTypes.STRING(50), allowNull: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      department: { type: DataTypes.STRING(80), allowNull: true },
      grade: { type: DataTypes.INTEGER, allowNull: true },
      additional_info: { type: DataTypes.TEXT, allowNull: true },  
    },
    {
      tableName: "USER",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: false,
    }
  );

  // Hook: User 생성 시 기본 시간표 및 캘린더 생성
  User.afterCreate(async (user, options) => {
    const { Timetable, Schedule } = sequelize.models;

    console.log(`Creating default calendar & timetable for user: ${user.userID}`);

    // 🔹 기본 timetable 생성
    await Timetable.create({
      userID: user.userID,
      season: null,
      courseName: null,
      dayOfWeek: null,
      startTime: null,
      endTime: null,
      location: null,
    });

    // 🔹 기본 캘린더 생성
    await Schedule.create({
      userID: user.userID,
      title: "기본 캘린더",
      description: "자동 생성된 캘린더입니다.",
      startDate: null,
      endDate: null,
      isAllDay: false,
      type: "default",
      repeatRule: null,
      color: "#3B82F6",
    });

    console.log(`Default calendar & timetable created for user: ${user.userID}`);
  });

  return User;
};
