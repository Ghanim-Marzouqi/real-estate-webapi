// load needed modules
const mongoose = require("mongoose");
// require('dotenv').config();

// database credentials
const db_username = process.env.MONGODB_USERNAME;
const db_password = process.env.MONGODB_PASSWORD;
const db_database = process.env.MONGODB_DATABASE;

// connection string
const connectionString = `mongodb+srv://${db_username}:${db_password}@cluster0.beihp.mongodb.net/${db_database}?retryWrites=true&w=majority`;

// connect to mongodb
mongoose
    .connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .catch(error => console.log("ERROR", error.message));

// create db connection
const db = mongoose.connection;

// export db connection
module.exports = db;