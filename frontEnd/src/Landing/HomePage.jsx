import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Palette, Users, Award, ChevronRight,
  Star, Play, MessageCircle, Package, Shield,
  ArrowRight, Loader, TrendingUp, Sparkles
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { artworkAPI, adminAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const HERO_SLIDES = [
  {
    title: "Discover Pakistan's Finest Art",
    subtitle: "Connect directly with talented local artists across the country",
    bg: 'from-violet-900 via-purple-800 to-indigo-900',
  },
  {
    title: "Commission Custom Artwork",
    subtitle: "Request personalized pieces made just for you by top artists",
    bg: 'from-rose-900 via-pink-800 to-orange-900',
  },
  {
    title: "Join Live Art Sessions",
    subtitle: "Watch artists create in real-time and interact with them",
    bg: 'from-emerald-900 via-teal-800 to-cyan-900',
  },
];

const FEATURES = [
  { icon: Shield, title: 'Secure Transactions', desc: 'Safe peer-to-peer payments with admin verification and fraud protection' },
  { icon: MessageCircle, title: 'Direct Chat', desc: 'Communicate directly with artists for custom orders and commissions' },
  { icon: Package, title: 'Delivery Tracking', desc: "Track your artwork from the artist's studio to your doorstep" },
  { icon: Play, title: 'Live Sessions', desc: 'Watch artists create in real-time and request custom work live' },
];

// --- Framer Motion Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.2, duration: 0.8 } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.3, duration: 0.8 } }
};

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [artworks, setArtworks] = useState([]);
  const [stats, setStats] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % 3), 6000);
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

        const seen = new Set();
        const unique = [];
        for (const a of (artistData.artworks || [])) {
          const id = a.artist?._id || a.artist;
          if (id && !seen.has(id.toString())) {
            seen.add(id.toString());
            unique.push({
              _id: id,
              name: a.artistName,
              avatar: a.artist?.avatar || '',
              city: a.artist?.city || 'Pakistan',
              specialty: a.artist?.specialty || a.category,
              rating: a.rating,
              sales: a.sales || 0,
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
    { icon: Users, num: stats ? `${stats.totalArtists}+` : '…', label: 'Artists' },
    { icon: Palette, num: stats ? `${stats.totalArtworks}+` : '…', label: 'Artworks' },
    { icon: ShoppingBag, num: stats ? `${stats.totalOrders}+` : '…', label: 'Sales' },
    { icon: Award, num: '4.8/5', label: 'Rating' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className={`absolute inset-0 bg-gradient-to-br ${HERO_SLIDES[slide].bg}`}
          />
        </AnimatePresence>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"
          />
        </div>

        <div className="relative z-10 text-center px-4 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide}`}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Pakistan's #1 Art Marketplace
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 leading-tight tracking-tight">
                {HERO_SLIDES[slide].title}
              </motion.h1>
              <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                {HERO_SLIDES[slide].subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/artworks">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 bg-white text-purple-700 rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                  >
                    Browse Artworks <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }} whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold transition border border-white/30"
                  >
                    Join as Artist
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {[0, 1, 2].map(i => (
            <button key={i} onClick={() => setSlide(i)} className="h-2 flex items-center">
              <motion.div
                animate={{ width: slide === i ? 32 : 8, backgroundColor: slide === i ? "#ffffff" : "rgba(255,255,255,0.4)" }}
                className="h-full rounded-full"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
          className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {statCards.map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="text-center group">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600 transition-colors duration-500">
                <s.icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
                {loading ? <Loader className="w-6 h-6 animate-spin mx-auto text-purple-400" /> : s.num}
              </div>
              <div className="text-gray-500 font-medium tracking-wide text-sm uppercase">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Artworks */}
      <section className="py-20 md:py-28 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <p className="text-purple-600 font-bold text-sm mb-2 uppercase tracking-widest">Curated Collection</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Featured Artworks</h2>
            </div>
            <Link to="/artworks" className="flex items-center gap-1.5 text-purple-600 font-bold text-sm hover:gap-3 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

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
            <motion.div
              variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {artworks.map(art => (
                <Link to={`/login`} key={art._id}>
                  <motion.div variants={scaleUp} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-2xl mb-4 aspect-square bg-gray-100 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                      <motion.img
                        whileHover={{ scale: 1.1 }} transition={{ duration: 0.6, ease: "easeOut" }}
                        src={getImageUrl(art.image)} alt={art.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                        <span className="px-6 py-2.5 bg-white/90 backdrop-blur-md text-purple-900 rounded-xl font-bold text-sm shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          View Details
                        </span>
                      </div>
                      <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-md text-purple-800 text-xs font-bold rounded-lg shadow-sm">
                        {art.category}
                      </span>
                      {art.isFeatured && (
                        <span className="absolute top-4 right-4 px-2.5 py-1.5 bg-amber-400/90 backdrop-blur-md text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{art.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">by <span className="font-medium text-gray-700">{art.artistName}</span></p>
                    <div className="flex items-center justify-between">
                      <p className="text-purple-600 font-black tracking-tight">PKR {art.price?.toLocaleString()}</p>
                      {art.rating > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-bold text-yellow-700">{art.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Why ArtBazaar */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-purple-600 font-bold text-sm mb-2 uppercase tracking-widest">Why Us</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Why Choose ArtBazaar?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Pakistan's first dedicated art commerce platform built exclusively for local artists and art enthusiasts.</p>
          </motion.div>
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -8 }} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-shadow duration-300 border border-gray-100 group">
                <div className="w-14 h-14 bg-purple-50 group-hover:bg-purple-600 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500">
                  <f.icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, type: "spring" }}
          className="w-full max-w-7xl mx-auto text-center px-4 relative z-10"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Ready to Start Your Art Journey?
          </h2>
          <p className="text-xl text-white/80 mb-10 font-medium">Join thousands of art enthusiasts and creators today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto px-10 py-4 bg-white text-purple-700 rounded-2xl font-black text-lg hover:bg-gray-50 transition shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                Sign Up as Buyer
              </motion.button>
            </Link>
            <Link to="/signup">
              <motion.button whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black text-lg transition border border-white/30">
                Join as Artist
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}