const express = require('express');
const router  = express.Router();
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/conversation',       protect, getOrCreateConversation);
router.get('/conversations',       protect, getConversations);
router.get('/:conversationId',     protect, getMessages);
router.post('/send',               protect, sendMessage);

module.exports = router;