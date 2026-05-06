const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const customRequestRoutes = require('./routes/customRequestRoutes');
require('dotenv').config();

const authRoutes         = require('./routes/authRoutes');
const artworkRoutes      = require('./routes/artworkRoutes');
const orderRoutes        = require('./routes/orderRoutes');
const messageRoutes      = require('./routes/messageRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth',          authRoutes);
app.use('/api/artworks',      artworkRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/notifications', notificationRoutes);
// add with other routes:
app.use('/api/custom-requests', customRequestRoutes);

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'ArtBazaar API is running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });