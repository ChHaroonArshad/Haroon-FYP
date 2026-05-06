const Order    = require('../models/Order');
const Artwork  = require('../models/Artwork');
const { createNotification } = require('./notificationController');

const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  return 'ORD-' + String(count + 1).padStart(4, '0');
};

const createOrder = async (req, res) => {
  try {
    const {
      artworkId, fullName, phone,
      address, city, notes, paymentMethod,
    } = req.body;

    if (!artworkId || !fullName || !phone || !address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
    }

    if (!artwork.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This artwork is no longer available',
      });
    }

    const orderNumber = await generateOrderNumber();

    const order = new Order({
      orderNumber,
      buyer:        req.user._id,
      buyerName:    req.user.fullName,
      buyerEmail:   req.user.email,
      artwork:      artwork._id,
      artworkTitle: artwork.title,
      artworkImage: artwork.image,
      artworkPrice: artwork.price,
      seller:       artwork.artist,
      sellerName:   artwork.artistName,
      fullName:     fullName.trim(),
      phone:        phone.trim(),
      address:      address.trim(),
      city:         city.trim(),
      notes:        notes          || '',
      paymentMethod:paymentMethod   || 'cod',
      totalAmount:  artwork.price,
    });

    await order.save();
    // Notify buyer
await createNotification({
  recipient: req.user._id,
  type:      'order',
  title:     'Order Placed Successfully',
  message:   `Your order for "${artwork.title}" has been placed. PKR ${artwork.price.toLocaleString()}`,
  link:      '/buyer/orders',
});

// Notify seller
await createNotification({
  recipient: artwork.artist,
  type:      'order',
  title:     'New Order Received!',
  message:   `${req.user.fullName} ordered "${artwork.title}" for PKR ${artwork.price.toLocaleString()}`,
  link:      '/seller/orders',
});

    // Mark sold but keep visible with sold badge
    artwork.isAvailable = false;
    artwork.sales      += 1;
    await artwork.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    console.log('getMyOrders called — userId:', userId);

    // Find using string comparison on all orders
    const allOrders = await Order.find({});
    const orders    = allOrders.filter(
      o => o.buyer.toString() === userId
    );

    console.log('Total orders in DB:', allOrders.length);
    console.log('Orders for this buyer:', orders.length);

    return res.status(200).json({
      success: true,
      orders:  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    console.error('Get my orders error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      seller: req.user._id,
    }).sort({ createdAt: -1 });

    console.log('getSellerOrders — userId:', req.user._id, '— found:', orders.length);

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Get seller orders error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const userId = req.user._id.toString();
    if (
      order.buyer.toString()  !== userId &&
      order.seller.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      'pending', 'confirmed', 'in-transit', 'delivered', 'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    order.status = status;

    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }

    // If cancelled — make artwork available again
    if (status === 'cancelled') {
      await Artwork.findByIdAndUpdate(
        order.artwork,
        { isAvailable: true }
      );
    }
// Notify buyer of status change
await createNotification({
  recipient: order.buyer,
  type:      'order',
  title:     `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
  message:   `Your order "${order.artworkTitle}" status updated to: ${status}`,
  link:      `/buyer/track/${order._id}`,
});
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
};