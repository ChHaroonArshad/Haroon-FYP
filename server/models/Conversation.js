const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    buyer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    seller: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    buyerName:  { type: String, required: true },
    sellerName: { type: String, required: true },
    buyerAvatar:  { type: String, default: '' },
    sellerAvatar: { type: String, default: '' },
    lastMessage:  { type: String, default: '' },
    lastMessageAt:{ type: Date,   default: Date.now },
    buyerUnread:  { type: Number, default: 0 },
    sellerUnread: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One conversation per buyer-seller pair
conversationSchema.index({ buyer: 1, seller: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);