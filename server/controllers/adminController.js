const User         = require('../models/User');
const Artwork      = require('../models/Artwork');
const Order        = require('../models/Order');
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments();
    const totalBuyers   = await User.countDocuments({ role: 'buyer' });
    const totalArtists  = await User.countDocuments({ role: 'artist' });
    const totalArtworks = await Artwork.countDocuments();
    const totalOrders   = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBuyers,
        totalArtists,
        totalArtworks,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const query = {};
    if (role && role !== 'all') query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email:    { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json({ success: true, users, total });
  } catch (error) {
    console.error('Get users error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin' });
    }
    await Artwork.deleteMany({ artist: user._id });
    await Order.deleteMany({ $or: [{ buyer: user._id }, { seller: user._id }] });
    await user.deleteOne();
    return res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/admin/artworks
const getArtworks = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title:      { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } },
      ];
    }

    const artworks = await Artwork.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('artist', 'fullName email avatar');

    const total = await Artwork.countDocuments(query);
    return res.status(200).json({ success: true, artworks, total });
  } catch (error) {
    console.error('Get artworks error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/admin/artworks/:id
const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }
    const fs   = require('fs');
    const path = require('path');
    if (artwork.image) {
      const imgPath = path.join(__dirname, '..', artwork.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await artwork.deleteOne();
    return res.status(200).json({ success: true, message: 'Artwork deleted' });
  } catch (error) {
    console.error('Delete artwork error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/admin/orders
const getOrders = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { artworkTitle: { $regex: search, $options: 'i' } },
        { buyerName:    { $regex: search, $options: 'i' } },
        { sellerName:   { $regex: search, $options: 'i' } },
        { orderNumber:  { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Order.countDocuments(query);
    return res.status(200).json({ success: true, orders, total });
  } catch (error) {
    console.error('Get orders error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Update order error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/admin/recent
const getRecentActivity = async (req, res) => {
  try {
    const recentUsers    = await User.find().sort({ createdAt: -1 }).limit(5).select('fullName email role createdAt');
    const recentOrders   = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentArtworks = await Artwork.find().sort({ createdAt: -1 }).limit(5).select('title artistName createdAt image');

    return res.status(200).json({
      success: true,
      recentUsers,
      recentOrders,
      recentArtworks,
    });
  } catch (error) {
    console.error('Recent activity error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  deleteUser,
  getArtworks,
  deleteArtwork,
  getOrders,
  updateOrderStatus,
  getRecentActivity,
};