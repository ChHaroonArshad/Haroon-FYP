const express  = require('express');
const router   = express.Router();
const {
  uploadArtwork,
  getAllArtworks,
  getArtworkById,
  getMyArtworks,
  updateArtwork,
  deleteArtwork,
} = require('../controllers/artworkController');
const { protect } = require('../middleware/auth');
const upload      = require('../middleware/upload');

const handleUploadError = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.get('/',       getAllArtworks);
router.get('/my',     protect, getMyArtworks);
router.get('/:id',    getArtworkById);
router.post('/upload',protect, handleUploadError, uploadArtwork);
router.put('/:id',    protect, handleUploadError, updateArtwork);
router.delete('/:id', protect, deleteArtwork);

module.exports = router;