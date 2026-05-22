import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Heart, Eye, Star, SlidersHorizontal,
  Grid, List, X, Loader, AlertCircle, Sparkles
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES = ['All', 'Abstract', 'Landscape', 'Portrait', 'Traditional', 'Modern', 'Calligraphy', 'Portraits'];

// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const popUp = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } }
};

export default function BrowseArtworksPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(100000);
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState({});
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { showSold: true, limit: 50 };
      if (category !== 'All') params.category = category;
      if (search.trim()) params.search = search;
      if (priceRange < 100000) params.maxPrice = priceRange;
      const sortMap = {
        'price-low': 'price-low', 'price-high': 'price-high',
        'popular': 'popular', 'rating': 'rating',
      };
      if (sortMap[sortBy]) params.sortBy = sortMap[sortBy];

      const data = await artworkAPI.getAll(params);
      setArtworks(data.artworks || []);
    } catch (err) {
      setError('Failed to load artworks.');
    } finally {
      setLoading(false);
    }
  }, [category, search, priceRange, sortBy]);

  useEffect(() => {
    const t = setTimeout(fetchArtworks, 300);
    return () => clearTimeout(t);
  }, [fetchArtworks]);

  const toggleLike = id => setLiked(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Animated Hero */}
      <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 pt-28 pb-16 px-4 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, type: "spring" }}
            className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight"
          >
            Browse Artworks
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="text-white/80 text-lg mb-8 max-w-2xl"
          >
            Discover unique pieces from talented Pakistani artists.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring" }}
            className="relative max-w-2xl group"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search artworks, artists, styles..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-sm focus:ring-4 focus:ring-purple-400/30 focus:outline-none bg-white shadow-2xl transition-all"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-100 transition"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </motion.button>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {CATEGORIES.map(c => (
                <button
                  key={c} onClick={() => setCategory(c)}
                  className="relative px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors"
                >
                  {category === c && (
                    <motion.div layoutId="activeCategory" className="absolute inset-0 bg-purple-600 rounded-xl shadow-md" />
                  )}
                  <span className={`relative z-10 ${category === c ? 'text-white' : 'text-gray-600 hover:text-purple-600'}`}>
                    {c}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-purple-400 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <div className="flex bg-gray-50 rounded-xl p-1">
              {['grid', 'list'].map((mode) => (
                <button
                  key={mode} onClick={() => setViewMode(mode)}
                  className={`relative p-2 rounded-lg transition-colors ${viewMode === mode ? 'text-white' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  {viewMode === mode && <motion.div layoutId="viewMode" className="absolute inset-0 bg-purple-600 rounded-lg shadow-sm" />}
                  <span className="relative z-10">
                    {mode === 'grid' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader className="w-12 h-12 text-purple-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">{error}</p>
          </div>
        ) : artworks.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No artworks found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={() => { setSearch(''); setCategory('All'); setPriceRange(100000); }} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg">
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout // This enables smooth repositioning when changing from Grid to List
            variants={staggerContainer} initial="hidden" animate="show"
            className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "flex flex-col gap-4"}
          >
            <AnimatePresence>
              {artworks.map(art => {
                const isSold = !art.isAvailable;
                return (
                  <motion.div
                    layout
                    variants={popUp}
                    initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.8 }}
                    key={art._id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-300 border border-gray-100 group ${isSold ? 'opacity-75 grayscale-[50%]' : ''} ${viewMode === 'list' ? 'flex' : ''}`}
                  >
                    <Link to="/login" className={viewMode === 'list' ? 'flex w-full' : ''}>
                      <div className={`relative overflow-hidden bg-gray-100 ${viewMode === 'grid' ? 'aspect-square' : 'w-48 flex-shrink-0'}`}>
                        <motion.img
                          whileHover={{ scale: 1.1 }} transition={{ duration: 0.6 }}
                          src={getImageUrl(art.image)} alt={art.title}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        {isSold && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="px-4 py-1.5 bg-red-600 text-white text-xs font-black tracking-widest rounded-full shadow-lg">SOLD OUT</span>
                          </div>
                        )}
                        {art.isFeatured && !isSold && (
                          <span className="absolute top-3 left-3 px-3 py-1 bg-amber-400/90 backdrop-blur-sm text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        )}
                        {!isSold && (
                          <button
                            onClick={e => { e.preventDefault(); toggleLike(art._id); }}
                            className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md transition-all ${liked[art._id] ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/90 text-gray-400 hover:text-red-500 hover:scale-110'}`}
                          >
                            <Heart className={`w-4 h-4 ${liked[art._id] ? 'fill-current' : ''}`} />
                          </button>
                        )}
                      </div>

                      <div className={`p-5 flex flex-col justify-between flex-grow ${viewMode === 'list' ? 'justify-center' : ''}`}>
                        <div>
                          <h3 className="font-black text-gray-900 text-lg mb-1 truncate">{art.title}</h3>
                          <p className="text-gray-500 text-sm mb-3 font-medium">by <span className="text-gray-700">{art.artistName}</span></p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                          <span className={`font-black text-lg tracking-tight ${isSold ? 'text-gray-400 line-through' : 'text-purple-600'}`}>
                            PKR {art.price?.toLocaleString()}
                          </span>
                          {art.rating > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                              <span className="text-xs font-bold text-yellow-700">{art.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Animated Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-purple-600" /> Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 flex-grow overflow-y-auto space-y-8">
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest">Maximum Price</h4>
                  <input
                    type="range" min="0" max="100000" value={priceRange}
                    onChange={e => setPriceRange(+e.target.value)}
                    className="w-full accent-purple-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm mt-3 font-semibold">
                    <span className="text-gray-400">PKR 0</span>
                    <span className="text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">PKR {priceRange.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest">Categories</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map(c => (
                      <label key={c} className={`flex items-center justify-center p-3 rounded-xl cursor-pointer border-2 transition-all ${category === c ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-gray-100 hover:border-purple-200 text-gray-600 font-medium'}`}>
                        <input type="radio" name="cat" checked={category === c} onChange={() => setCategory(c)} className="hidden" />
                        <span className="text-sm">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-white">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all active:scale-95"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}