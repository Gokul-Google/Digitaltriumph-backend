const dotenv =require('dotenv');
require('dotenv').config();

const config = Object.freeze({
    PORT:process.env.PORT || 4040,
    databaseURL: process.env.MONGODB_URL || 'mongodb://localhost:27017/digitaltriumph',
    nodeENV:process.env.NODE_ENV || 'development',
    accessTokenSecret:process.env.JWT_SECRET,
    
});
//console.log("JWT_SECRET",process.env.JWT_SECRET);
module.exports = config;
