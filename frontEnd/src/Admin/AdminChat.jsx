import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Search, Loader, MessageCircle,
  Shield, Paperclip, X, Check, CheckCheck
} from 'lucide-react';
import AdminSidebar   from './AdminSidebar';
import AdminHeader    from './AdminHeader';
import { messageAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const BASE_URL = 'http://localhost:5000';

const ADMIN_TEMPLATES = [
  { label: '👋 Welcome',          text: 'Hello! Welcome to ArtBazaar Support. How can I help you today?' },
  { label: '✅ Issue Resolved',    text: 'Your issue has been resolved. Please let us know if you need further assistance.' },
  { label: '⏳ Under Review',      text: 'We have received your query and are looking into it. We will get back to you shortly.' },
  { label: '💳 Payment Confirmed', text: 'We have verified your payment. Your order is confirmed and will be processed soon.' },
];

export default function AdminChat() {
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv,  setSelectedConv]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState('');
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [sending,       setSending]       = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);

  const messagesEndRef = useRef(null);
  const pollRef        = useRef(null);
  const fileInputRef   = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await messageAPI.getAdminConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    setLoadingMsgs(true);
    try {
      const data = await messageAPI.getMessages(convId);
      setMessages(data.messages || []);
      loadConversations();
    } catch (err) {
      console.error(err);
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
      } catch {}
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [selectedConv?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !imageFile) || !selectedConv || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');

    const optimistic = {
      _id: 'temp-' + Date.now(),
      senderRole: 'admin', senderName: 'ArtBazaar Support',
      text, image: imageFile ? URL.createObjectURL(imageFile) : '',
      messageType: imageFile ? 'image' : 'text',
      read: false, createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setImagePreview(null);

    try {
      if (imageFile) {
        await messageAPI.sendImage(selectedConv._id, imageFile, 'image', text);
        setImageFile(null);
      } else {
        await messageAPI.send(selectedConv._id, text);
      }
      const data = await messageAPI.getMessages(selectedConv._id);
      setMessages(data.messages || []);
      loadConversations();
    } catch {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter(c =>
    (c.buyerName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (d) => {
    const date = new Date(d), now = new Date(), diff = now - date;
    if (diff < 60000)    return 'Just now';
    if (diff < 3600000)  return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  const Avatar = ({ name, avatar, size = 'w-11 h-11' }) => {
    const url = avatar ? getImageUrl(avatar) : null;
    return (
      <div className={`${size} rounded-full overflow-hidden flex-shrink-0`}>
        {url ? <img src={url} alt={name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
        <div className={`w-full h-full bg-gradient-to-br from-red-500 to-orange-500 ${url ? 'hidden' : 'flex'} items-center justify-center text-white font-black text-sm`}>
          {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>
    );
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.sellerUnread || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0" style={{ height: '100vh' }}>
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Support Chat"
          subtitle={`${totalUnread} unread messages`}
        />

        <div className="flex-1 flex overflow-hidden">

          {/* Conversations */}
          <div className={`${selectedConv ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 bg-white border-r border-gray-100 flex-col flex-shrink-0 shadow-sm`}>
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-500 to-orange-500">
              <h2 className="font-black text-white text-sm mb-3">Support Inbox</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
                <input type="text" placeholder="Search buyers..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/20 border border-white/30 rounded-xl text-sm outline-none text-white placeholder-white/60 focus:bg-white/30 transition" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-6 h-6 text-red-500 animate-spin" />
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-8 h-8 text-red-300" />
                  </div>
                  <p className="text-gray-600 text-sm font-semibold">No support chats yet</p>
                </div>
              ) : filteredConvs.map(conv => (
                <button key={conv._id} onClick={() => setSelectedConv(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-red-50/50 transition-all border-b border-gray-50 ${
                    selectedConv?._id === conv._id ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                  }`}>
                  <Avatar name={conv.buyerName} avatar={conv.buyerAvatar} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-gray-900 text-sm truncate">{conv.buyerName}</span>
                      <span className="text-xs text-gray-400 ml-1 flex-shrink-0">{formatTime(conv.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'New support request'}</p>
                    {conv.sellerUnread > 0 && (
                      <div className="flex justify-end mt-1">
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
                          {conv.sellerUnread}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${selectedConv ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-w-0`}>
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg mb-1">Support Inbox</h3>
                  <p className="text-gray-500 text-sm">Select a conversation to reply</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm flex-shrink-0">
                  <Avatar name={selectedConv.buyerName} avatar={selectedConv.buyerAvatar} size="w-10 h-10" />
                  <div>
                    <h2 className="font-black text-gray-900 text-sm">{selectedConv.buyerName}</h2>
                    <p className="text-xs text-gray-500">Customer Support Chat</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader className="w-6 h-6 text-red-500 animate-spin" />
                    </div>
                  ) : messages.map(msg => {
                    const isMe = msg.senderRole === 'admin';
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-xs md:max-w-md ${isMe ? 'flex-row-reverse' : ''}`}>
                          {!isMe && <Avatar name={msg.senderName} avatar={msg.senderAvatar} size="w-8 h-8" />}
                          <div>
                            <div className={`rounded-2xl overflow-hidden ${
                              isMe
                                ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-br-sm shadow-lg shadow-red-200/50'
                                : 'bg-white text-gray-900 shadow-sm rounded-bl-sm border border-gray-100'
                            }`}>
                              {msg.image && (
                                <img
                                  src={msg.image.startsWith('blob:') ? msg.image : `${BASE_URL}${msg.image}`}
                                  alt="attachment"
                                  className="max-w-full cursor-pointer hover:opacity-90 transition"
                                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                                  onClick={() => window.open(msg.image.startsWith('blob:') ? msg.image : `${BASE_URL}${msg.image}`, '_blank')}
                                />
                              )}
                              {msg.text && <p className="px-4 py-2.5 text-sm leading-relaxed">{msg.text}</p>}
                            </div>
                            <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                              {isMe && (msg.read
                                ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                : <Check className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
                    <div className="relative">
                      <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded-xl" />
                      <button onClick={() => { setImagePreview(null); setImageFile(null); }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Templates */}
                {showTemplates && (
                  <div className="bg-white border-t border-gray-100 px-4 py-3 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quick Replies</p>
                    {ADMIN_TEMPLATES.map((t, i) => (
                      <button key={i} onClick={() => { setInput(t.text); setShowTemplates(false); }}
                        className="w-full text-left px-3 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-xs text-red-700 font-semibold transition border border-red-100">
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="bg-white border-t border-gray-100 p-3 flex-shrink-0 shadow-lg">
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*"
                      onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }}
                      className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button onClick={() => setShowTemplates(!showTemplates)}
                      className={`p-2.5 rounded-xl transition ${showTemplates ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}>
                      <Shield className="w-5 h-5" />
                    </button>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Reply to customer..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition" />
                    <button onClick={handleSend} disabled={(!input.trim() && !imageFile) || sending}
                      className="p-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition disabled:opacity-40 shadow-md shadow-red-200">
                      {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
}