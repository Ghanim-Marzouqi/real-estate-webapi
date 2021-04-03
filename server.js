// import needed modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./db");
const userRouter = require("./routes/user-router");
const propertyRouter = require("./routes/property-router");

// create app and set app port
const server = express();
const port = process.env.PORT;

// configure middlewares
server.use(cors());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// catch any database errors
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// redirect to default endpoint
server.get("/", (req, res) => {
    res.send("<h2>Hello from Tamleek Web API</h2>");
});

// default endpoint
server.get("/api", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Hello From Tamleek Home Web API",
        data: {}
    });
});

// routers
server.use("/api/u", userRouter);
server.use("/api/p", propertyRouter);

// run server
server.listen(port, () => console.log(`Server is running on port ${port}`));