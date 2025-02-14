const express = require("express");

//const { registerUser } = require("../controllers/userController");

//const { loginUser } = require("../controllers/userController")

const { registerUser, loginUser, updateUser, deleteUser,listUsers } = require("../controllers/userController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");


const router = express.Router()

router.post("/register",registerUser)

router.post("/login",loginUser)

router.put("/update/:userId", verifyToken, updateUser);// Only logged-in users can update their profile

router.delete("/delete/:userId", verifyToken, authorizeRoles("admin"), deleteUser); // Only admins can delete users

router.get("/list", verifyToken, authorizeRoles("admin"), listUsers); // Only admins can list all users

module.exports = router;