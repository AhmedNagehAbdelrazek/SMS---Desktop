const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database"); // Import the Sequelize instance
const { Op } = require("sequelize");

class Group extends Model {
  getTime() {
    const convertTo24Hour = (time) => {
      const [hours, minutes] = time.split(":");
      return parseInt(hours, 10);
    };
    return convertTo24Hour(group.time_of_day);
  }
}

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
      unique: true,
    },
    last_lecture_number: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
    center:{
      type: DataTypes.STRING,
      allowNull: true
    },
    level:{
      type: DataTypes.NUMBER,
      allowNull: true,
      min:1,
      max:6
    },
    day_of_week: {
      type: DataTypes.NUMBER,
      allowNull: false,
      validate: {
        min: 1,
        max: 7,
      },
    },
    time_of_day: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      validate: {
        min: 1,
        max: 6,
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Group",
    tableName: "groups",
  }
);

Group.beforeCreate(async (newGroup, options) => {
  const groupsOnSameDay = await Group.findAll({
    where: {
      day_of_week: newGroup.day_of_week,
      isDeleted: false,
    },
  });

  // Helper function to parse and calculate times
  const parseTime = (timeString) => new Date(`1970-01-01T${timeString}`);
  const formatTime = (date) => date.toISOString().slice(11, 19);

  // Calculate the new group's time range
  const newStartTime = parseTime(newGroup.time_of_day);
  const newEndTime = new Date(
    newStartTime.getTime() + newGroup.period * 60 * 60 * 1000
  );

  // Check for conflicts
  for (const group of groupsOnSameDay) {
    const groupStartTime = parseTime(group.time_of_day);
    const groupEndTime = new Date(
      groupStartTime.getTime() + group.period * 60 * 60 * 1000
    );

    const isOverlapping =
      (newStartTime >= groupStartTime && newStartTime < groupEndTime) || // New group starts within an existing group
      (newEndTime > groupStartTime && newEndTime <= groupEndTime) || // New group ends within an existing group
      (newStartTime <= groupStartTime && newEndTime >= groupEndTime); // New group completely overlaps an existing group

    if (isOverlapping) {
      throw new Error(
        `Conflict detected with group "${
          group.name
        }" scheduled from ${formatTime(groupStartTime)} to ${formatTime(
          groupEndTime
        )}.`
      );
    }
  }
});

module.exports = Group;
