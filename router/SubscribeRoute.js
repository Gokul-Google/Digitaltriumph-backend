const express = require("express");
const router = express.Router();
const Subscriber = require('../models/SubscribeModel');

router.post("/", async(req, res)=>{
try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    await Subscriber.create({ email });
res.status(201).json({message: "subscribed"});

} catch (err) {
if(err.code === 11000){
    return res.status(409).json({ message: "Already subscribed" });
}    
res.status(500).json({ message: "Server error" });
}
});

router.get('/', async(req, res) =>
    {
try {

const {filter} = req.query;
 let startDate = new Date();
 if(filter === "weekly"){
    startDate.setDate(startDate.getDate()-7);
 }else if (filter === "monthly")
 {
    startDate.setMonth(startDate.getMonth() - 1);
 }else if(filter === "yearly"){
    startDate.setFullYear(startDate.getFullYear()-1);
 }else{
    startDate = null;
 }

 const query = startDate? {ceratedAt: {$gte: startDate}} :{};
 
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;