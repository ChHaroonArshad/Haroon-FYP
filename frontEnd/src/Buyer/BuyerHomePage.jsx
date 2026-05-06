import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Star, ChevronRight, Sparkles,
  Play, ArrowRight, ShoppingBag, Palette,
  Users, Award, Heart, Loader, Eye, Package
} from 'lucide-react';
import BuyerSidebar   from './BuyerSidebar';
import BuyerHeader    from './BuyerHeader';
import { artworkAPI, orderAPI, wishlistAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES = [
  { name: 'Landscapes',  icon: '🏔️', cat: 'Landscape'   },
  { name: 'Abstract',    icon: '🎨', cat: 'Abstract'     },
  { name: 'Portraits',   icon: '👤', cat: 'Portraits'    },
  { name: 'Traditional', icon: '🕌', cat: 'Traditional'  },
  { name: 'Modern',      icon: '✨', cat: 'Modern'       },
  { name: 'Calligraphy', icon: '✍️', cat: 'Calligraphy'  },
];

export default function BuyerHomePage() {
  const navigate    = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [artworks,    setArtworks]    = useState([]);
  const [orders,      setOrders]      = useState([]);
  const [favorites,   setFavorites]   = useState([]);
  const [togglingId,  setTogglingId]  = useState(null);
  const [loading,     setLoading]     = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [artData, wishData] = await Promise.all([
          artworkAPI.getAll({ limit: 6, sortBy: 'popular', showSold: false }),
          wishlistAPI.get().catch(() => ({ wishlist: [] })),
        ]);
        setArtworks(artData.artworks || []);
        setFavorites((wishData.wishlist || []).map(a => (a._id || a).toString()));

        const token = localStorage.getItem('token');
        if (token) {
          orderAPI.getMyOrders().then(d => setOrders(d.orders || [])).catch(() => {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId === id) return;
    setTogglingId(id);
    try {
      const data = await wishlistAPI.toggle(id);
      setFavorites((data.wishlist || []).map(a => (a._id || a).toString()));
    } catch (err) {}
    finally { setTogglingId(null); }
  };

  // Real stats
  const heroStats = [
    { icon: ShoppingBag, num: orders.length,                                    label: 'Orders'    },
    { icon: Heart,       num: favorites.length,                                  label: 'Favorites' },
    { icon: Package,     num: orders.filter(o => o.status === 'delivered').length, label: 'Delivered' },
    { icon: Award,       num: artworks.length > 0
        ? (artworks.filter(a => a.rating > 0).reduce((s, a) => s + a.rating, 0) /
           Math.max(1, artworks.filter(a => a.rating > 0).length)).toFixed(1)
        : '—',
      label: 'Avg Rating',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Home"
          subtitle="Discover amazing artworks"
          searchPlaceholder="Search artworks, artists..."
          onSearchChange={e => {
            if (e.target.value) navigate(`/buyer/search?q=${encodeURIComponent(e.target.value)}`);
          }}
        />

        <main className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">

          {/* Welcome Hero */}
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
            />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black mb-1 text-white">
                  Welcome back, {user.fullName?.split(' ')[0] || 'Explorer'}! 👋
                </h1>
                <p className="text-purple-200 mb-5 text-sm">
                  Discover amazing artworks from talented Pakistani artists
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/buyer/browse">
                    <button className="bg-white text-purple-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-50 transition flex items-center gap-2 shadow-lg">
                      <Sparkles className="w-4 h-4" /> Browse Artworks
                    </button>
                  </Link>
                  <Link to="/buyer/orders">
                    <button className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/30 transition border border-white/30">
                      My Orders
                    </button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 flex-shrink-0 w-full md:w-auto">
                {loading ? (
                  <div className="col-span-2 flex items-center justify-center py-4">
                    <Loader className="w-6 h-6 text-white animate-spin" />
                  </div>
                ) : heroStats.map((s, i) => (
                  <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/20">
                    <p className="text-xl font-black text-white">{s.num}</p>
                    <p className="text-purple-200 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Browse by Category</h2>
              <Link to="/buyer/browse" className="text-purple-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {CATEGORIES.map((cat, i) => (
                <Link to={`/buyer/browse`} key={i}>
                  <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm hover:shadow-md transition text-center group cursor-pointer border border-gray-100 hover:border-purple-200 hover:-translate-y-1">
                    <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform duration-200">
                      {cat.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 text-xs mb-0.5 truncate">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Live Sessions placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-lg font-bold text-gray-900">Live Sessions</h2>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: 'Watercolor Landscape', artist: 'Ayesha Khan',  viewers: 234, live: true,  initials: 'AK', from: 'from-purple-500', to: 'to-pink-500' },
                { title: 'Abstract Techniques',  artist: 'Hassan Ali',   viewers: 189, live: false, initials: 'HA', from: 'from-blue-500',   to: 'to-indigo-500' },
              ].map((s, i) => (
                <div key={i} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${s.from} ${s.to} p-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all`}>
                  {s.live && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white font-black text-lg flex-shrink-0 border-2 border-white/50">
                      {s.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">{s.title}</h3>
                      <p className="text-white/80 text-xs">by {s.artist}</p>
                      <p className="text-white/70 text-xs mt-0.5">{s.viewers} watching</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Artworks — REAL DATA */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" /> Trending Artworks
              </h2>
              <Link to="/buyer/browse" className="text-purple-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : artworks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Palette className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">No artworks yet</p>
                <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {artworks.map(art => {
                  const isFav = favorites.includes(art._id?.toString());
                  return (
                    <Link to={`/buyer/artwork/${art._id}`} key={art._id}>
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={getImageUrl(art.image)}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                          {art.isFeatured && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1 z-10">
                              <Sparkles className="w-3 h-3" /> Featured
                            </span>
                          )}
                          <button
                            onClick={e => toggleFavorite(art._id, e)}
                            disabled={togglingId === art._id}
                            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110 disabled:opacity-50"
                          >
                            {togglingId === art._id
                              ? <Loader className="w-4 h-4 text-purple-500 animate-spin" />
                              : <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            }
                          </button>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-lg z-10">
                            {art.category}
                          </span>
                        </div>
                        <div className="p-3">
                          <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{art.title}</h3>
                          <p className="text-gray-500 text-xs mb-2">by {art.artistName}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-purple-600 font-black text-sm">
                              PKR {art.price?.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-bold text-gray-700">
                                {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                              </span>
                              {art.sales > 0 && (
                                <span className="text-xs text-gray-400">({art.sales})</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-2xl p-6 text-white text-center shadow-xl shadow-pink-200/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
            <div className="relative">
              <h2 className="text-xl font-black mb-2 text-white">Support Pakistani Artists 🇵🇰</h2>
              <p className="text-pink-100 text-sm mb-4">
                Every purchase directly supports local artists and their families
              </p>
              <Link to="/buyer/browse">
                <button className="bg-white text-purple-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-50 transition inline-flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4" /> Explore All Artworks
                </button>
              </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}