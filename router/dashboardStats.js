const express = require('express');
const router = express.Router();

const User = require("../models/UserModel");
//const Client = require("../models/UserModel");
const SlackMessage =require("../models/slackModel");
const Blogs = require("../models/BlogModel");
const Timesheet = require("../models/TimeSheetModel");
const Message = require('../models/ContactMessage');



router.get("/counts", async(req, res)=>{
try {
    const [
        userCount,
        clientCount,
         liveChatCount,
         blogsCount,
        timesheetCount,
        messageCount
       
    ] = await Promise.all([
        User.countDocuments({role: "staff"}),
        User.countDocuments({role: "client"}),
         SlackMessage.countDocuments({isActive: true}),
          Blogs.countDocuments(),
        Timesheet.countDocuments({status: "Approved"}),
        Message.countDocuments(),
       
    ]);

    res.status(200).json({
       users: userCount,
       client: clientCount,
       slackMessage: liveChatCount,
       blogs: blogsCount,
       timesheet: timesheetCount,
       message: messageCount,
      
    });

} catch (error) {
    res.status(500).json({ message: "Dashboard stats failed" });
}
});
module.exports = router;