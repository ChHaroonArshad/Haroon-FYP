const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const User         = require('../models/User');
const { createNotification } = require('./notificationController');

// POST /api/messages/conversation
// Start or get existing conversation between buyer and seller
const getOrCreateConversation = async (req, res) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required',
      });
    }

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    const buyerId = req.user._id;

    // Find existing conversation
    let conversation = await Conversation.findOne({
      buyer:  buyerId,
      seller: sellerId,
    });

    // Create if not exists
    if (!conversation) {
      conversation = new Conversation({
        buyer:        buyerId,
        seller:       sellerId,
        buyerName:    req.user.fullName,
        sellerName:   seller.fullName,
        buyerAvatar:  req.user.avatar  || '',
        sellerAvatar: seller.avatar    || '',
        lastMessage:  '',
        lastMessageAt:new Date(),
      });
      await conversation.save();
    }

    return res.status(200).json({
      success:      true,
      conversation,
    });
  } catch (error) {
    console.error('Get/create conversation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

// GET /api/messages/conversations — get all conversations for logged-in user
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const role   = req.user.role;

    let conversations;
    if (role === 'artist') {
      conversations = await Conversation.find({ seller: userId })
        .sort({ lastMessageAt: -1 });
    } else {
      conversations = await Conversation.find({ buyer: userId })
        .sort({ lastMessageAt: -1 });
    }

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

// GET /api/messages/:conversationId — get all messages in a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId             = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Only buyer or seller can read
    if (
      conversation.buyer.toString()  !== userId &&
      conversation.seller.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 });

    // Mark messages as read
    const role = req.user.role;
    if (role === 'artist') {
      await Message.updateMany(
        { conversation: conversationId, senderRole: 'buyer', read: false },
        { read: true }
      );
      await Conversation.findByIdAndUpdate(conversationId, { sellerUnread: 0 });
    } else {
      await Message.updateMany(
        { conversation: conversationId, senderRole: 'artist', read: false },
        { read: true }
      );
      await Conversation.findByIdAndUpdate(conversationId, { buyerUnread: 0 });
    }

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Get messages error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

// POST /api/messages/send — send a message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and message text are required',
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const userId = req.user._id.toString();
    if (
      conversation.buyer.toString()  !== userId &&
      conversation.seller.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const senderRole = req.user.role === 'artist' ? 'artist' : 'buyer';

    const message = new Message({
      conversation:  conversationId,
      sender:        req.user._id,
      senderName:    req.user.fullName,
      senderAvatar:  req.user.avatar || '',
      senderRole,
      text:          text.trim(),
      read:          false,
    });

    await message.save();
    // Notify the other person
const recipientId = senderRole === 'buyer'
  ? conversation.seller
  : conversation.buyer;

await createNotification({
  recipient: recipientId,
  type:      'message',
  title:     'New Message',
  message:   `${req.user.fullName}: ${text.trim().slice(0, 60)}${text.length > 60 ? '...' : ''}`,
  link:      senderRole === 'buyer' ? '/seller/chat' : '/buyer/messages',
});

    // Update conversation last message + unread count
    const updateData = {
      lastMessage:   text.trim(),
      lastMessageAt: new Date(),
    };

    if (senderRole === 'buyer') {
      updateData.$inc = { sellerUnread: 1 };
    } else {
      updateData.$inc = { buyerUnread: 1 };
    }

    await Conversation.findByIdAndUpdate(conversationId, updateData);

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
};