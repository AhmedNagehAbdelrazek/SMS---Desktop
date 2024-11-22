const express = require('express');
const cors = require('cors');
const mainRoutes = require('./Routes/index');
const morgan = require('morgan');
const globalErrorHandler = require('./middleware/globalErrorHandler');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./config/logger');

const app = express();
dotenv.config({path:".env"});

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({methods:"GET,HEAD,PUT,PATCH,POST,DELETE", origin:"*"}));

app.use((req, res, next) => {
  logger.info({date:new Date().toISOString(),message:`[Request] ${req.method} ${req.url}`,body:req.body});
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({date:new Date().toISOString(),message:`[Response] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`});
  });
  res.on('error', () => {
    logger.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
  });
  next();
});

app.use("/api", mainRoutes);

app.use((err, req, res, next) => {
  logger.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
  next();
});

app.use(globalErrorHandler);


app.listen(65000, () => {
  console.log('Server is running on port 65000');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Decide whether to exit the process or recover based on the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Log the error and handle it gracefully
});
