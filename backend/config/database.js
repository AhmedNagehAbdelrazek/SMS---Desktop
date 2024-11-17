const { Sequelize } = require("sequelize");
const path = require("path");
const os = require("os");
const sqlite = require("sqlite3");
const fs = require("fs");

// Define the path for your SQLite database file
// const dbPath = path.join(os.tmpdir(), "database.sqlite");
const dbPath = path.join(process.cwd(), "database.sqlite");

// Initialize Sequelize
let sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath, // Specify the path to the SQLite file
  logging: false, // Disable logging; optional
});

function connectDb (){
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath, // Specify the path to the SQLite file
    logging: false, // Disable logging; optional
  });
}

// Test the connection
async function initDBConnection () {
  try {
    if(!sequelize)
      connectDb();

    await sequelize.authenticate();
    
    // await sequelize.queryInterface.addConstraint('students', {
      //   fields: ['id'],
      //   type: 'unique',
      //   name: 'unique_student_id_constraint'
      // });
      await sequelize.sync({ 
        alter: true,
        force:false
      });
      const User = require("../models/User");
      const users =  await User.findAll();

      if(users.length === 0){
        const documentsPath = path.join(os.homedir(), 'Documents');
        const backupFolderPath = path.join(documentsPath, 'SMS-Backup');

        // Create the "SMS-Backup" folder if it doesn't exist
        if (!fs.existsSync(backupFolderPath)) {
          fs.mkdirSync(backupFolderPath, { recursive: true });
          console.log(`Backup folder created at: ${backupFolderPath}`);
        } else {
          console.log(`Backup folder already exists at: ${backupFolderPath}`);
        }
        await User.create({ username: "admin", password: "admin", backupPath: backupFolderPath, isDeleted: false });
      }
    console.log(
      "Connection to the SQLite database has been established successfully."
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

(async()=>{
  await initDBConnection();
})();



module.exports = sequelize;

module.exports.initDBConnection = initDBConnection;
module.exports.connectDb = connectDb;