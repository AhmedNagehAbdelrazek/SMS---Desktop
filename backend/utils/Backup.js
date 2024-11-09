const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'database.sqlite'); // Path to the active database

/**
 * Load a backup database file and replace the current database, with validation.
 * @param {string} backupFileName - Name of the backup file to load.
 */
exports.loadDatabaseFromBackup = (backupFileName,res) => {
    const backupFilePath = path.join("/", backupFileName);

    // Check if the file has a .sqlite or .db extension
    if (!backupFilePath.endsWith('.sqlite') && !backupFilePath.endsWith('.db')) {
        console.error('Invalid file type. Only .sqlite or .db files are accepted.');
        return;
    }

    // Check if the file exists
    if (!fs.existsSync(backupFilePath)) {
        console.error(`Backup file not found: ${backupFilePath}`);
        return;
    }

    // Validate that it's a proper SQLite database
    const isValidDatabase = validateDatabaseFile(backupFilePath);
    if (!isValidDatabase) {
        console.error('Invalid database file. The selected file is not a valid SQLite database.');
        return;
    }

    // Copy the backup file to replace the current database
    fs.copyFileSync(backupFilePath, dbPath);
    console.log(`Database restored from backup: ${backupFilePath}`);

    res.status(200).json({ message: `Database restored from backup: ${backupFilePath}` });
}

/**
 * Validates if a given file is a valid SQLite database.
 * @param {string} filePath - Path to the file to check.
 * @returns {boolean} - Returns true if valid, false otherwise.
 */
function validateDatabaseFile(filePath) {
    try {
        const tempDb = new sqlite3.Database(filePath, (err) => {
            if (err) throw err;
        });
        
        // Attempt to run a simple query to confirm it's a valid SQLite file
        tempDb.all('SELECT name FROM sqlite_master WHERE type="table"', [], (err, rows) => {
            if (err) throw err; // If query fails, it's likely not a valid SQLite file
        });

        tempDb.close();
        return true;
    } catch (error) {
        return false; // Return false if any error occurs
    }
}

