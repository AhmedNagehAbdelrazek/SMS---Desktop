const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); 

class Attendance extends Model {}

Attendance.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    lecture_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'lectures',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    student_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'students',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    attended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Attendance",
    tableName: "attendances",
  }
);

Attendance.beforeCreate(async (attendance, options) => {
  const existingRecord = await Attendance.findOne({
    where: {
      student_id: attendance.student_id,
      lecture_id: attendance.lecture_id
    }
  });

  if (existingRecord) {
    throw new Error('Attendance record for this student and lecture already exists.');
  }
});

module.exports = Attendance;
