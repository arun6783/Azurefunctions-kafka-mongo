const winston = require("winston");

const level = process.env.LOG_LEVEL || 'debug';

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: level,
            format: winston.format.simple(),
            debugStdout: true,
        })
    ]
});

module.exports = logger