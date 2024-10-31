const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Import the Sequelize instance

// Define the Student model
const Student = sequelize.define('Student', {
    id:{
        type: DataTypes.BIGINT,
        primaryKey:true,
        autoIncrement:true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
},{
    initialAutoIncrement:1000,
    tableName: 'Students'
});

Student.beforeCreate(async (student, options) => {
    const [results, metadata] = await sequelize.query(
        "SELECT seq FROM sqlite_sequence WHERE name = 'Students'"
    );

    if (!results.length || results[0].seq < 1000) {
        await sequelize.query("UPDATE sqlite_sequence SET seq = 1000 WHERE name = 'Students'");
    }
});

module.exports = Student;
