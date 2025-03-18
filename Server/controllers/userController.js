const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");

const registerUser = async (req, res, next) => {
    const { name, email, password, role, phone, address } = req.body;
    try {
        const imageUrl = req.file ? req.file.path : null; // Get Cloudinary URL

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
            profileImage:imageUrl,
            phone,
            address,
            status:'active'

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
    const { email, password, role } = req.body;
    try {
        //console.log(req.body,"testt");
        const user = await User.findOne({ "email": email, "role": role });
        //console.log("user",user);
        if (!user) {
           // console.log("User not found");
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
            success:"true",
            message: "User Logged successfully", token, user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                phone: user.phone,
                address: user.address,
                status: user.status
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
    const { name, email, password, phone, address } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Handle profile image update
        let imageUrl = user.profileImage; // Keep existing image by default
        console.log("file uploaded",req.file);
        console.log("data uploaded",req.body);
        if (req.file) {
            // Delete old image from Cloudinary if a new one is uploaded
            if (user.profileImage) {
                const publicId = user.profileImage.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`partypilot/${publicId}`);
            }

            // Upload new image to Cloudinary
            imageUrl = req.file.path;
        }
        const updatedFields = { name, email, phone, address, profileImage: imageUrl };
//console.log("updatedData",updatedFields);
        // Hash new password if updated
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedFields.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

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

         // Extract public_id from image URL 
        const publicId = user.profileImage.split("/").pop().split(".")[0]; 
 
        // Delete image from Cloudinary 
            await cloudinary.uploader.destroy(`partypilot/${publicId}`);

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

  const fetchUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Example of the route in Express
//app.patch('/api/users/:id/status', async (req, res) => {
    const updateUserStatus = async (req, res) => {
    try {
      const userId = req.params.id;
      //console.log("user",userId);
      const { status } = req.body;  // Expecting the new status ('active' or 'inactive')
     //console.log("reques",req.body);
  
      const user = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true }  // Return the updated user object
      );
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
     // console.log(user);
  
      res.json(user);  // Return the updated user
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  



module.exports = { registerUser, loginUser, updateUser, deleteUser, listUsers, fetchUser, updateUserStatus };
