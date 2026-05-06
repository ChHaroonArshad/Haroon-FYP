import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Search, Check, CheckCheck,
  Loader, MessageCircle
} from 'lucide-react';
import SellerSidebar  from './SellerSidebar';
import SellerHeader   from './SellerHeader';
import { messageAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const ChatWithBuyers = () => {
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv,  setSelectedConv]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [messageInput,  setMessageInput]  = useState('');
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [sending,       setSending]       = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');

  const messagesEndRef = useRef(null);
  const pollRef        = useRef(null);
  const user           = JSON.parse(localStorage.getItem('user') || '{}');

  const loadConversations = useCallback(async () => {
    try {
      const data = await messageAPI.getConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Load conversations error:', err.message);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    setLoadingMsgs(true);
    try {
      const data = await messageAPI.getMessages(convId);
      setMessages(data.messages || []);
      loadConversations();
    } catch (err) {
      console.error('Load messages error:', err.message);
    } finally {
      setLoadingMsgs(false);
    }
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedConv) return;

    loadMessages(selectedConv._id);

    pollRef.current = setInterval(async () => {
      try {
        const data = await messageAPI.getMessages(selectedConv._id);
        setMessages(data.messages || []);
        loadConversations();
      } catch (err) {
        console.error('Poll error:', err.message);
      }
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [selectedConv?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConv || sending) return;

    const text = messageInput.trim();
    setMessageInput('');
    setSending(true);

    const optimistic = {
      _id:          'temp-' + Date.now(),
      conversation: selectedConv._id,
      sender:       user.id,
      senderName:   user.fullName,
      senderAvatar: user.avatar || '',
      senderRole:   'artist',
      text,
      read:         false,
      createdAt:    new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      await messageAPI.send(selectedConv._id, text);
      const data = await messageAPI.getMessages(selectedConv._id);
      setMessages(data.messages || []);
      loadConversations();
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setMessageInput(text);
      console.error('Send error:', err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConvs = conversations.filter(c =>
    c.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = now - date;
    if (diff < 60000)    return 'Just now';
    if (diff < 3600000)  return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  const AvatarFallback = ({ name, avatar, size = 'w-11 h-11', color = 'from-indigo-500 to-purple-500' }) => {
    const url = getImageUrl(avatar);
    return (
      <div className={`${size} rounded-full overflow-hidden flex-shrink-0`}>
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <div className={`w-full h-full bg-gradient-to-br ${color} ${url ? 'hidden' : 'flex'} items-center justify-center text-white font-bold text-sm`}>
          {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0" style={{ height: '100vh' }}>
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Chat with Buyers"
          subtitle={`${conversations.filter(c => c.sellerUnread > 0).length} unread`}
        />

        <div className="flex-1 flex overflow-hidden">

          {/* ── Conversations List ── */}
          <div className={`${selectedConv ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 bg-white border-r border-gray-100 flex-col flex-shrink-0`}>
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search buyers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">No conversations yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Buyers will appear here when they message you
                  </p>
                </div>
              ) : (
                filteredConvs.map(conv => (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full p-3.5 flex items-start gap-3 hover:bg-gray-50 transition border-b border-gray-50 ${
                      selectedConv?._id === conv._id
                        ? 'bg-indigo-50 border-l-4 border-l-indigo-500'
                        : ''
                    }`}
                  >
                    <AvatarFallback
                      name={conv.buyerName}
                      avatar={conv.buyerAvatar}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {conv.buyerName}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage || 'Start a conversation'}
                      </p>
                      {conv.sellerUnread > 0 && (
                        <div className="flex justify-end mt-0.5">
                          <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {conv.sellerUnread}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Chat Area ── */}
          <div className={`${selectedConv ? 'flex' : 'hidden sm:flex'} flex-1 flex-col bg-gray-50 min-w-0`}>
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">Select a conversation</h3>
                  <p className="text-gray-500 text-sm">
                    Choose a conversation from the left to start chatting
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConv(null)}
                      className="sm:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-xl mr-1"
                    >
                      ←
                    </button>
                    <AvatarFallback
                      name={selectedConv.buyerName}
                      avatar={selectedConv.buyerAvatar}
                      size="w-10 h-10"
                    />
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm">
                        {selectedConv.buyerName}
                      </h2>
                      <p className="text-xs text-gray-500">Buyer</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-400 text-sm">
                        No messages yet. Say hello! 👋
                      </p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.senderRole === 'artist';
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end gap-2 max-w-xs md:max-w-sm ${isMe ? 'flex-row-reverse' : ''}`}>
                            {!isMe && (
                              <AvatarFallback
                                name={msg.senderName}
                                avatar={msg.senderAvatar}
                                size="w-7 h-7"
                                color="from-purple-500 to-blue-500"
                              />
                            )}
                            <div>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isMe
                                  ? 'bg-indigo-600 text-white rounded-br-sm'
                                  : 'bg-white text-gray-900 shadow-sm rounded-bl-sm border border-gray-100'
                              } ${msg._id?.toString().startsWith('temp-') ? 'opacity-70' : ''}`}>
                                {msg.text}
                              </div>
                              <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-gray-400">
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isMe && (
                                  msg.read
                                    ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                    : <Check className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white border-t border-gray-100 p-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageInput.trim() || sending}
                      className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {sending
                        ? <Loader className="w-4 h-4 animate-spin" />
                        : <Send className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithBuyers;