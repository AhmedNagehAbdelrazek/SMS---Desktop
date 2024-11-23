const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');  // Import the Sequelize instance

class Lecture extends Model { }

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
    lecture_number: {
      type: DataTypes.INTEGER,
    },
    group_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'groups',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  },
  {
    sequelize,
    modelName: "Lecture",
    tableName: "lectures",
  }
);

module.exports = Lecture;