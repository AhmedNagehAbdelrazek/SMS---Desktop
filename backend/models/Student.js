const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database"); // Import the Sequelize instance
const Group = require("./Group");

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
      unique: true,
    },
    phone_number: {
      type: DataTypes.NUMBER,
      allowNull: false,
      unique: true,
    },
    parent_phone_1: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    parent_phone_2: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    parent_phone_3: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      get(){
        const avatar = this.getDataValue ? this.getDataValue('avatar') : this.avatar;
        let port = global.PORT || 3000;
        return avatar ? `http://localhost:${port}${avatar}` : null;
      }
    },
    group_id:{
        type: DataTypes.INTEGER,
        references: {
        model: 'groups',
        key: 'id',
        },
        onDelete: 'SET NULL',
        allowNull: true,
    },
    isDeleted: {
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
    blocked:{
      type:DataTypes.BOOLEAN,
      defaultValue:false,
    }
  },
  {
    sequelize,
    modelName: "Student",
    tableName: "students",
  }
);

Student.beforeBulkCreate(async (students, options) => {
  const groupIds = students
    .map(student => student.group_id)
    .filter(groupId => groupId !== null); // Get unique group IDs from input

  if (groupIds.length > 0) {
    const validGroups = await Group.findAll({
      where: {
        id: groupIds,
      },
      attributes: ['id'],
    });

    const validGroupIds = validGroups.map(group => group.id);

    // Validate each student's group_id
    for (const student of students) {
      if (student.group_id && !validGroupIds.includes(student.group_id)) {
        throw new Error(
          `Invalid group ID ${student.group_id} for student ${student.name}`
        );
      }
    }
  }
});

module.exports = Student;
