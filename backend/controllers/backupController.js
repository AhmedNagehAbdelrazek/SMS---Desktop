const { exec } = require('child_process');
const path = require('path');
const User = require('../models/User');
const expressAsyncHandler = require('express-async-handler');
const { loadDatabaseFromBackup } = require('../utils/Backup');
const { sequelize } = require('../models');
const sqlite3 = require('sqlite3').verbose();
const os = require('os');
const fs = require('fs');
const { initDBConnection, connectDb } = require('../config/database');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.restoreBackup = expressAsyncHandler(async (req, res) => {
  // const backupPath = req.body.backupPath;
  // const dbPath = path.join(process.cwd(), "database.sqlite");
  // console.log(dbPath);

  // // Check if the backup file exists
  // if (!fs.existsSync(backupPath)) {
  //     return res.status(500).json({ error: 'Backup failed', message: "File not found" });
  // }
  // console.log("File exists");

  // // Check if the backupPath is a file
  // if (!fs.lstatSync(backupPath).isFile()) {
  //     return res.status(500).json({ error: 'Backup failed', message: "Path is not a file" });
  // }
  // console.log("File is a file");

  // // Check if the file has a .sqlite extension
  // if (!backupPath.endsWith('.sqlite')) {
  //     return res.status(500).json({ error: 'Backup failed', message: "File is not a .sqlite file" });
  // }
  // console.log("File is a .sqlite file");

  // // Verify that the backup file is a valid SQLite database
  // const db = new sqlite3.Database(backupPath);
  // db.all('SELECT name FROM sqlite_master WHERE type="table"', [], async (err, rows) => {
  //     if (err) {
  //         return res.status(500).json({ error: 'Backup failed', message: "Invalid SQLite database" });
  //     }
  //     console.log("File is a valid SQLite database");
  //     db.close();

  //     try {
  //         // Stop the current database connection
  //         if (sequelize) {
  //             await sequelize.close();
  //             console.log("Sequelize connection closed.");

  //             // Add a delay to ensure all pending Sequelize tasks are completed
  //             await delay(500);
  //         }

  //         // Copy the backed-up database to the current database path
  //         fs.copyFileSync(backupPath, dbPath);

  //         // Reinitialize the Sequelize connection
  //         await initDBConnection();

  //         return res.status(200).json({ message: 'Backup restored successfully' });
  //     } catch (error) {
  //         console.error("Error restoring the backup:", error);
  //         return res.status(500).json({ error: 'Backup restore failed', message: error.message });
  //     }
  // });
  const backupPath = req.body.backupPath;

  // Validate backupPath
  if (!backupPath || !path.isAbsolute(backupPath)) {
    return res.status(400).json({ error: 'Invalid backup path' });
  }

  // Inform master process to restore the database
  process.send({ type: 'restore-database', backupPath });

  res.status(200).json({ message: 'Restore process initiated' });
});



// exports.createBackup = expressAsyncHandler(async (req, res) => {
//   const { backup_name } = req.body;
//   try {
//     const { backupPath } = await User.findOne({ where: { username: "admin" } }, { attributes: ['backupPath'] });

//     const backupname = backup_name || `backup_${Date.now()}`;
//     const backupFilePath = path.join(process.cwd(), backupname + ".sqlite");

//     const documentsPath = path.join(os.homedir(), 'Documents');
//     const backupFolderPath = backupPath || path.join(documentsPath, 'SMS-Backup');
//     const existsedFile = path.join(backupFolderPath, backupname + ".sqlite");
//     console.log(existsedFile);
//     if (fs.existsSync(existsedFile)) {
//       return res.status(500).json({ error: 'Backup failed', message: `File already exists ${backupname}` });
//     }
//     exec(`sqlite3 database.sqlite ".backup '${backupname}.sqlite'"`, async (error) => {
//       if (error) {
//         return res.status(500).json({ error: 'Backup failed', message: error });
//       } else {
//         // now i want to take that file and move it to the backup folder
//         setTimeout(() => {
//           //check if the backup folder exists
//           if (!fs.existsSync(backupFolderPath)) {
//             fs.mkdirSync(backupFolderPath, { recursive: true });
//           }
//           //check if the file exists
//           fs.readFile(backupFilePath, (err, data) => {
//             if (!err && data) {
//               console.log('File exists');
//               fs.copyFileSync(backupFilePath, `${backupFolderPath}\\${backupname}.sqlite`);
//               fs.unlinkSync(backupFilePath);
//               return res.status(200).json({ message: 'Backup created', path: backupFilePath });
//             } else {
//               return res.status(500).json({ error: 'Backup failed', message: "File not found" });
//             }
//           })
//           // now i want to take that file and move it to the backup folder

