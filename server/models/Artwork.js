const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['Landscape', 'Abstract', 'Traditional', 'Modern', 'Calligraphy', 'Portraits', 'Other'],
    },
    medium: {
      type: String,
      trim: true,
    },
    dimensions: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    artistName: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    sales: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artwork', artworkSchema);