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
      get(){
        const id = this.getDataValue ? this.getDataValue('id') : this.id;
        return id ? id.toString().padStart(8, '0') : null;
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.NUMBER,
      allowNull: false,
      unique:true,
      validate:{
        validatePhoneNumber(value){
          if(!value.startsWith("01")){
            throw new Error("phone number has to start with 01");
          }
          if(value.length != 11){
            throw new Error("phone number has to be 11 number");
          }
        },

      }
    },
    parent_phone_1: {
      type: DataTypes.NUMBER,
      allowNull: true,
      validate:{
        validatePhoneNumber(value){
          if(!value){
            return true;
          }
          if(!value.startsWith("01")){
            throw new Error("phone number has to start with 01");
          }
          if(value.length != 11){
            throw new Error("phone number has to be 11 number");
          }
        },

      }
    },
    parent_phone_2: {
      type: DataTypes.NUMBER,
      allowNull: true,
      validate:{
        validatePhoneNumber(value){
          if(!value){
            return true;
          }
          if(!value.startsWith("01")){
            throw new Error("phone number has to start with 01");
          }
          if(value.length != 11){
            throw new Error("phone number has to be 11 number");
          }
        },

      }
    },
    parent_phone_3: {
      type: DataTypes.NUMBER,
      allowNull: true,
      validate:{
        validatePhoneNumber(value){
          if(!value){
            return true;
          }
          if(!value.startsWith("01")){
            throw new Error("phone number has to start with 01");
          }
          if(value.length != 11){
            throw new Error("phone number has to be 11 number");
          }
        },

      }
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

Student.beforeCreate(async (student, options) => {
  try {
    await student.validate(); // Trigger validation before creation
  } catch (error) {
    throw error; // Throw custom validation errors
  }
});


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
