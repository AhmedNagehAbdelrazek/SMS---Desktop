const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');  // Import the Sequelize instance

class Lecture_Exam extends Model {}

Lecture_Exam.init(
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
    grade:{
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isDeleted: {
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
  },
  {
    sequelize,
    modelName: "Lecture_Exam",
    tableName: "lecture_exams",
  }
);

module.exports = Lecture_Exam;