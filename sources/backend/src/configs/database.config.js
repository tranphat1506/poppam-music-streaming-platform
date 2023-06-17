
// Mongoose
const DB = require('mongoose');
const DB_CONNECT_STRING = process.env.DB_CONNECT_STRING;
const DB_NAME = process.env.DB_NAME;
const connectDB = ()=>{
    DB.set('strictQuery',true);
    return DB.connect(DB_CONNECT_STRING,{ 
        dbName : DB_NAME,
        useNewUrlParser: true, 
        useUnifiedTopology: true
    })
}
module.exports = connectDB();
