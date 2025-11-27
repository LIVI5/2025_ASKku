module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define("conversations", {
    conv_id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    }
  });

  return Conversation;
};
