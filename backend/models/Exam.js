const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');  // Import the Sequelize instance

class Exam extends Model {}

Exam.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    month_exam_id:{
      type: DataTypes.INTEGER,
      references: {
      model: 'month_exams',
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
    grade:{
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    exam_full_mark:{
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    isDeleted: {
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
  },
  {
    sequelize,
    modelName: "Exam",
    tableName: "exams",
  }
);

module.exports = Exam;