const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

const registerUser = async (req, res, next) => {
    const { name, email, password, role, profileImage, phone, address } = req.body;
    try {

        const existingUser = await User.findOne({ email, role });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            profileImage,
            phone,
            address

        })

        res.status(200).json({
            message: "User created successfully", user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                phone: user.phone,
                address: user.address
            }

        })


    }
    catch (error) {
        next(error);
    }

}

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "user not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "invalid password" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            }, process.env.JWT_SECRET, { expiresIn: "1d" }
        )

        res.status(200).json({
            message: "User Logged successfully", token, user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                phone: user.phone,
                address: user.address
            }
        })
    }
    catch (error) {
        next(error);
    }
}

// Update User (Edit Profile)
const updateUser = async (req, res, next) => {
    const { userId } = req.params;
    const { name, email, password, profileImage, phone, address } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash new password if updated
        if (password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

        res.status(200).json({
            message: "User updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profileImage: updatedUser.profileImage,
                phone: updatedUser.phone,
                address: updatedUser.address
            }
        });
    } catch (error) {
        next(error);
    }
};

// Delete User
const deleteUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
};

//List all users
const listUsers = async (req, res) => {
    try {
      const users = await User.find().select("-password"); // Exclude passwords
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
  };


module.exports = { registerUser, loginUser, updateUser, deleteUser, listUsers };
