const { exec } = require('child_process');
const path = require('path');
const User = require('../models/User');
const expressAsyncHandler = require('express-async-handler');
const { loadDatabaseFromBackup } = require('../utils/Backup');
const sqlite3 = require('sqlite3').verbose();

// exports.createBackup = expressAsyncHandler(async (req, res) => {
//     try {
//         const user = await User.findOne({where:{username:"admin"}}, { attributes: ['backupPath'] });
//         const backupPath = path.join(user.backupPath, `backup_${Date.now()}.sqlite`);
//         const dbPath = path.join(process.cwd(), "database.sqlite");
//         const quotedBackupPath = `"${backupPath}"`;
//         const quotedDatabasePath = `"${dbPath}"`;
//         exec(`sqlite3 ${quotedDatabasePath} .backup ${quotedBackupPath}`, (error) => {
//             if (error) {
//                 return res.status(500).json({ error: 'Backup failed' , message:error});
//             }
//             res.status(200).json({ message: 'Backup created', path: backupPath });
//         });
//     } catch (error) {
//         res.status(500).json({ error: 'Error creating backup' });
//     }
// });

exports.restoreBackup = expressAsyncHandler(async (req, res) => {
    const path = req.body.backupPath;
    loadDatabaseFromBackup(path, res);
})

exports.createBackup = expressAsyncHandler(async (req, res) => {
    try {
        const dbPath = path.join(process.cwd(), "database.sqlite");
        const quotedDatabasePath = `"${dbPath}"`;
        
        // Get the backup path from the database
        const user = await User.findOne({ where: { username: "admin" } }, { attributes: ['backupPath'] });

        if (!user || !user.backupPath) {
            return res.status(400).json({ error: 'Backup path not found for the user' });
        }

        const backupFilePath = path.join(user.backupPath, `backup_${Date.now()}.sqlite`);

        // Open the main database connection (writeable)
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                return res.status(500).json({ error: 'Failed to open the main database', message: err.message });
            }
            console.log('Main database connected successfully!');
        });

        // Open a backup database connection (create a new file if not exists)
        // const backupDb = new sqlite3.Database(backupFilePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        //     if (err) {
        //         console.error('Error opening backup database:', err.message);
        //         return res.status(500).json({ error: 'Failed to open the backup database', message: err.message });
        //     }
        //     console.log('Backup database connected successfully!');
        // });

        // Perform the backup process
        db.serialize(() => {
            console.log('Backup started');
            // db.backup(backupDb, (err) => {
            //     if (err) {
            //         console.error('Backup failed:', err.message);
            //         return res.status(500).json({ error: 'Backup failed', message: err.message });
            //     }

            //     console.log('Backup created successfully');
            //     res.status(200).json({ message: 'Backup created successfully', path: backupFilePath });

            //     // Close both databases after backup is complete
            //     db.close((closeErr) => {
            //         if (closeErr) console.error('Error closing main database:', closeErr.message);
            //         else console.log('Main database closed successfully');
            //     });

            //     backupDb.close((closeErr) => {
            //         if (closeErr) console.error('Error closing backup database:', closeErr.message);
            //         else console.log('Backup database closed successfully');
            //     });
            // });
        });
        const backup = db.backup(backupFilePath)
            .then(() => {
                console.log('backup complete!');
            })
            .catch((err) => {
                console.log('backup failed:', err);
            });
        res.status(200).json({ message: 'Backup created successfully', path: backupFilePath });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ error: 'Error creating backup', message: error.message });
    }
});
