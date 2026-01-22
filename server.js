const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const http = require("http");
//const { Server } = require("socket.io");


const ChatRoute = require("./router/ChatRoute");
const config = require("./config/config");
const ConnectDB = require("./config/DBconfig");
const crypto = require("crypto");

const UserRoute = require("./router/UserRoute");
const BlogRoute = require("./router/BlogsRoute");
const contactMessageRoute = require("./router/ContactMessageRoute");
const TimesheetRoute = require("./router/TimeSheetRoute");
const ProjectGroup = require("./router/ProjectGroupRoute");
const gaRoute = require("./router/GoogleAnalytics");
const globalErrorHandler = require("./middleware/GlobalErrorHandler");

const cookieParser = require("cookie-parser");
const path = require("path");


// const systemRoutes = require("./router/systemRoutes");
// const Message = require("./models/ChatModel");


const app = express();
ConnectDB();

/* ---------- Middleware ---------- */
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ✅ Serve ALL uploads (profile + blog) */
//app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
//app.use("/uploads", express.static("uploads"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/* ---------- Routes ---------- */
app.use("/api/user", UserRoute);
app.use("/api/blog", BlogRoute);
app.use("/api/chat", ChatRoute);
app.use("/api/contact-messages", contactMessageRoute);
app.use("/api/timesheet", TimesheetRoute);
app.use("/api/projects", ProjectGroup);
app.use("/api", gaRoute);


/* ---------- Global Error ---------- */
app.use(globalErrorHandler);

app.listen(config.PORT || 4040, () => {
  console.log("🚀 Server running on http://localhost:4040");
});



// app.listen(config.PORT || 4040, () => {
//   console.log(`Server running on port ${config.PORT || 4040}`);
// });
