const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'error.log' }),
        new winston.transports.Console(),
    ],
});

module.exports = logger;