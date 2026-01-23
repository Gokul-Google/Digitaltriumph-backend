const createHttpError = require('http-errors');
const User = require('../models/UserModel');
const config = require('../config/config');
const bcrypt = require('bcryptjs');
const Jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

//Ensure file folder path

// const uploadDir = path.join(__dirname, '../uploads/profile');

// if(!fs.existsSync(uploadDir)){
//   fs.mkdirSync(uploadDir, {recursive: true});
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb)=>{
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) =>{
//     const fileName = file.originalname;
//     const filePath = path.join(uploadDir, fileName);
//     if(fs.existsSync(filePath)){
//       fs.unlinkSync(filePath);
//     }
//     cb(null, file.originalname);
//   },
// });

// const upload= multer({storage});

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // if (req.user.role !== "Admin") {
    //   return res.status(403).json({ message: "Access denied" });
    // }

    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res, next) => {
  try {
    // const userId = req.user.id; // from auth middleware

    // const user = await User.findById(userId).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

const generateClientId = async () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 26
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 01
  const prefix = `CI${year}${month}`; // CI2601

  const lastUser = await User.findOne({
    clientId: { $regex: `^${prefix}` },
  }).sort({ clientId: -1 });

  let count = 1;
  if (lastUser?.clientId) {
    const lastCount = parseInt(lastUser.clientId.slice(prefix.length), 10);
    if (!isNaN(lastCount)) count = lastCount + 1;
  }

  return `${prefix}${String(count).padStart(3, "0")}`; // CI2601001
};


const generateEmpId = async () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 26
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 01
  const prefix = `${year}${month}`; // 2601
  const lastUser = await User.findOne({
    empId: { $regex: `^${prefix}` }, // SAME year + month
  })
    .sort({ empId: -1 })
    // .select("empId");
  let count = 1;
  if (lastUser?.empId) {
    const lastCount = parseInt(lastUser.empId.slice(prefix.length), 10);
   if (!isNaN(lastCount)) count = lastCount + 1;
  }

  return `${prefix}${String(count).padStart(3, "0")}`; // 2601001
};


const addUserByAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, role, staffRole, projectName } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }
    let generatedEmpId = null;

    if (["Staff", "Manager/Hr"].includes(role)) {
  generatedEmpId = await generateEmpId();
}

let generatedClientId = null;

if (role === "Client") {
  generatedClientId = await generateClientId();
}
    if (role === "Staff" && !staffRole) {
      return res.status(400).json({ Message: "Staff role is required" })
    }
    if (role === "Client" && !projectName) {
      return res.status(400).json({ message: "Project name is required" });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

const safeStaffRole =
  role === "Staff" ? staffRole : null;

const safeProjectName =
  role === "Client" ? projectName : null;
    const hashedPassword = await bcrypt.hash(password, 10);

const userData = {
  name,
  email,
  phone,
  password: hashedPassword,
  role,
  staffRole: safeStaffRole,
  projectName: safeProjectName,
};

if (generatedEmpId) userData.empId = generatedEmpId;
if (generatedClientId) userData.clientId = generatedClientId;


    const user = await User.create(userData);
    await user.save();
  
   res.status(201).json({
      success: true,
      message: "User created by admin",
      user: {
        _id: user._id,
        empId:user.empId,
        clientId: user.clientId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        staffRole: user.staffRole,
        projectName: user.projectName,
        image: user.image || null,
      },
    });
  } catch (err) {
    console.error("Admin create error:", err);
    res.status(500).json({ message: "Admin create failed" });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields from body
    if(req.body.empId !== undefined) user.empId = req.body.empId;
    if(req.body.clientId !== undefined) user.clientId = req.body.clientId; 
  if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.role !== undefined) user.role = req.body.role;
   if (user.role === "Staff") {
  user.staffRole = req.body.staffRole || null;

  if (!user.staffRole) {
    return res.status(400).json({
      message: "Staff role is required for Staff"
    });
  }
} else {
  user.staffRole = null;
}
// PROJECT NAME
if (user.role === "Client") {
  user.projectName = req.body.projectName || null;
} else {
  user.projectName = null;
}

    // Update image if uploaded
    if (req.file) user.image = `/uploads/${req.file.filename}`;

    await user.save();

    res.status(200).json(user);

    // console.log("USER AFTER ADMIN UPDATE:", user);
    // console.log("BODY:", req.body);
    // console.log("FILE:", req.file);
  } catch (err) {
    console.error("ADMIN UPDATE ERROR:", err);
    res.status(500).json({ message: "Admin update failed" });
  }
};



const updateProfile = async (req, res) => {
  try {
    // console.log("BODY:", req.body);
    // console.log("FILE:", req.file);

    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const {clientId, empId, name, phone, password, staffRole, projectName} = req.body;
    if(clientId) user.clientId = clientId;
  if(empId) user.empId = empId;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (staffRole) user.staffRole = staffRole;
    if (projectName) user.projectName = projectName;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      user.image = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
    // console.log("FILE INFO:", req.file);
    // console.log("USER AFTER UPDATE:", user);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};



const getProfile = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    image: user.image ? `${process.env.VITE_BASE_URL}${user.image}` : null,
  });
};

const deleteProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
}



const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // 1. Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check existing user
    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Allowed roles
    const allowedRoles = ["staff", "manager/hr", "client", "admin"];

    // const safeRole = allowedRoles.includes(FormData.role)
    // ? FormData.role
    // : "Staff"

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};




const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return next(
        createHttpError(
          400,
          "Identifier (email / phone / username) and password are required"
        )
      );
    }

    // let query = {};
    // if (email) query.email = email;
    // else if (phone) query.phone = phone;
    // else if (name) query.name = name;
    // else if (role) query.role = role;

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier },
        { name: identifier },
      ],
    });

    if (!user) {
      return next(createHttpError(401, "Invalid credentials"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createHttpError(401, "Invalid credentials"));
    }

    const accessToken = Jwt.sign({ id: user._id }, config.accessTokenSecret, {
      expiresIn: '1d',
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax", // cross-origin safe
      secure: false,   // localhost only
      maxAge: 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        image: user.image || null,
      },
    });

  } catch (error) {
    next(error);
  }
};


const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    });
    res.status(200).json({ success: true, message: "User logout successfully!" })
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, logout, updateUserByAdmin, getUserById, deleteProfile, getProfile, addUserByAdmin, updateProfile, getAllUsers, getMe };
