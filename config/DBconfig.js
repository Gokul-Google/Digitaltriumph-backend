const mongoose = require('mongoose');
const config = require('./config.js');

const connectDB = async ()=>{
    const conn =mongoose.connect(config.databaseURL)
    .then(()=>console.log("connected to mongodb"))
    .catch((err)=>console.error("MongoDB connection error",err));
}
module.exports = connectDB;