import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Star, SlidersHorizontal,
  Grid, List, ChevronDown, X, Sparkles,
  ShoppingCart, Loader, AlertCircle
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader  from './BuyerHeader';
import { artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES = ['All', 'Landscape', 'Abstract', 'Traditional', 'Modern', 'Calligraphy', 'Portraits', 'Other'];

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured'          },
  { value: 'price-low',  label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated'         },
  { value: 'popular',    label: 'Most Popular'      },
];

const BuyerBrowsePage = () => {
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy,         setSortBy]         = useState('featured');
  const [viewMode,       setViewMode]       = useState('grid');
  const [favorites,      setFavorites]      = useState([]);
  const [maxPrice,       setMaxPrice]       = useState(50000);
  const [minRating,      setMinRating]      = useState(0);
  const [showFilters,    setShowFilters]    = useState(false);
  const [artworks,       setArtworks]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [total,          setTotal]          = useState(0);

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { showSold: true };
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery.trim())       params.search   = searchQuery;
      if (maxPrice < 50000)         params.maxPrice = maxPrice;
      if (sortBy !== 'featured')    params.sortBy   = sortBy;

      const data = await artworkAPI.getAll(params);
      let list   = data.artworks || [];

      if (minRating > 0) {
        list = list.filter(a => a.rating >= minRating);
      }

      setArtworks(list);
      setTotal(data.total || list.length);
    } catch (err) {
      setError('Failed to load artworks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, maxPrice, sortBy, minRating]);

  useEffect(() => {
    const timer = setTimeout(() => fetchArtworks(), 300);
    return () => clearTimeout(timer);
  }, [fetchArtworks]);

  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setMaxPrice(50000);
    setMinRating(0);
    setSortBy('featured');
  };

  const hasActiveFilters =
    activeCategory !== 'All' || maxPrice < 50000 || minRating > 0 || searchQuery.trim();

  const ArtworkCard = ({ art }) => {
    const isSold = !art.isAvailable;

    const cardContent = (
      <div className={`bg-white rounded-2xl shadow-sm overflow-hidden group border border-gray-100 cursor-pointer
        ${isSold ? 'opacity-75' : 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300'}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(art.image)}
            alt={art.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${!isSold ? 'group-hover:scale-110' : ''}`}
            loading="lazy"
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Image fallback */}
          <div
            style={{ display: 'none' }}
            className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 items-center justify-center text-5xl absolute inset-0 flex"
          >
            🎨
          </div>

          {/* SOLD overlay */}
          {isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="px-4 py-2 bg-red-500 text-white text-sm font-black rounded-xl tracking-widest shadow-lg">
                SOLD
              </span>
            </div>
          )}

          {/* Featured badge */}
          {art.isFeatured && !isSold && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1 z-10">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}

          {/* Favorite button */}
          {!isSold && (
            <button
              onClick={e => toggleFavorite(art._id, e)}
              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110"
            >
              <Heart className={`w-4 h-4 transition-colors ${
                favorites.includes(art._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`} />
            </button>
          )}

          {/* Category badge */}
          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-lg z-10">
            {art.category}
          </span>
        </div>

        <div className="p-3">
          <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{art.title}</h3>
          <p className="text-gray-500 text-xs mb-2 truncate">by {art.artistName}</p>
          <div className="flex items-center justify-between">
            <span className={`font-bold text-sm ${isSold ? 'text-gray-400 line-through' : 'text-purple-600'}`}>
              PKR {art.price.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-700">
                {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
              </span>
              {art.sales > 0 && (
                <span className="text-xs text-gray-400">({art.sales})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    if (isSold) {
      return <div key={art._id}>{cardContent}</div>;
    }

    return (
      <Link to={`/buyer/artwork/${art._id}`} key={art._id}>
        {cardContent}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Browse Artworks"
          subtitle="Discover & collect Pakistani art"
          searchPlaceholder="Search artworks, artists..."
          searchValue={searchQuery}
          onSearchChange={e => setSearchQuery(e.target.value)}
        />

        <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">

          {/* Hero Strip */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 rounded-2xl p-5 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-xl mb-1">
                  {total > 0 ? `${total} Artworks Available` : 'Explore Artworks'}
                </h2>
                <p className="text-purple-100 text-sm">
                  Handcrafted by talented Pakistani artists
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="bg-white/20 border border-white/30 px-3 py-2 rounded-xl text-sm font-semibold">
                  ❤️ {favorites.length} Saved
                </div>
                <Link to="/buyer/favorites">
                  <div className="bg-white text-purple-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 transition cursor-pointer">
                    Wishlist →
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                {loading
                  ? <span className="text-gray-400">Loading...</span>
                  : <><span className="font-bold text-gray-900">{artworks.length}</span> artworks</>
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700 bg-red-50 px-2 py-1 rounded-lg transition"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition ${
                  showFilters
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Max Price: <span className="text-purple-600">PKR {maxPrice.toLocaleString()}</span>
                </label>
                <input
                  type="range" min="5000" max="50000" step="1000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>PKR 5,000</span>
                  <span>PKR 50,000</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Minimum Rating
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[0, 4.0, 4.5, 4.8].map(r => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        minRating === r
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      {r === 0 ? 'Any' : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Loading artworks...</p>
              </div>
            </div>

          /* Error */
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load artworks</h3>
              <p className="text-gray-500 text-sm mb-5">{error}</p>
              <button
                onClick={fetchArtworks}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
              >
                Try Again
              </button>
            </div>

          /* Empty */
          ) : artworks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No artworks found</h3>
              <p className="text-gray-500 text-sm mb-5">
                {hasActiveFilters
                  ? 'Try adjusting your filters or search query'
                  : 'No artworks have been uploaded yet. Check back soon!'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>

          /* Grid View */
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {artworks.map(art => (
                <ArtworkCard key={art._id} art={art} />
              ))}
            </div>

          /* List View */
          ) : (
            <div className="space-y-3">
              {artworks.map(art => {
                const isSold = !art.isAvailable;
                const content = (
                  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 group
                    ${isSold ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer'}`}>
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      {isSold && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-black">SOLD</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{art.title}</h3>
                        {isSold && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg">
                            Sold
                          </span>
                        )}
                        {art.isFeatured && !isSold && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mb-2 truncate">by {art.artistName}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`font-bold text-sm ${isSold ? 'text-gray-400 line-through' : 'text-purple-600'}`}>
                          PKR {art.price.toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-lg font-medium">
                          {art.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-gray-700">
                            {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                          </span>
                        </div>
                        {art.sales > 0 && (
                          <span className="text-xs text-gray-400">{art.sales} sold</span>
                        )}
                      </div>
                    </div>
                    {!isSold && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={e => toggleFavorite(art._id, e)}
                          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition"
                        >
                          <Heart className={`w-4 h-4 ${
                            favorites.includes(art._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                          }`} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );

                return isSold
                  ? <div key={art._id}>{content}</div>
                  : <Link to={`/buyer/artwork/${art._id}`} key={art._id}>{content}</Link>;
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BuyerBrowsePage;