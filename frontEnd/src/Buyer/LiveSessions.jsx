import React, { useState, useRef, useEffect } from 'react';
import { Play, Users, Send, Volume2, VolumeX, Heart, Gift, Star, Radio, Clock, ChevronRight } from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';

const LiveSessions = () => {
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [message, setMessage]             = useState('');
  const [isMuted, setIsMuted]             = useState(false);
  const [chatMessages, setChatMessages]   = useState([
    { id:1, user:'Ahmed H.',  text:'Amazing technique! 🎨',      time:'just now', self:false },
    { id:2, user:'Sara K.',   text:'Love this painting!',          time:'1 min ago', self:false },
    { id:3, user:'You',       text:'How do you blend the colors?', time:'2 min ago', self:true  },
    { id:4, user:'Bilal M.',  text:'Masterpiece in progress 🔥',  time:'3 min ago', self:false },
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chatMessages]);

  const liveSessions = [
    { id:1, artist:'Ayesha Khan',  title:'Watercolor Landscape Techniques', viewers:234, thumbnail:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', preview:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', live:true,  duration:'45 min', rating:4.9 },
    { id:2, artist:'Hassan Ali',   title:'Abstract Painting Live Session',   viewers:189, thumbnail:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', preview:'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', live:true,  duration:'28 min', rating:4.8 },
  ];

  const upcomingSessions = [
    { id:3, artist:'Fatima Noor', title:'Traditional Calligraphy Workshop', thumbnail:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', time:'Tomorrow 3:00 PM', reminded:false },
    { id:4, artist:'Ali Raza',    title:'Oil Painting Masterclass',         thumbnail:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', time:'Sat 5:00 PM',     reminded:false },
    { id:5, artist:'Sara Ahmed',  title:'Landscape Sketching Basics',       thumbnail:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', time:'Sun 2:00 PM',     reminded:false },
  ];

  const sendMessage = () => {
    if (!message.trim()) return;
    setChatMessages(prev => [...prev, { id: prev.length + 1, user: 'You', text: message.trim(), time: 'just now', self: true }]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader onMenuClick={() => setSidebarOpen(true)} title="Live Sessions" subtitle="Watch artists create in real time" />

        <main className="p-4 md:p-6 space-y-6">
          {selectedSession ? (
            /* ── Viewer Mode ── */
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                {/* Video */}
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-xl">
                  <img src={selectedSession.preview} alt="" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  {/* HUD */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full" />LIVE
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 bg-black/50 text-white text-xs rounded-full">
                      <Users className="w-3 h-3" />{selectedSession.viewers}
                    </span>
                  </div>
                  <button onClick={() => setIsMuted(!isMuted)}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
                {/* Session info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={selectedSession.thumbnail} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h2 className="font-bold text-gray-900 text-sm">{selectedSession.title}</h2>
                        <p className="text-xs text-gray-500">by {selectedSession.artist}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition">
                        <Heart className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 border border-gray-200 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition">
                        <Gift className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => setSelectedSession(null)}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:border-purple-300 hover:text-purple-600 transition">
                        Leave
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Chat */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-96 lg:h-auto">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">Live Chat</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex gap-2 ${msg.self ? 'flex-row-reverse' : ''}`}>
                      <div className={`px-3 py-1.5 rounded-2xl text-xs max-w-xs ${msg.self ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        {!msg.self && <p className="font-bold text-xs mb-0.5 text-purple-600">{msg.user}</p>}
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()}
                      placeholder="Send a message..." className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-400" />
                    <button onClick={sendMessage} disabled={!message.trim()}
                      className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-40">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Browse Mode ── */
            <>
              {/* Live Now */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="font-bold text-gray-900">Live Now</h2>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg">{liveSessions.length} streams</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {liveSessions.map(s => (
                    <div key={s.id} onClick={() => setSelectedSession(s)}
                      className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group hover:shadow-2xl transition-all">
                      <img src={s.preview} alt={s.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                          <span className="w-1.5 h-1.5 bg-white rounded-full" />LIVE
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full text-white text-xs">
                        <Users className="w-3 h-3" />{s.viewers}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <img src={s.thumbnail} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                          <div>
                            <p className="font-bold text-sm">{s.title}</p>
                            <p className="text-white/70 text-xs">by {s.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/70">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration}</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{s.rating}</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-purple-600" />Upcoming Sessions
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upcomingSessions.map(s => (
                    <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
                      <img src={s.thumbnail} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{s.title}</h3>
                        <p className="text-xs text-gray-500">by {s.artist}</p>
                        <div className="flex items-center gap-1 text-xs text-purple-600 mt-0.5">
                          <Clock className="w-3 h-3" />{s.time}
                        </div>
                      </div>
                      <button className="flex-shrink-0 px-3 py-1.5 border border-purple-200 text-purple-600 rounded-xl text-xs font-semibold hover:bg-purple-600 hover:text-white transition">
                        Remind
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default LiveSessions;