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
    month_exam_id:{
      type: DataTypes.INTEGER,
      references: {
      model: 'month_exams',
      key: 'id',
      },
      onDelete: 'CASCADE',
    },
    grade:{
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  },
  {
    sequelize,
    modelName: "Lecture_Exam",
    tableName: "lecture_exams",
  }
);

module.exports = Lecture_Exam;