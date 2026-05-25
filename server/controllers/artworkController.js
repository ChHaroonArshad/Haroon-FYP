const Artwork = require('../models/Artwork');
const fs      = require('fs');
const path    = require('path');

// POST /api/artworks/upload
const uploadArtwork = async (req, res) => {
  try {
    if (!req.files?.image?.[0] && !req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const imageFile = req.files?.image?.[0] || req.file;
    const { title, description, price, category, medium, dimensions, tags, yearCreated, isPhysical } = req.body;

    if (!title || !description || !price || !category) {
      fs.unlinkSync(imageFile.path);
      return res.status(400).json({ success: false, message: 'Title, description, price and category are required' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      fs.unlinkSync(imageFile.path);
      return res.status(400).json({ success: false, message: 'Please enter a valid price' });
    }

    // Handle proof video
    let proofVideoPath = '';
    if (req.files?.proofVideo?.[0]) {
      proofVideoPath = `/uploads/${req.files.proofVideo[0].filename}`;
    }

    // Handle extra photos
    let extraPhotos = [];
    if (req.files?.extraPhotos) {
      extraPhotos = req.files.extraPhotos.map(f => `/uploads/${f.filename}`);
    }

    const artwork = new Artwork({
      title:       title.trim(),
      description: description.trim(),
      price:       parsedPrice,
      category,
      medium:      medium     ? medium.trim()     : '',
      dimensions:  dimensions ? dimensions.trim() : '',
      image:       `/uploads/${imageFile.filename}`,
      artist:      req.user.id,
      artistName:  req.user.fullName,
      tags:        tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      yearCreated: yearCreated || '',
      isPhysical:  isPhysical === 'false' ? false : true,
      proofVideo:  proofVideoPath,
      extraPhotos,
      isApproved:     false,
      approvalStatus: 'pending',
    });

    const saved = await artwork.save();
    return res.status(201).json({
      success: true,
      message: 'Artwork uploaded! Pending admin approval before it goes live.',
      artwork: saved,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/artworks — public, only approved
const getAllArtworks = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sortBy, page = 1, limit = 20, artistId } = req.query;

    const query = { isApproved: true };

    if (category && category !== 'All') query.category = category;
    if (artistId) query.artist = artistId;
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
    if (sortBy === 'price-low')  sort = { price:      1 };
    if (sortBy === 'price-high') sort = { price:     -1 };
    if (sortBy === 'rating')     sort = { rating:    -1 };
    if (sortBy === 'popular')    sort = { sales:     -1 };
    if (sortBy === 'trending')   sort = { views:     -1 };
    if (sortBy === 'featured')   sort = { isFeatured: -1, createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Artwork.countDocuments(query);
    const artworks = await Artwork.find(query)
      .sort(sort).skip(skip).limit(Number(limit))
      .populate('artist', 'fullName email avatar city specialty');

    return res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), artworks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/artworks/:id
const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate('artist', 'fullName email avatar city specialty');
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    artwork.views += 1;
    await artwork.save();
    return res.status(200).json({ success: true, artwork });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// GET /api/artworks/my — artist sees ALL including pending/rejected
const getMyArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user.id })
      .sort({ createdAt: -1 })
      .populate('artist', 'fullName email avatar city specialty');
    return res.status(200).json({ success: true, artworks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// PUT /api/artworks/:id
const updateArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    if (artwork.artist.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const { title, description, price, category, medium, dimensions, isAvailable, tags, yearCreated, isPhysical } = req.body;

    if (title)                    artwork.title       = title.trim();
    if (description)              artwork.description = description.trim();
    if (price)                    artwork.price       = parseFloat(price);
    if (category)                 artwork.category    = category;
    if (medium !== undefined)     artwork.medium      = medium;
    if (dimensions !== undefined) artwork.dimensions  = dimensions;
    if (yearCreated !== undefined) artwork.yearCreated = yearCreated;
    if (isPhysical !== undefined) artwork.isPhysical  = isPhysical === 'false' ? false : true;
    if (tags !== undefined)       artwork.tags        = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    if (isAvailable !== undefined) artwork.isAvailable = isAvailable === 'true' || isAvailable === true;

    if (title || description || price || category || req.file) {
      artwork.isApproved      = false;
      artwork.approvalStatus  = 'pending';
      artwork.rejectionReason = '';
      artwork.isAuthenticated      = false;
      artwork.authenticationStatus = 'unverified';
    }

    if (req.file) {
      const oldPath = path.join(__dirname, '..', artwork.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      artwork.image = `/uploads/${req.file.filename}`;
    }

    const updated = await artwork.save();
    return res.status(200).json({ success: true, message: 'Artwork updated. Pending re-approval.', artwork: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// DELETE /api/artworks/:id
const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    if (artwork.artist.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const imgPath = path.join(__dirname, '..', artwork.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    if (artwork.proofVideo) {
      const vPath = path.join(__dirname, '..', artwork.proofVideo);
      if (fs.existsSync(vPath)) fs.unlinkSync(vPath);
    }
    for (const photo of artwork.extraPhotos || []) {
      const pPath = path.join(__dirname, '..', photo);
      if (fs.existsSync(pPath)) fs.unlinkSync(pPath);
    }

    await artwork.deleteOne();
    return res.status(200).json({ success: true, message: 'Artwork deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { uploadArtwork, getAllArtworks, getArtworkById, getMyArtworks, updateArtwork, deleteArtwork };