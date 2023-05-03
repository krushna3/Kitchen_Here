const express = require('express');
const app = express();
const connectDatabase = require('./config/database');
const errorMiddleware = require("./middlewares/error");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const admin = require("./routes/adminRoute");
app.use("/api/v1", admin);

const dishes = require("./routes/dishesRoute");
app.use("/api/v1", dishes);


app.use(errorMiddleware);
app.use('/uploads', express.static('uploads'));

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