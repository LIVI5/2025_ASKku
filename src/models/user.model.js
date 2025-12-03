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
    const { Timetable, Calendar } = sequelize.models;

    console.log(`Creating default calendar & timetable for user: ${user.userID}`);

    await Timetable.create({
      userID: user.userID,
      season: null,
      title: "기본 시간표",
    });

    await Calendar.create({
      userID: user.userID,
      title: "기본 캘린더",
  });


    console.log(`Default calendar & timetable created for user: ${user.userID}`);
  });

  return User;
};
