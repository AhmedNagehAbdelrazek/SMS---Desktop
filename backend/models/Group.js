const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');  // Import the Sequelize instance
const { Op } = require('sequelize'); 

class Group extends Model {
  getTime(){
    const convertTo24Hour = (time) => {
      const [hours, modifier] = time.match(/^(\d+)(AM|PM)$/).slice(1, 3);
      let hour = parseInt(hours, 10);
      if (modifier === "PM" && hour !== 12) hour += 12;
      if (modifier === "AM" && hour === 12) hour = 0;
      return hour;
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
    period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:2,
      validate: {
        min: 1,
        max: 6,
      },
    },
    isDeleted: {
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
  },
  {
    sequelize,
    modelName: "Group",
    tableName: "groups",
  }
);

Group.beforeCreate(async (group) => {
  // Helper function to convert 12-hour time to 24-hour as numbers
  const convertTo24Hour = (time) => {
    const [hours, modifier] = time.match(/^(\d+)(AM|PM)$/).slice(1, 3);
    let hour = parseInt(hours, 10);
    if (modifier === "PM" && hour !== 12) hour += 12;
    if (modifier === "AM" && hour === 12) hour = 0;
    return hour;
  };

  const startHour = convertTo24Hour(group.time_of_day); // Start hour of new group
  const endHour = startHour + group.period; // End hour of new group

  // Fetch all groups on the same day
  const groupsOnSameDay = await Group.findAll({
    where: {
      day_of_week: group.day_of_week,
      isDeleted: false,
    },
  });

  // Check for overlap with existing groups
  const hasConflict = groupsOnSameDay.some((existingGroup) => {
    const existingStart = convertTo24Hour(existingGroup.time_of_day);
    const existingEnd = existingStart + existingGroup.period;

    // Check for overlap
    return (
      (startHour >= existingStart && startHour < existingEnd) || // New group starts during an existing group
      (endHour > existingStart && endHour <= existingEnd) || // New group ends during an existing group
      (startHour <= existingStart && endHour >= existingEnd) // New group fully overlaps an existing group
    );
  });

  if (hasConflict) {
    throw new Error(
      `Time conflict: A group already exists on ${group.day_of_week} between the specified hours ${group.time_of_day} to ${endHour%12}${endHour>=12?"PM":"AM"}.`
    );
  }
});

module.exports = Group;