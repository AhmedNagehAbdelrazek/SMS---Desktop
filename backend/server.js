const express = require('express');
const cors = require('cors');
const mainRoutes = require('./Routes/index');
const morgan = require('morgan');
const globalErrorHandler = require('./middleware/globalErrorHandler');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./config/logger');
const multer = require('multer');

global.PORT = 65000;

const port = global.PORT;

const app = express();
dotenv.config({path:".env"});

app.use(morgan("dev"));
app.use(cors({methods:"GET,HEAD,PUT,PATCH,POST,DELETE", origin:"*"}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to handle multipart/form-data and free memory
app.use((req, res, next) => {
      // Extract data and log
      const logData = {
          _type: '[Request]',
          date: new Date().toISOString(),
          message: `${req.method} ${req.url}`,
          body: req.body || {}, // Form fields
          files: (req.files || []).map(file => ({
              fieldname: file.fieldname,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,

          })),
      };

      logger.info(logData);
      console.log(logData);

      next();
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({_type:"[Response]",date:new Date().toISOString(),message:`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`});
  });
  res.on('error', () => {
    logger.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
  });
  next();
});

app.use("/api", mainRoutes);

app.use((err, req, res, next) => {
  logger.error({_type:"[Error]",message:`${req.method} ${req.url}}`,error:err});
  globalErrorHandler(err, req, res, next);
});

app.use(globalErrorHandler);


app.listen(port || 3000, () => {
  console.log(`Server is running on port localhost:${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  logger.error({_type:"[Error-uncaughtException]",error:JSON.stringify(err)});
  // Decide whether to exit the process or recover based on the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  logger.error({_type:"[Error-unhandledRejection]",message:reason});
  // Log the error and handle it gracefully
});
