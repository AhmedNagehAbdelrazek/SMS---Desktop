const winston = require('winston');
const fs = require('fs');

const logFilePath = 'logs';

class FileArrayTransport extends winston.transports.File {
    constructor(opts) {
        super(opts); // Call the parent class constructor
    }
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        
        const fileData = fs.readFileSync(logFilePath, 'utf-8');
        
        if(!fileData || fileData == ""){
            fileData = [];
        }
        let logArray = JSON.parse(fileData) || [];
        console.log(logArray);
        
        // Push log to the array
        logArray.push({
            ...info,
            body: info.body,
            date: info.timestamp || new Date().toISOString(),
            level: info.level,
            message: info.message,
        });

        // Write the updated array to the file
        fs.writeFile(logFilePath, JSON.stringify(logArray, null, 2), (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });

        callback();
    }
}

const logger = winston.createLogger({
    
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // new FileArrayTransport({ filename: logFilePath }),
        // new winston.transports.Console(),
        new winston.transports.File({ filename: logFilePath })
    ],
});

module.exports = logger;