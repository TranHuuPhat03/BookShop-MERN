require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../src/orders/order.model');
const Book = require('../src/books/book.model');

console.log('Starting script to update product prices in orders');
console.log('DB_URL:', process.env.DB_URL ? 'OK (value found)' : 'NOT FOUND');

// Connect to MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    updateProductPrices();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function updateProductPrices() {
  try {
    console.log('Looking for orders where products have no price...');
    
    // Find all orders
    const orders = await Order.find({});
    
    console.log(`Found ${orders.length} orders total`);
    
    let updatedCount = 0;
    
    // Update each order
    for (const order of orders) {
      let orderUpdated = false;
      
      if (order.products && order.products.length > 0) {
        for (let i = 0; i < order.products.length; i++) {
          const product = order.products[i];
          
          // Check if price is missing or 0
          if (!product.price || product.price === 0) {
            try {
              // Fetch the book to get its price
              const book = await Book.findById(product.productId);
              
              if (book) {
                // Get the price from the book data
                const price = book.newPrice || book.price || 0;
                
                // Update the product price
                order.products[i].price = price;
                orderUpdated = true;
                
                console.log(`Updated price for product ${product.productId} in order ${order._id} to ${price}`);
              }
            } catch (err) {
              console.error(`Error fetching book ${product.productId}:`, err);
            }
          }
        }
        
        // Recalculate the total price based on product prices and quantities
        if (orderUpdated) {
          const totalPrice = order.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          order.totalPrice = totalPrice;
          
          // Save the updated order
          await order.save();
          updatedCount++;
          
          console.log(`Updated order ${order._id} total price to ${totalPrice}`);
        }
      }
    }
    
    console.log(`Successfully updated ${updatedCount} orders with proper product prices`);
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error updating product prices:', error);
    mongoose.disconnect();
    process.exit(1);
  }
} 