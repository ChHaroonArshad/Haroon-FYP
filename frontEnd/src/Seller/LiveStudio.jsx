import React, { useState, useRef, useEffect } from 'react';
import {
  Play, StopCircle, Mic, MicOff, Camera, CameraOff,
  Users, Send, Share2, Monitor, Clock, Eye, Plus, X
} from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';

const LiveStudio = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLive, setIsLive]           = useState(false);
  const [micOn, setMicOn]             = useState(true);
  const [camOn, setCamOn]             = useState(true);
  const [viewers, setViewers]         = useState(0);
  const [chatInput, setChatInput]     = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [liveMessages, setLiveMessages] = useState([
    { id:1, user:'Ahmed Hassan', text:'🎨 So beautiful! Love watching the process.',  time:'2m' },
    { id:2, user:'Sara Ahmed',   text:'What brush are you using for those details?',   time:'3m' },
    { id:3, user:'Ali Raza',     text:'Can you do a custom piece like this for me?',   time:'4m' },
    { id:4, user:'Bilal Malik',  text:'💜 Amazing colours!',                           time:'5m' },
  ]);

  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [liveMessages]);

  const pastSessions = [
    { id:1, title:'Landscape Painting — Hunza Valley', date:'Dec 10', viewers:312, duration:'1h 24m', img:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400' },
    { id:2, title:'Oil Painting Basics for Beginners',  date:'Dec 6',  viewers:198, duration:'52m',    img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
    { id:3, title:'Abstract Art Live — Q&A Session',    date:'Nov 30', viewers:145, duration:'38m',    img:'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400' },
  ];

  const scheduled = [
    { title:'Winter Mountains Painting',  date:'Dec 16, 2024 · 6:00 PM', desc:'Oil painting session — Skardu landscapes' },
    { title:'Watercolor Workshop',        date:'Dec 18, 2024 · 5:00 PM', desc:'Techniques for soft watercolor backgrounds' },
  ];

  const startSession = () => {
    if (!sessionTitle.trim()) return;
    setIsLive(true);
    setViewers(Math.floor(Math.random() * 40) + 8);
    const interval = setInterval(() => setViewers(v => v + (Math.random() > 0.5 ? 1 : 0)), 4000);
    return () => clearInterval(interval);
  };

  const endSession = () => {
    if (window.confirm('End the live session?')) {
      setIsLive(false);
      setViewers(0);
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setLiveMessages(prev => [...prev, { id: prev.length + 1, user:'You (Artist)', text: chatInput.trim(), time:'now' }]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Live Studio"
          subtitle={isLive ? `🔴 Live · ${viewers} watching` : 'Stream your creative process'} />

        <main className="p-4 md:p-6 space-y-5">

          {!isLive ? (
            <>
              {/* Start Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Preview area */}
                  <div className="flex-1 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl aspect-video flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="w-12 h-12 opacity-30 mx-auto mb-3" />
                      <p className="font-semibold opacity-60">Camera preview</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="lg:w-64 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Session Title *</label>
                        <input value={sessionTitle} onChange={e => setSessionTitle(e.target.value)}
                          placeholder="e.g. Landscape Painting Live"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                        <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none">
                          <option>Landscape Painting</option>
                          <option>Abstract Art</option>
                          <option>Watercolor</option>
                          <option>Charcoal Drawing</option>
                          <option>Digital Art</option>
                        </select>
                      </div>
                      {/* Camera / Mic toggles */}
                      <div className="flex gap-2">
                        <button onClick={() => setCamOn(!camOn)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${camOn ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-600'}`}>
                          {camOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                          {camOn ? 'Cam On' : 'Cam Off'}
                        </button>
                        <button onClick={() => setMicOn(!micOn)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${micOn ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-600'}`}>
                          {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                          {micOn ? 'Mic On' : 'Mic Off'}
                        </button>
                      </div>
                    </div>

                    <button onClick={startSession} disabled={!sessionTitle.trim()}
                      className="w-full py-3 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Play className="w-5 h-5" /> Go Live
                    </button>
                  </div>
                </div>
              </div>

              {/* Scheduled */}
              {scheduled.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-gray-900 mb-4">Scheduled Sessions</h2>
                  <div className="space-y-3">
                    {scheduled.map((s, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Clock className="w-3 h-3" /> {s.date}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                        </div>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex-shrink-0">
                          Start Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Sessions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4">Past Sessions</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastSessions.map(s => (
                    <div key={s.id} className="group cursor-pointer">
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                        <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Play className="w-10 h-10 text-white" />
                        </div>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded-lg font-mono">{s.duration}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm truncate">{s.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{s.viewers}</span>
                        <span>{s.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ── LIVE VIEW ── */
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Video + Controls */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 opacity-20 mx-auto mb-3" />
                    <p className="opacity-50 font-semibold">Live stream preview</p>
                  </div>

                  {/* LIVE badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-xl font-black text-sm shadow-lg">
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>

                  {/* Viewer count */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 text-white px-3 py-1.5 rounded-xl text-sm font-semibold">
                    <Users className="w-4 h-4" /> {viewers}
                  </div>

                  {/* Session title */}
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
                    {sessionTitle}
                  </div>
                </div>

                {/* Controls bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      {[
                        { icon: camOn  ? Camera  : CameraOff, on: camOn,  toggle: () => setCamOn(!camOn)  },
                        { icon: micOn  ? Mic     : MicOff,    on: micOn,  toggle: () => setMicOn(!micOn)  },
                        { icon: Monitor,  on: true, toggle: () => {} },
                        { icon: Share2,   on: true, toggle: () => {} },
                      ].map(({ icon: Icon, on, toggle }, i) => (
                        <button key={i} onClick={toggle}
                          className={`p-2.5 rounded-xl transition ${on ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-100 text-red-600'}`}>
                          <Icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                    <button onClick={endSession}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition shadow-lg shadow-red-200">
                      <StopCircle className="w-4 h-4" /> End Session
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Chat */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[500px] lg:h-auto">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Live Chat</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{viewers} watching</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {liveMessages.map(msg => (
                    <div key={msg.id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {msg.user.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-indigo-600">{msg.user} <span className="text-gray-400 font-normal">{msg.time}</span></p>
                        <p className="text-sm text-gray-700">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && sendChat()}
                      placeholder="Reply to viewers..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-400" />
                    <button onClick={sendChat} disabled={!chatInput.trim()}
                      className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-40">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LiveStudio;