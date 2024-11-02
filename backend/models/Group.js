const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');  // Import the Sequelize instance

class Group extends Model {}

Group.init(
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
    last_lecture_number: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
    },
    day_of_week: {
      type: DataTypes.ENUM("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"),
      allowNull: false,
    },
    time_of_day: {
      type: DataTypes.STRING, // Alternatively, use DataTypes.TIME for stricter formatting
      allowNull: false,
      validate: {
        is: /^([1-9]|1[0-2])([AP]M)$/, // Matches formats like "2PM" or "6PM"
      },
    },
  },
  {
    sequelize,
    modelName: "Group",
    tableName: "groups",
  }
);

module.exports = Group;