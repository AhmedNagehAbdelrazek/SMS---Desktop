const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');  // Import the Sequelize instance

class Lecture extends Model {}

Lecture.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    group_id:{
      type: DataTypes.INTEGER,
      references: {
      model: 'groups',
      key: 'id',
      },
      onDelete: 'CASCADE',
  }
  },
  {
    sequelize,
    modelName: "Lecture",
    tableName: "lectures",
  }
);

module.exports = Lecture;