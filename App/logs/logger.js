const winston = require('winston');
const { createLogger, format, transports ,addColors} = require('winston');
const { combine, timestamp, label, colorize, printf } = format;
const myFormat = printf(info => {
  return `${info.timestamp}:${info.label}:${info.level}:${info.message}`;
});
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize(addColors({
      info: 'bold blue', // fontStyle color
  warn: 'italic yellow',
  error: 'bold red',
  debug: 'green',
    })),
    label({ label: '[app-server]' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: './logs/combined.log',
    }),
    new winston.transports.File({
      filename: './logs/app-error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: './logs/app-info.log',
      level: 'info',
    }),
    new winston.transports.File({
      filename: './logs/app-warn.log',
      level: 'warn',
     
    }),
  ],
});

module.exports = logger;