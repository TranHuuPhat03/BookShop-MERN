require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../src/orders/order.model');

console.log('Starting script to update order status');
console.log('DB_URL:', process.env.DB_URL ? 'OK (value found)' : 'NOT FOUND');

// Connect to MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    updateOrderStatus();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function updateOrderStatus() {
  try {
    console.log('Looking for orders without status field...');
    // Find all orders without status field
    const orders = await Order.find({ status: { $exists: false } });
    
    console.log(`Found ${orders.length} orders without status`);
    
    if (orders.length === 0) {
      console.log('No orders need to be updated. All orders already have status field.');
      mongoose.disconnect();
      return;
    }
    
    // Update each order to add status field
    let updated = 0;
    for (const order of orders) {
      order.status = 'pending';
      await order.save();
      updated++;
      
      if (updated % 10 === 0) {
        console.log(`Updated ${updated}/${orders.length} orders...`);
      }
    }
    
    console.log(`Successfully updated ${updated} orders with default status 'pending'`);
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating order status:', error);
    mongoose.disconnect();
    process.exit(1);
  }
} 