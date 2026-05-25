import React, { useState, useEffect } from 'react';
import {
  Calendar, Award, Users, BookOpen,
  MapPin, Clock, ChevronRight, Ticket,
  Loader, AlertCircle, Sparkles
} from 'lucide-react';
import BuyerSidebar  from './BuyerSidebar';
import BuyerHeader   from './BuyerHeader';
import { eventAPI }  from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const TYPE_CONFIG = {
  event:       { icon: Calendar, color: 'bg-purple-100 text-purple-700', label: 'Event'       },
  competition: { icon: Award,    color: 'bg-amber-100 text-amber-700',   label: 'Competition' },
  workshop:    { icon: Users,    color: 'bg-blue-100 text-blue-700',     label: 'Workshop'    },
  news:        { icon: BookOpen, color: 'bg-green-100 text-green-700',   label: 'News'        },
};

export default function EventsNews() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab,         setTab]         = useState('all');
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await eventAPI.getAll();
        setEvents(data.events || []);
      } catch (err) {
        setError('Failed to load events: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const TABS = [
    { id: 'all',         label: 'All'          },
    { id: 'event',       label: 'Events'       },
    { id: 'workshop',    label: 'Workshops'    },
    { id: 'competition', label: 'Competitions' },
    { id: 'news',        label: 'News'         },
  ];

  const filtered  = tab === 'all' ? events : events.filter(e => e.type === tab);
  const featured  = events.find(e => e.featured);
  const showOthers = filtered.filter(e => !(tab === 'all' && e.featured));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Events & News"
          subtitle="Discover what's happening in the art world"
        />

        <main className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 rounded-2xl p-5 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '25px 25px' }}
            />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-purple-200 text-sm font-semibold">ArtBazaar Community</span>
                </div>
                <h2 className="font-black text-xl text-white mb-1">Events & News</h2>
                <p className="text-purple-200 text-sm">
                  Stay updated with exhibitions, workshops and competitions
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                {[
                  { num: events.filter(e => e.type === 'event').length,       label: 'Events'    },
                  { num: events.filter(e => e.type === 'workshop').length,    label: 'Workshops' },
                ].map(s => (
                  <div key={s.label} className="bg-white/20 border border-white/30 px-4 py-2 rounded-xl text-center">
                    <p className="text-xl font-black text-white">{loading ? '…' : s.num}</p>
                    <p className="text-white/80 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                  tab === t.id
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-center">
                <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Loading events...</p>
              </div>
            </div>

          ) : error ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold">{error}</p>
            </div>

          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No events yet</h3>
              <p className="text-gray-500 text-sm">Check back soon for upcoming events and news</p>
            </div>

          ) : (
            <>
              {/* Featured Card */}
              {tab === 'all' && featured && (() => {
                const cfg  = TYPE_CONFIG[featured.type] || TYPE_CONFIG.event;
                const Icon = cfg.icon;
                const img  = featured.image ? getImageUrl(featured.image) : null;
                return (
                  <div className="relative rounded-2xl overflow-hidden shadow-xl h-56 md:h-72 bg-gradient-to-br from-purple-800 to-indigo-900">
                    {img && (
                      <img
                        src={img}
                        alt={featured.title}
                        className="w-full h-full object-cover opacity-60"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-black rounded-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mb-2 ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" /> {cfg.label}
                      </span>
                      <h2 className="text-xl md:text-2xl font-black mb-1 text-white">{featured.title}</h2>
                      <p className="text-white/80 text-sm mb-3 line-clamp-1">{featured.description}</p>
                      <div className="flex items-center gap-3 text-xs text-white/80 flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.date}</span>
                        {featured.location && (
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{featured.location}</span>
                        )}
                        {featured.price != null && (
                          <span className="flex items-center gap-1">
                            <Ticket className="w-3.5 h-3.5" />
                            {featured.price === 0 ? 'Free' : `PKR ${featured.price.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Grid */}
              {showOthers.length === 0 && tab !== 'all' ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-500">No {tab}s available right now</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {showOthers.map(item => {
                    const cfg  = TYPE_CONFIG[item.type] || TYPE_CONFIG.event;
                    const Icon = cfg.icon;
                    const img  = item.image ? getImageUrl(item.image) : null;

                    return (
                      <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
                        {/* Image */}
                        <div className={`relative overflow-hidden h-40 ${!img ? 'bg-gradient-to-br from-purple-100 to-indigo-100' : 'bg-gray-100'}`}>
                          {img ? (
                            <img
                              src={img}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">
                              {item.type === 'event' ? '🎨' : item.type === 'workshop' ? '✏️' : item.type === 'competition' ? '🏆' : '📰'}
                            </div>
                          )}
                          <span className={`absolute top-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.color}`}>
                            <Icon className="w-3.5 h-3.5" /> {cfg.label}
                          </span>
                          {item.featured && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-black rounded-lg">
                              ⭐ Featured
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-1 leading-snug">{item.title}</h3>
                          <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">{item.description}</p>

                          <div className="space-y-1.5 mb-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                              <span>{item.date}</span>
                            </div>
                            {item.location && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                <span>{item.location}</span>
                              </div>
                            )}
                            {item.attendees > 0 && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Users className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                <span>{item.attendees}{item.capacity ? ` / ${item.capacity}` : ''} attendees</span>
                              </div>
                            )}
                            {item.organizer && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>by {item.organizer}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div>
                              {item.price != null ? (
                                <span className="font-black text-purple-600 text-sm">
                                  {item.price === 0 ? 'Free Entry' : `PKR ${item.price.toLocaleString()}`}
                                </span>
                              ) : item.prize ? (
                                <span className="font-black text-amber-600 text-sm">
                                  🏆 PKR {item.prize.toLocaleString()}
                                </span>
                              ) : item.readTime ? (
                                <span className="text-xs text-gray-400 font-medium">{item.readTime} read</span>
                              ) : null}
                            </div>
                            <button className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition flex items-center gap-1 shadow-md shadow-purple-200">
                              {item.type === 'news' ? 'Read More' : 'Register'}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}