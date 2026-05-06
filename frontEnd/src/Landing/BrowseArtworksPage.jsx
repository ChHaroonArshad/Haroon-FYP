import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Heart, Eye, Star, SlidersHorizontal,
  Grid, List, X, Loader, AlertCircle, Sparkles
} from 'lucide-react';
import Navbar        from './Navbar';
import Footer        from './Footer';
import { artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES = ['All','Abstract','Landscape','Portrait','Traditional','Modern','Calligraphy','Portraits'];

export default function BrowseArtworksPage() {
  const [viewMode,   setViewMode]   = useState('grid');
  const [showFilters,setShowFilters]= useState(false);
  const [category,   setCategory]   = useState('All');
  const [priceRange, setPriceRange] = useState(100000);
  const [sortBy,     setSortBy]     = useState('newest');
  const [search,     setSearch]     = useState('');
  const [liked,      setLiked]      = useState({});
  const [artworks,   setArtworks]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [total,      setTotal]      = useState(0);

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { showSold: true, limit: 50 };
      if (category !== 'All') params.category = category;
      if (search.trim())      params.search   = search;
      if (priceRange < 100000)params.maxPrice = priceRange;
      const sortMap = {
        'price-low':  'price-low',
        'price-high': 'price-high',
        'popular':    'popular',
        'rating':     'rating',
      };
      if (sortMap[sortBy]) params.sortBy = sortMap[sortBy];

      const data = await artworkAPI.getAll(params);
      setArtworks(data.artworks || []);
      setTotal(data.total || 0);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-800 via-purple-700 to-blue-700 pt-24 md:pt-28 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Browse Artworks</h1>
          <p className="text-white/80 text-base md:text-lg mb-7">
            Discover unique pieces from talented Pakistani artists
          </p>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search artworks, artists, styles..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none bg-white shadow-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-purple-400 hover:text-purple-600 transition shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <div className="flex items-center gap-2 overflow-x-auto">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3.5 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition ${
                    category === c
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price ↑</option>
              <option value="price-high">Price ↓</option>
            </select>
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 transition ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 transition ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          {loading
            ? 'Loading...'
            : <><span className="font-semibold text-gray-800">{artworks.length}</span> artworks found</>
          }
        </p>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">{error}</p>
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No artworks found</h3>
            <p className="text-gray-500 text-sm mb-5">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(''); setCategory('All'); setPriceRange(100000); }}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {artworks.map(art => {
              const isSold = !art.isAvailable;
              return (
                <Link to="/login" key={art._id}>
                  <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 ${isSold ? 'opacity-75' : ''}`}>
                    <div className="relative overflow-hidden aspect-square bg-gray-100">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      {isSold && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-xl">SOLD</span>
                        </div>
                      )}
                      {art.isFeatured && !isSold && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}
                      {!isSold && (
                        <button
                          onClick={e => { e.preventDefault(); toggleLike(art._id); }}
                          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-sm transition ${
                            liked[art._id] ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${liked[art._id] ? 'fill-current' : ''}`} />
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-0.5 text-sm truncate">{art.title}</h3>
                      <p className="text-gray-500 text-xs mb-2">by {art.artistName}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold text-gray-700">
                          {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                        </span>
                        {art.numReviews > 0 && <span className="text-xs text-gray-400">({art.numReviews})</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${isSold ? 'text-gray-400 line-through' : 'text-purple-600'}`}>
                          PKR {art.price?.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {art.views || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {artworks.map(art => {
              const isSold = !art.isAvailable;
              return (
                <Link to="/login" key={art._id}>
                  <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex border border-gray-100 ${isSold ? 'opacity-75' : ''}`}>
                    <div className="w-28 sm:w-40 h-28 overflow-hidden flex-shrink-0 bg-gray-100 relative">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      {isSold && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-black">SOLD</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{art.title}</h3>
                          {art.isFeatured && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex-shrink-0">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm mb-2">by {art.artistName} · {art.category}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {art.views || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`font-bold text-base sm:text-lg ${isSold ? 'text-gray-400 line-through' : 'text-purple-600'}`}>
                          PKR {art.price?.toLocaleString()}
                        </span>
                        <button
                          onClick={e => { e.preventDefault(); toggleLike(art._id); }}
                          className={`p-2 border rounded-xl transition ${
                            liked[art._id] ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${liked[art._id] ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-80 max-w-full bg-white h-full p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">Max Price</h4>
                <input
                  type="range" min="0" max="100000" value={priceRange}
                  onChange={e => setPriceRange(+e.target.value)}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>PKR 0</span>
                  <span className="font-semibold text-purple-600">PKR {priceRange.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">Category</h4>
                <div className="space-y-2">
                  {CATEGORIES.map(c => (
                    <label key={c} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="cat"
                        checked={category === c}
                        onChange={() => setCategory(c)}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span className="text-sm text-gray-700">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-700 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Are You an Artist?</h2>
          <p className="text-white/80 mb-6">Join our platform and showcase your talent to thousands of buyers</p>
          <Link to="/signup">
            <button className="px-7 py-3 bg-white text-purple-700 rounded-2xl font-bold hover:bg-gray-100 transition shadow-xl">
              Join as Artist
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}