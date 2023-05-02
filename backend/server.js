const express = require('express');
const app = express();
const connectDatabase = require('./config/database');
const errorMiddleware = require("./middlewares/error");
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

const admin = require("./routes/adminRoute");
app.use("/api/v1", admin);

app.use(errorMiddleware);

// config for dotenv
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'config/config.env') })

//For Server Running
app.listen(process.env.PORT, () => {
    console.log(`server is working on http://localhost:${process.env.PORT}`)
})

// For Database Connection
connectDatabase();


// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to Uncaught Exception`);

    process.exit(1);
});


// Unhandeled Promise Rejection
process.on("unhandledRejection", err => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
});

// git test