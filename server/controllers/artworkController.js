const Artwork = require('../models/Artwork');
const fs      = require('fs');
const path    = require('path');

const uploadArtwork = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('User:', req.user);
    console.log('File:', req.file);
    console.log('Body:', req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    const { title, description, price, category, medium, dimensions, tags } = req.body;

    if (!title || !description || !price || !category) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Title, description, price and category are required',
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid price',
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const artwork = new Artwork({
      title:       title.trim(),
      description: description.trim(),
      price:       parsedPrice,
      category,
      medium:      medium      ? medium.trim()      : '',
      dimensions:  dimensions  ? dimensions.trim()  : '',
      image:       imageUrl,
      artist:      req.user.id,
      artistName:  req.user.fullName,
      tags:        tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });

    const saved = await artwork.save();
    console.log('Artwork saved:', saved._id);

    return res.status(201).json({
      success: true,
      message: 'Artwork uploaded successfully',
      artwork: saved,
    });
  } catch (error) {
    console.error('Upload artwork error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const getAllArtworks = async (req, res) => {
  try {
    const {
      category, search, minPrice, maxPrice,
      sortBy, page = 1, limit = 20, artistId, showSold,
    } = req.query;

    // By default show available artworks
    // Pass showSold=true to include sold ones
    // const query = showSold === 'true' ? {} : { isAvailable: true };
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (artistId) {
      query.artist = artistId;
    }

    if (search) {
      query.$or = [
        { title:      { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } },
        { category:   { $regex: search, $options: 'i' } },
        { tags:       { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'price-low')  sort = { price:     1 };
    if (sortBy === 'price-high') sort = { price:    -1 };
    if (sortBy === 'rating')     sort = { rating:   -1 };
    if (sortBy === 'popular')    sort = { sales:    -1 };
    if (sortBy === 'trending')   sort = { views:    -1 };
    if (sortBy === 'featured')   sort = { isFeatured: -1, createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Artwork.countDocuments(query);

    const artworks = await Artwork.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('artist', 'fullName email avatar city specialty');

    return res.status(200).json({
      success:  true,
      total,
      page:     Number(page),
      pages:    Math.ceil(total / Number(limit)),
      artworks,
    });
  } catch (error) {
    console.error('Get artworks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate('artist', 'fullName email avatar city specialty');

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
    }

    artwork.views += 1;
    await artwork.save();

    return res.status(200).json({ success: true, artwork });
  } catch (error) {
    console.error('Get artwork by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const getMyArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user.id })
      .sort({ createdAt: -1 })
      .populate('artist', 'fullName email avatar city specialty');

    return res.status(200).json({
      success: true,
      artworks,
    });
  } catch (error) {
    console.error('Get my artworks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const updateArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
    }

    if (artwork.artist.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this artwork',
      });
    }

    const {
      title, description, price, category,
      medium, dimensions, isAvailable, tags,
    } = req.body;

    if (title)                     artwork.title       = title.trim();
    if (description)               artwork.description = description.trim();
    if (price)                     artwork.price       = parseFloat(price);
    if (category)                  artwork.category    = category;
    if (medium !== undefined)      artwork.medium      = medium;
    if (dimensions !== undefined)  artwork.dimensions  = dimensions;
    if (tags !== undefined)        artwork.tags        = tags
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];
    if (isAvailable !== undefined) {
      artwork.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    if (req.file) {
      // Delete old image
      const oldPath = path.join(__dirname, '..', artwork.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      artwork.image = `/uploads/${req.file.filename}`;
    }

    const updated = await artwork.save();

    return res.status(200).json({
      success:  true,
      message:  'Artwork updated successfully',
      artwork:  updated,
    });
  } catch (error) {
    console.error('Update artwork error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
    }

    if (artwork.artist.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this artwork',
      });
    }

    const imgPath = path.join(__dirname, '..', artwork.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await artwork.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Artwork deleted successfully',
    });
  } catch (error) {
    console.error('Delete artwork error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

module.exports = {
  uploadArtwork,
  getAllArtworks,
  getArtworkById,
  getMyArtworks,
  updateArtwork,
  deleteArtwork,
};