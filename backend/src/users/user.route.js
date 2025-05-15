const express =  require('express');
const User = require('./user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyAdminToken = require('../middleware/verifyAdminToken');

const router =  express.Router();

const JWT_SECRET = process.env.JWT_SECRET_KEY
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET_KEY || 'admin-secret-key'

// Register a new user endpoint
router.post("/register", async (req, res) => {
    const {username, password} = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({username});
        if(existingUser) {
            return res.status(400).send({message: "User already exists!"});
        }
        
        // Create new user
        const newUser = new User({
            username,
            password,
            role: 'user' // Default role
        });
        
        await newUser.save();
        
        const token = jwt.sign(
            {id: newUser._id, username: newUser.username, role: newUser.role}, 
            JWT_SECRET,
            {expiresIn: "1h"}
        );
        
        return res.status(201).json({
            message: "User registered successfully",
            token: token,
            user: {
                username: newUser.username,
                role: newUser.role
            }
        });
        
    } catch (error) {
        console.error("Failed to register user", error);
        res.status(500).send({message: "Failed to register user"});
    }
});

// User login endpoint
router.post("/login", async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await User.findOne({username});
        if(!user) {
            return res.status(404).send({message: "User not found!"});
        }
        
        // Compare password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).send({message: "Invalid password!"});
        }
        
        const token = jwt.sign(
            {id: user._id, username: user.username, role: user.role}, 
            JWT_SECRET,
            {expiresIn: "1h"}
        );
        
        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                username: user.username,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error("Failed to login", error);
        res.status(500).send({message: "Failed to login"});
    }
});

router.post("/admin", async (req, res) => {
    const {username, password} = req.body;
    try {
        const admin = await User.findOne({username});
        if(!admin) {
            return res.status(404).send({message: "Admin not found!"});
        }
        
        // For admins with hashed password (created after our changes)
        if(admin.password.startsWith('$2b$')) {
            const isMatch = await bcrypt.compare(password, admin.password);
            if(!isMatch) {
                return res.status(401).send({message: "Invalid password!"});
            }
        } else {
            // Legacy admin check (direct comparison)
            if(admin.password !== password) {
                return res.status(401).send({message: "Invalid password!"});
            }
        }
        
        // Check if user is actually an admin
        if(admin.role !== 'admin') {
            return res.status(403).send({message: "Access denied: User is not an admin"});
        }
        
        const token = jwt.sign(
            {id: admin._id, username: admin.username, role: admin.role}, 
            ADMIN_JWT_SECRET,
            {expiresIn: "1h"}
        );

        return res.status(200).json({
            message: "Authentication successful",
            token: token,
            user: {
                username: admin.username,
                role: admin.role
            }
        });
        
    } catch (error) {
        console.error("Failed to login as admin", error);
        return res.status(500).send({message: "Failed to login as admin"});
    }
});

// Check if email exists endpoint
router.post("/check-email", async (req, res) => {
    const {username} = req.body;
    try {
        const existingUser = await User.findOne({username});
        return res.status(200).json({
            exists: !!existingUser
        });
    } catch (error) {
        console.error("Error checking email:", error);
        return res.status(500).send({message: "Failed to check email"});
    }
});

// Get user profile by email endpoint
router.get("/profile/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ username: email });
        if (!user) {
            return res.status(404).send({ message: "User not found!" });
        }
        
        return res.status(200).json({
            profile: user.profile || {}
        });
    } catch (error) {
        console.error("Error getting user profile:", error);
        return res.status(500).send({ message: "Failed to get user profile" });
    }
});

// Update user profile endpoint
router.put("/profile/:email", async (req, res) => {
    const { email } = req.params;
    const { profile } = req.body;
    
    try {
        const updatedUser = await User.findOneAndUpdate(
            { username: email },
            { profile },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).send({ message: "User not found!" });
        }
        
        return res.status(200).json({
            message: "Profile updated successfully",
            profile: updatedUser.profile
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).send({ message: "Failed to update user profile" });
    }
});

// Get all users (admin only)
router.get("/all-users", verifyAdminToken, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password field
        return res.status(200).json(users);
    } catch (error) {
        console.error("Failed to get users:", error);
        return res.status(500).send({ message: "Failed to get users" });
    }
});

// Update user role (admin only)
router.put("/update-role/:userId", verifyAdminToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role || !['admin', 'user'].includes(role)) {
            return res.status(400).send({ message: "Invalid role provided" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check if the user is trying to change their own role
        if (req.user.id === userId) {
            return res.status(403).send({ message: "You cannot change your own role" });
        }

        user.role = role;
        await user.save();

        return res.status(200).json({
            message: "User role updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Failed to update user role:", error);
        return res.status(500).send({ message: "Failed to update user role" });
    }
});

module.exports = router;