const express = require('express');
const { createAOrder, getOrderByEmail, updateOrderStatus } = require('./order.controller');
const Order = require('./order.model');
const verifyAdminToken = require('../middleware/verifyAdminToken');

const router =  express.Router();

// create order endpoint
router.post("/", createAOrder);

// get orders by user email 
router.get("/email/:email", getOrderByEmail);

// Get all orders (admin only)
router.get("/all", verifyAdminToken, async (req, res) => {
    try {
        console.log('Fetch all orders request received');
        // Đảm bảo token hợp lệ và user là admin
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access forbidden: Not an admin user' });
        }
        
        const orders = await Order.find()
            .populate('products.productId', 'title oldPrice newPrice coverImage')
            .sort({ createdAt: -1 });
        console.log(`Found ${orders.length} orders`);
        
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return res.status(500).send({ message: "Failed to fetch orders" });
    }
});

// Get order by ID (admin only)
router.get("/:id", verifyAdminToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }
        
        return res.status(200).json(order);
    } catch (error) {
        console.error("Failed to fetch order:", error);
        return res.status(500).send({ message: "Failed to fetch order" });
    }
});

// Update order status (admin only)
router.put("/:id/status", verifyAdminToken, updateOrderStatus);

module.exports = router;