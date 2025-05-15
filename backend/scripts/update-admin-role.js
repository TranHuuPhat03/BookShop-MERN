require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/users/user.model');

// Connect to MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    updateAdminRole();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function updateAdminRole() {
  try {
    // Find admin user
    const admin = await User.findOne({ username: 'sang@gmail.com' });
    
    if (!admin) {
      console.log('Admin user not found');
      mongoose.disconnect();
      return;
    }
    
    console.log('Found admin user:', admin.username);
    console.log('Current role:', admin.role);
    
    if (admin.role !== 'admin') {
      // Update the role
      admin.role = 'admin';
      await admin.save();
      console.log('Updated admin role to "admin"');
    } else {
      console.log('Admin role is already set correctly');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating admin role:', error);
    mongoose.disconnect();
    process.exit(1);
  }
} 