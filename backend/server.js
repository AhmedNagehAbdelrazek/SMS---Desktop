const express = require('express');
const cors = require('cors');
const mainRoutes = require('./Routes/index');
const morgan = require('morgan');
const globalErrorHandler = require('./middleware/globalErrorHandler');
const dotenv = require('dotenv');

const app = express();
dotenv.config({path:".env"});

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({methods:"GET,HEAD,PUT,PATCH,POST,DELETE", origin:"*"}));

app.use("/api", mainRoutes);
app.use(globalErrorHandler);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

