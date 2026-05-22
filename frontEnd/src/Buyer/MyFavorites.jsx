import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, ShoppingCart, Trash2, Star,
  Eye, Grid, List, Loader, AlertCircle
} from 'lucide-react';
import BuyerSidebar   from './BuyerSidebar';
import BuyerHeader    from './BuyerHeader';
import { wishlistAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

export default function MyFavorites() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode,    setViewMode]    = useState('grid');
  const [wishlist,    setWishlist]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [removing,    setRemoving]    = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await wishlistAPI.get();
        setWishlist(data.wishlist || []);
      } catch (err) {
        setError('Failed to load favorites: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (artworkId) => {
    setRemoving(artworkId);
    try {
      await wishlistAPI.toggle(artworkId);
      setWishlist(prev => prev.filter(a => a._id !== artworkId));
    } catch (err) {
      alert('Failed to remove: ' + err.message);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="My Favorites"
          subtitle={loading ? 'Loading...' : `${wishlist.length} saved artworks`}
        />

        <main className="p-4 md:p-6 w-full max-w-7xl mx-auto">

          {/* Toolbar */}
          {!loading && wishlist.length > 0 && (
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-500 text-sm">
                <span className="font-bold text-gray-900">{wishlist.length}</span> artworks saved
              </p>
              <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Loading your favorites...</p>
              </div>
            </div>

          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-900 font-bold mb-2">Failed to load favorites</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>

          ) : wishlist.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-red-300" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">No favorites yet</h3>
              <p className="text-gray-500 text-sm mb-6">
                Tap the ❤️ heart icon on any artwork to save it here
              </p>
              <Link to="/buyer/browse">
                <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                  Browse Artworks
                </button>
              </Link>
            </div>

          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map(item => (
                <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-xl">SOLD</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-lg">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleRemove(item._id)}
                      disabled={removing === item._id}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-xl shadow hover:bg-red-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {removing === item._id
                        ? <Loader className="w-3.5 h-3.5 text-red-500 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      }
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{item.title}</h3>
                    <p className="text-gray-500 text-xs mb-2">by {item.artistName}</p>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold text-gray-700">
                        {item.rating > 0 ? item.rating.toFixed(1) : 'New'}
                      </span>
                      {item.numReviews > 0 && (
                        <span className="text-gray-400 text-xs">({item.numReviews})</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${item.isAvailable ? 'text-purple-600' : 'text-gray-400 line-through'}`}>
                        PKR {item.price?.toLocaleString()}
                      </span>
                      <div className="flex gap-1.5">
                        <Link to={`/buyer/artwork/${item._id}`}>
                          <button className="p-1.5 border border-gray-200 rounded-xl hover:border-purple-300 hover:text-purple-600 transition">
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                        </Link>
                        {item.isAvailable && (
                          <Link to="/buyer/checkout" state={{ artworkId: item._id }}>
                            <button className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-purple-700 transition">
                              <ShoppingCart className="w-3.5 h-3.5" /> Buy
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : (
            <div className="space-y-3">
              {wishlist.map(item => (
                <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex hover:shadow-md transition">
                  <div className="w-28 h-28 flex-shrink-0 bg-gray-100 relative">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-black">SOLD</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{item.title}</h3>
                        <p className="text-gray-500 text-xs">by {item.artistName} · {item.category}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-gray-700">
                            {item.rating > 0 ? item.rating.toFixed(1) : 'New'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={removing === item._id}
                        className="p-1.5 hover:bg-red-50 rounded-xl transition flex-shrink-0 disabled:opacity-50"
                      >
                        {removing === item._id
                          ? <Loader className="w-4 h-4 text-red-400 animate-spin" />
                          : <Trash2 className="w-4 h-4 text-red-400" />
                        }
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`font-bold ${item.isAvailable ? 'text-purple-600' : 'text-gray-400 line-through'}`}>
                        PKR {item.price?.toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <Link to={`/buyer/artwork/${item._id}`}>
                          <button className="p-1.5 border border-gray-200 rounded-xl hover:border-purple-300 hover:text-purple-600 transition">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                        </Link>
                        {item.isAvailable && (
                          <Link to="/buyer/checkout" state={{ artworkId: item._id }}>
                            <button className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-purple-700 transition">
                              <ShoppingCart className="w-3.5 h-3.5" /> Buy Now
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}