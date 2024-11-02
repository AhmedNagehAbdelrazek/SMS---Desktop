const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');  // Import the Sequelize instance

class Attendance extends Model {}

Attendance.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    lecture_id:{
      type: DataTypes.INTEGER,
      references: {
      model: 'lectures',
      key: 'id',
      },
      onDelete: 'CASCADE',
    },
    student_id:{
      type: DataTypes.INTEGER,
      references: {
      model: 'students',
      key: 'id',
      },
      onDelete: 'CASCADE',
    },
    attended:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  },
  {
    sequelize,
    modelName: "Attendance",
    tableName: "attendances",
  }
);

module.exports = Attendance;