const Order = require("./order.model");
const { Book } = require('../books/book.model');
const mongoose = require('mongoose');
const { handleServerError } = require('../utils/error');

const createAOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Handle new format (with products field) and ensure backward compatibility
    if (orderData.products && Array.isArray(orderData.products)) {
      // Extract productIds from products for backward compatibility
      orderData.productIds = orderData.products.map(product => product.productId);
      
      // Ensure each product has a price and quantity
      orderData.products = orderData.products.map(product => ({
        productId: product.productId,
        quantity: product.quantity || 1,
        price: product.price || 0
      }));
    } else if (orderData.productIds && !orderData.products) {
      // Create products array from productIds for new format
      // If no price information is available, default to 0
      orderData.products = orderData.productIds.map(id => ({
        productId: id,
        quantity: 1,
        price: 0 // Default price, should be updated with actual price
      }));
      
      // Try to fetch book prices if possible
      try {
        for (let i = 0; i < orderData.products.length; i++) {
          const book = await Book.findById(orderData.products[i].productId);
          if (book) {
            orderData.products[i].price = book.discountPrice || book.price || 0;
          }
        }
      } catch (err) {
        console.error('Error fetching book prices:', err);
        // Continue with default prices if there's an error
      }
    }

    // Set default status to pending if not provided
    if (!orderData.status) {
      orderData.status = 'pending';
    }

    const newOrder = await Order(orderData);
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

const getOrderByEmail = async (req, res) => {
  try {
    const {email} = req.params;
    const orders = await Order.find({email})
      .populate('products.productId', 'title author price newPrice coverImage')
      .sort({createdAt: -1});
    if(!orders) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
}

// Lấy tất cả đơn hàng - chỉ admin
const getAllOrders = async (req, res) => {
  try {
    console.log('Getting all orders for admin');
    const orders = await Order.find({})
      .populate('products.productId', 'title author price newPrice coverImage')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders`);
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    return handleServerError(res, error);
  }
};

// Lấy đơn hàng của người dùng hiện tại
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Getting orders for user ${userId}`);
    
    const orders = await Order.find({ email: req.user.email })
      .populate('products.productId', 'title author price')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders for user ${userId}`);
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return handleServerError(res, error);
  }
};

// Lấy thông tin chi tiết một đơn hàng
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting order with ID: ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    const order = await Order.findById(id)
      .populate('products.productId', 'title author price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Kiểm tra quyền truy cập - chỉ admin hoặc chủ đơn hàng
    if (req.user.role !== 'admin' && order.email !== req.user.email) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return handleServerError(res, error);
  }
};

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const { products, paymentMethod, address } = req.body;
    console.log('Creating new order', req.body);
    
    if (!products || !products.length) {
      return res.status(400).json({ message: 'Order must contain at least one product' });
    }
    
    // Tính tổng giá trị đơn hàng
    let totalPrice = 0;
    for (const item of products) {
      // Kiểm tra sản phẩm tồn tại
      const book = await Book.findById(item.productId);
      if (!book) {
        return res.status(404).json({ message: `Book with ID ${item.productId} not found` });
      }
      
      // Kiểm tra số lượng
      if (book.countInStock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for "${book.title}". Available: ${book.countInStock}` 
        });
      }
      
      totalPrice += book.price * item.quantity;
      
      // Cập nhật số lượng sách trong kho
      await Book.findByIdAndUpdate(item.productId, { 
        $inc: { countInStock: -item.quantity } 
      });
    }
    
    // Tạo đơn hàng mới
    const order = new Order({
      email: req.user.email,
      name: req.user.name,
      phone: req.body.phone,
      products: products.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice,
      address,
      paymentMethod,
      status: 'pending',
      createdAt: new Date()
    });
    
    const savedOrder = await order.save();
    console.log(`Created order with ID: ${savedOrder._id}`);
    
    return res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error in createOrder:', error);
    return handleServerError(res, error);
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`Updating order ${id} status to ${status}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    // Kiểm tra status hợp lệ
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Chỉ admin mới có quyền cập nhật trạng thái
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can update order status' });
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Cập nhật trạng thái
    const updateData = { status };
    
    // Nếu đơn hàng chuyển sang trạng thái delivered, thêm deliveredAt
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      updateData,
      { new: true }
    ).populate('products.productId', 'title author price');
    
    console.log(`Updated order ${id} status to ${status}`);
    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return handleServerError(res, error);
  }
};

// Hủy đơn hàng
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Cancelling order ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Kiểm tra quyền truy cập - chỉ admin hoặc chủ đơn hàng
    if (req.user.role !== 'admin' && order.email !== req.user.email) {
      return res.status(403).json({ message: 'You can only cancel your own orders' });
    }
    
    // Kiểm tra xem đơn hàng có thể hủy không
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }
    
    // Khôi phục số lượng sách
    for (const item of order.products) {
      await Book.findByIdAndUpdate(item.productId, { 
        $inc: { countInStock: item.quantity } 
      });
    }
    
    order.status = 'cancelled';
    const updatedOrder = await order.save();
    
    console.log(`Order ${id} cancelled successfully`);
    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    return handleServerError(res, error);
  }
};

module.exports = {
  createAOrder,
  getOrderByEmail,
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder
};