//         }, 1000);
//       }
//     });

//   } catch (error) {
//     console.error('Error creating backup:', error);
//     res.status(500).json({ error: 'Error creating backup', message: error.message });
//   }
// });

exports.restoreDatabase = async (backupPath) => {
  const dbPath = path.join(process.cwd(), "database.sqlite");
  console.log(`Restoring from backup: ${backupPath}`);

  // Check if the backup file exists
  if (!fs.existsSync(backupPath)) {
    console.log('Backup failed: File not found');
    return { success: false, message: "File not found" };
  }
  console.log("Backup file exists");

  // Check if the backupPath is a file
  if (!fs.lstatSync(backupPath).isFile()) {
    console.log('Backup failed: Path is not a file');
    return { success: false, message: "Path is not a file" };
  }
  console.log("Backup file is valid");

  // Check if the file has a .sqlite extension
  if (!backupPath.endsWith('.sqlite')) {
    console.log('Backup failed: File is not a .sqlite file');
    return { success: false, message: "File is not a .sqlite file" };
  }
  console.log("Backup file has correct extension");

  // Verify that the backup file is a valid SQLite database
  const db = new sqlite3.Database(backupPath);
  db.all('SELECT name FROM sqlite_master WHERE type="table"', [], async (err, rows) => {
    if (err) {
      console.log('Backup failed: Invalid SQLite database');
      return { success: false, message: "Invalid SQLite database" };
    }
    console.log("Backup is a valid SQLite database");
    db.close();

    try {
      // Stop the current database connection (close Sequelize)
      if (sequelize) {
        await sequelize.close();
        console.log("Sequelize connection closed.");
      }

      // Add a delay to ensure all pending Sequelize tasks are completed
      await delay(500);
      // Copy the backed-up database to the current database path
      fs.copyFileSync(backupPath, dbPath);
      console.log('Backup file copied successfully');

      // Reinitialize the Sequelize connection
      await initDBConnection();
      console.log('Database connection reinitialized.');

      return { success: true, message: 'Backup restored successfully' };
    } catch (error) {
      console.error("Error restoring the backup:", error);
      return { success: false, message: `Backup restore failed: ${error.message}` };
    }
  });
  return { success: true, message: 'Backup restored successfully' };
}

const attemptBackup = (db, backupDb, retries = 5) => {
  return new Promise((resolve, reject) => {
      let attempts = 0;

      const backupOperation = () => {
          db.backup(backupDb, (err) => {
              if (err && attempts < retries) {
                  attempts += 1;
                  console.log(`Backup failed, retrying attempt ${attempts}...`);
                  setTimeout(backupOperation, 500);  // Retry after a delay
              } else if (err) {
                  reject(err);
              } else {
                  resolve();
              }
          });
      };

      backupOperation();  // Start the backup operation
  });
};

exports.createBackup = async (req, res) => {
  const { backup_name } = req.body;
  try {
      const { backupPath } = await User.findOne({ where: { username: "admin" } }, { attributes: ['backupPath'] });
      const backupname = backup_name || `backup_${Date.now()}`;
      const backupFilePath = path.join(process.cwd(), backupname + ".sqlite");

      const documentsPath = path.join(require('os').homedir(), 'Documents');
      const backupFolderPath = backupPath || path.join(documentsPath, 'SMS-Backup');
      const existsedFile = path.join(backupFolderPath, backupname + ".sqlite");

      if (fs.existsSync(existsedFile)) {
          return res.status(500).json({ error: 'Backup failed', message: `File already exists ${backupname}` });
      }

      // Initialize SQLite database for backup
      const db = new sqlite3.Database('database.sqlite', sqlite3.OPEN_READWRITE);
      const backupDb = new sqlite3.Database(backupFilePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

      await attemptBackup(db, backupDb);  // Use the retry logic

      // Ensure backup folder exists
      if (!fs.existsSync(backupFolderPath)) {
          fs.mkdirSync(backupFolderPath, { recursive: true });
      }

      // Move the file to the backup folder
      fs.renameSync(backupFilePath, path.join(backupFolderPath, backupname + ".sqlite"));

      return res.status(200).json({ message: 'Backup created', path: path.join(backupFolderPath, backupname + ".sqlite") });
  } catch (error) {
      console.error('Error creating backup:', error);
      return res.status(500).json({ error: 'Error creating backup', message: error.message });
  }
};