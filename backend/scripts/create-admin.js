require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/users/user.model');
const bcrypt = require('bcrypt');

// Admin credentials to create
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Connect to MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    createAdminIfNotExists();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function createAdminIfNotExists() {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists:', adminExists.username);
      console.log('If you need to reset the admin password, delete the user first.');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      const adminUser = new User({
        username: ADMIN_USERNAME,
        password: hashedPassword, // Pre-hash password to avoid the schema middleware
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('Admin user created successfully with username:', ADMIN_USERNAME);
      console.log('Password:', ADMIN_PASSWORD);
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.disconnect();
    process.exit(1);
  }
} 