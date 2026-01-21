const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  getUserById,
  getAllUsers,
  updateUserByAdmin,
  deleteProfile,
  addUserByAdmin,
  getProfile,
} = require("../controllers/UserControllers");

const upload = require("../middleware/upload.js");
const { protect, adminOnly } = require("../middleware/authMiddleware.js");

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// User
router.get("/me", protect, getMe);
router.get("/profile", protect, getProfile);
//router.get('/profile', protect, updateProfile);
router.put("/profile", protect, adminOnly, upload.single("image"), updateProfile);

// Admin
router.post("/admin/add-user", protect, adminOnly, addUserByAdmin);
router.get("/admin/users", protect, adminOnly, getAllUsers);
router.put("/admin/users/:id", protect, adminOnly, upload.single("image"), updateUserByAdmin);
router.get("/admin/users/:id", protect, adminOnly, getUserById);


router.delete("/admin/users/:id", protect, adminOnly, deleteProfile);

module.exports = router;
