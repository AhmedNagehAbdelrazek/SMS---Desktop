const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database"); // Import the Sequelize instance

class Student extends Model {}

Student.init(
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
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_phone_1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parent_phone_2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parent_phone_3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    group_id:{
        type: DataTypes.INTEGER,
        references: {
        model: 'groups',
        key: 'id',
        },
        onDelete: 'SET NULL',
        allowNull: true,
    }
  },
  {
    sequelize,
    modelName: "Student",
    tableName: "students",
  }
);

module.exports = Student;
