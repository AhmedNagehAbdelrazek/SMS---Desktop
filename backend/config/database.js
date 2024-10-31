const { Sequelize } = require('sequelize');
const path = require('path');
const os = require('os');
const sqlite = require('sqlite3');



// Define the path for your SQLite database file
const dbPath = path.join(os.tmpdir(), 'database.sqlite');

const db = new sqlite.Database(dbPath);
db.on('error',(e)=>{
    console.log(e);
});

// Initialize Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,  // Specify the path to the SQLite file
    logging: false,   // Disable logging; optional
});

// Test the connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the SQLite database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

module.exports = sequelize;
