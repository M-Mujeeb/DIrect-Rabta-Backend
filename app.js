"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/dbConfig"); 
const Router = require("./routes/index");
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use("/api", Router);
var port = process.env.PORT || 4001;
var env = process.env.NODE_ENV;
const startServer = async () => {
  try {
     await connectDB();
    if (env === "development") {
      console.log("Running in Development");
      app.listen(port, (err) => {
        if (err) console.log("Error starting server:", err);
        console.log(`Server is running on port ${port}`);
      });
    } else {
      console.log("Running in production mode");
      app.listen(port, (err) => {
        if (err) console.log("Error starting server:", err);
        console.log(`Server is running on port ${port}`);
      });
    }
  } catch (err) {
    console.error("Failed to start server", err);
  }
};
startServer();