const User = require('../models/User');
const Artwork = require('../models/Artwork');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const validator = require('validator');


const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const isValidPassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return password.length >= minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

const signup = async (req, res) => {
  try {
    // 1. Destructure and Sanitize Inputs (Convert to strings to prevent NoSQL injection objects)
    let { fullName, email, password, role } = req.body;

    fullName = fullName ? String(fullName).trim() : '';
    email = email ? String(email).trim().toLowerCase() : '';
    password = password ? String(password) : '';
    role = role ? String(role) : 'buyer';

    // 2. Strict Input Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password',
      });
    }

    // STRICT NAME CHECK: Letters, spaces, hyphens only.
    const nameRegex = /^[a-zA-Z][a-zA-Z\s'-]{2,49}$/;
    if (!nameRegex.test(fullName)) {
      return res.status(400).json({
        success: false,
        message: 'Full name must contain valid alphabetic characters and be between 3 and 50 characters long.',
      });
    }

    // STRICT EMAIL CHECK
    const localPart = email.split('@')[0];
    if (!validator.isEmail(email) || /^\d+$/.test(localPart)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid, non-numeric email format.',
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 8+ characters and include uppercase, lowercase, numbers, and special characters.',
      });
    }
    if (!['buyer', 'artist'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role provided',
      });
    }

    // 3. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ // 409 Conflict is better for duplicates than 400
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds is excellent for modern security

    // 5. Create user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();
    const token = generateToken(user._id);

    // 6. Return sanitized user object
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Signup error:', error); // Log the full error to the server, not just error.message
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during signup. Please try again later.', // Don't expose database errors to the client
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email exists a reset link has been sent',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Reset token generated',
      resetToken,
      resetUrl: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`,
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      fullName, phone, city, country, bio,
      specialty, experience, instagram, website,
      storeName, storeTagline, acceptCustomOrders,
      deliveryOptions, notifications,
    } = req.body;

    if (!fullName?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
      });
    }

    const updateData = {
      fullName: fullName.trim(),
      phone: phone || '',
      city: city || '',
      country: country || 'Pakistan',
      bio: bio || '',
      specialty: specialty || '',
      experience: experience || '',
      instagram: instagram || '',
      website: website || '',
      storeName: storeName || '',
      storeTagline: storeTagline || '',
      acceptCustomOrders: acceptCustomOrders === 'false' ? false : true,
    };

    if (deliveryOptions) {
      updateData.deliveryOptions = Array.isArray(deliveryOptions)
        ? deliveryOptions
        : JSON.parse(deliveryOptions);
    }

    if (notifications) {
      updateData.notifications = typeof notifications === 'string'
        ? JSON.parse(notifications)
        : notifications;
    }

    if (req.file) {
      const currentUser = await User.findById(req.user.id);
      if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', currentUser.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your password to confirm',
      });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password. Account not deleted.',
      });
    }

    // Delete all artworks and their images
    const artworks = await Artwork.find({ artist: req.user.id });
    for (const art of artworks) {
      if (art.image) {
        const imgPath = path.join(__dirname, '..', art.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }
      await art.deleteOne();
    }

    // Delete avatar
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};
// ── Wishlist ──────────────────────────────────────────────────
const toggleWishlist = async (req, res) => {
  try {
    const { artworkId } = req.body;
    if (!artworkId) {
      return res.status(400).json({ success: false, message: 'Artwork ID required' });
    }
    const user = await User.findById(req.user._id);
    const index = user.wishlist.findIndex(id => id.toString() === artworkId.toString());
    if (index === -1) {
      user.wishlist.push(artworkId);
    } else {
      user.wishlist.splice(index, 1);
    }
    await user.save();
    return res.status(200).json({
      success: true,
      wishlist: user.wishlist,
      isWishlisted: index === -1,
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'artist', select: 'fullName avatar city specialty' },
    });
    return res.status(200).json({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    console.error('Get wishlist error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  toggleWishlist,
  getWishlist,
};