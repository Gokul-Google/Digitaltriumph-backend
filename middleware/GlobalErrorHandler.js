const config = require('dotenv');

const globalErrorHandler = (err, req, res, next)=>{
    return res.status(err.statusCode || 500).json({
        status: err.statusCode || 500,
        message:err.message || "Internal server error",
        errorStack: process.env.NODE_ENV === "development" ? err.stack : "" 
})
}

module.exports =globalErrorHandler;