const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model { }

User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    backupPath: DataTypes.STRING,  // Field for the backup path
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
},
    {
        sequelize,
        timestamps: false,
        modelName: "User",
        tableName: "users",
    });

module.exports = User;
