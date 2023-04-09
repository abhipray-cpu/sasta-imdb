const winston = require('winston');
const { combine, timestamp, printf, colorize, align } = winston.format;
const errorFilter = winston.format((info, opts) => {
  return info.level === 'error' ? info : false;
});

const infoFilter = winston.format((info, opts) => {
  return info.level === 'info' ? info : false;
});

const warnFilter = winston.format((info, opts) => {
  return info.level === 'warn' ? info : false;
});
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({
      filename: './logs/combined.log',
    }),
    new winston.transports.File({
      filename: './logs/app-error.log',
      level: 'error',
      format: combine(errorFilter(), timestamp()),
    }),
    new winston.transports.File({
      filename: './logs/app-info.log',
      level: 'info',
      format: combine(infoFilter(), timestamp()),
    }),
    new winston.transports.File({
      filename: './logs/app-warn.log',
      level: 'warn',
      format: combine(warnFilter(), timestamp()),
    }),
  ],
});

module.exports = logger;