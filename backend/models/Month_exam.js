const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');  // Import the Sequelize instance

class Month_Exam extends Model { }

Month_Exam.init(
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
    full_mark:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    questions_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    month_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'groups',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    fullmark:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue:100
    },
    date: {
      type: DataTypes.DATE,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  },
  {
    sequelize,
    modelName: "Month_Exam",
    tableName: "month_exams",
  }
);

module.exports = Month_Exam;