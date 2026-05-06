import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Palette, Users, Award, ChevronRight,
  Star, Play, MessageCircle, Package, Shield,
  ArrowRight, Loader, TrendingUp, Sparkles
} from 'lucide-react';
import Navbar  from './Navbar';
import Footer  from './Footer';
import { artworkAPI, adminAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const HERO_SLIDES = [
  {
    title:    "Discover Pakistan's Finest Art",
    subtitle: "Connect directly with talented local artists across the country",
    bg:       'from-violet-900 via-purple-800 to-indigo-900',
  },
  {
    title:    "Commission Custom Artwork",
    subtitle: "Request personalized pieces made just for you by top artists",
    bg:       'from-rose-900 via-pink-800 to-orange-900',
  },
  {
    title:    "Join Live Art Sessions",
    subtitle: "Watch artists create in real-time and interact with them",
    bg:       'from-emerald-900 via-teal-800 to-cyan-900',
  },
];

const FEATURES = [
  { icon: Shield,        title: 'Secure Transactions', desc: 'Safe peer-to-peer payments with admin verification and fraud protection'         },
  { icon: MessageCircle, title: 'Direct Chat',          desc: 'Communicate directly with artists for custom orders and commissions'             },
  { icon: Package,       title: 'Delivery Tracking',    desc: "Track your artwork from the artist's studio to your doorstep"                   },
  { icon: Play,          title: 'Live Sessions',        desc: 'Watch artists create in real-time and request custom work live'                  },
];

export default function HomePage() {
  const [slide,    setSlide]    = useState(0);
  const [artworks, setArtworks] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [artists,  setArtists]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [artData, statsData, artistData] = await Promise.all([
          artworkAPI.getAll({ limit: 4, sortBy: 'popular', showSold: false }),

          adminAPI.getStats().catch(() => ({ stats: null })),
          
          artworkAPI.getAll({ limit: 12, showSold: false }),
        ]);

        setArtworks(artData.artworks || []);
        setStats(statsData.stats);

        // Build unique artists from artworks
        const seen    = new Set();
        const unique  = [];
        for (const a of (artistData.artworks || [])) {
          const id = a.artist?._id || a.artist;
          if (id && !seen.has(id.toString())) {
            seen.add(id.toString());
            unique.push({
              _id:      id,
              name:     a.artistName,
              avatar:   a.artist?.avatar || '',
              city:     a.artist?.city || 'Pakistan',
              specialty:a.artist?.specialty || a.category,
              rating:   a.rating,
              sales:    a.sales || 0,
            });
          }
          if (unique.length >= 3) break;
        }
        setArtists(unique);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { icon: Users,       num: stats ? `${stats.totalArtists}+`  : '…', label: 'Artists'  },
    { icon: Palette,     num: stats ? `${stats.totalArtworks}+` : '…', label: 'Artworks' },
    { icon: ShoppingBag, num: stats ? `${stats.totalOrders}+`   : '…', label: 'Sales'    },
    { icon: Award,       num: '4.8/5',                                  label: 'Rating'   },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${HERO_SLIDES[slide].bg} transition-all duration-1000`} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Pakistan's #1 Art Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 leading-tight">
            {HERO_SLIDES[slide].title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {HERO_SLIDES[slide].subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/artworks">
              <button className="w-full sm:w-auto px-7 py-3.5 bg-white text-purple-700 rounded-2xl font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2 shadow-xl">
                Browse Artworks <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
            <Link to="/signup">
              <button className="w-full sm:w-auto px-7 py-3.5 bg-white/15 backdrop-blur-sm text-white rounded-2xl font-bold hover:bg-white/25 transition border border-white/30">
                Join as Artist
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {[0,1,2].map(i => (
            <button key={i} onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${slide === i ? 'bg-white w-8' : 'bg-white/40 w-2'}`}
            />
          ))}
        </div>
      </section>

      {/* Stats — real data */}
      <section className="py-12 md:py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {statCards.map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                {loading ? <Loader className="w-5 h-5 animate-spin mx-auto text-purple-400" /> : s.num}
              </div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Artworks — real data */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">Curated Collection</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Featured Artworks</h2>
            </div>
            <Link to="/artworks" className="flex items-center gap-1.5 text-purple-600 font-semibold text-sm hover:gap-3 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Palette className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No artworks yet — check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {artworks.map(art => (
                <Link to={`/login`} key={art._id}>
                  <div className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-2xl mb-3 aspect-square bg-gray-100">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 px-5 py-2 bg-white text-purple-700 rounded-xl font-semibold text-sm shadow-xl translate-y-2 group-hover:translate-y-0">
                          View Details
                        </button>
                      </div>
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-purple-700 text-xs font-semibold rounded-lg">
                        {art.category}
                      </span>
                      {art.isFeatured && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-0.5 truncate">{art.title}</h3>
                    <p className="text-gray-500 text-sm mb-1">by {art.artistName}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-purple-600 font-bold">PKR {art.price?.toLocaleString()}</p>
                      {art.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-gray-700">{art.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why ArtBazaar */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">Why Us</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Why Choose ArtBazaar?</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Pakistan's first dedicated art commerce platform built for local artists and buyers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white p-6 md:p-7 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-600 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300">
                  <f.icon className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Artists — real data */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">Community</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Top Artists</h2>
            </div>
            <Link to="/artists" className="flex items-center gap-1.5 text-purple-600 font-semibold text-sm hover:gap-3 transition-all">
              Meet all artists <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No artists yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
              {artists.map((a, i) => (
                <Link to="/login" key={a._id}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <div className="relative inline-block mb-4">
                      {a.avatar ? (
                        <img
                          src={getImageUrl(a.avatar)}
                          alt={a.name}
                          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover mx-auto ring-4 ring-purple-100 group-hover:ring-purple-300 transition-all"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 items-center justify-center text-white font-black text-3xl mx-auto ring-4 ring-purple-100 ${a.avatar ? 'hidden' : 'flex'}`}
                      >
                        {a.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-400 w-5 h-5 rounded-full border-2 border-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{a.name}</h3>
                    <p className="text-purple-600 font-medium text-sm mb-3">{a.specialty || 'Artist'}</p>
                    <div className="flex justify-center items-center gap-4 text-sm text-gray-500 mb-5">
                      <span>{a.sales} Sales</span>
                      {a.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {a.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <button className="w-full py-2.5 border-2 border-purple-200 text-purple-600 rounded-xl font-semibold text-sm hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all">
                      View Profile
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600">Three simple steps to start your art journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { n: '01', title: 'Browse & Discover',  desc: 'Explore thousands of unique artworks from talented Pakistani artists across all styles'   },
              { n: '02', title: 'Connect & Purchase', desc: 'Chat directly with artists, negotiate prices, request custom orders, and pay securely'     },
              { n: '03', title: 'Track & Receive',    desc: "Monitor your delivery in real-time from the artist's studio to your doorstep"              },
            ].map(s => (
              <div key={s.n} className="bg-white rounded-2xl p-7 md:p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                <div className="text-6xl font-black text-purple-100 mb-3 leading-none">{s.n}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-700 via-purple-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Ready to Start Your Art Journey?
          </h2>
          <p className="text-lg text-white/80 mb-8">Join thousands of art enthusiasts and creators today</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-purple-700 rounded-2xl font-bold hover:bg-gray-100 transition shadow-xl">
                Sign Up as Buyer
              </button>
            </Link>
            <Link to="/signup">
              <button className="w-full sm:w-auto px-8 py-4 bg-white/15 backdrop-blur-sm text-white rounded-2xl font-bold hover:bg-white/25 transition border border-white/30">
                Join as Artist
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}