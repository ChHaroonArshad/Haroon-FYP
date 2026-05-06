import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader  from './AdminHeader';
import {
  Search, Trash2, Package, Eye,
  Loader, AlertCircle, X, CheckCircle
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES = ['all','Landscape','Abstract','Traditional','Modern','Calligraphy','Portraits','Other'];

export default function AdminArtworks() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [artworks,    setArtworks]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState('all');
  const [selected,    setSelected]    = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [total,       setTotal]       = useState(0);

  const fetchArtworks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search)             params.search   = search;
      if (category !== 'all') params.category = category;
      const data = await adminAPI.getArtworks(params);
      setArtworks(data.artworks || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load artworks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchArtworks, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this artwork? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteArtwork(id);
      setArtworks(prev => prev.filter(a => a._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Manage Artworks"
          subtitle={`${total} total artworks — real data`}
        />
        <main className="p-4 md:p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total',     value: artworks.length },
              { label: 'Available', value: artworks.filter(a => a.isAvailable).length },
              { label: 'Sold',      value: artworks.filter(a => !a.isAvailable).length },
              { label: 'Categories',value: [...new Set(artworks.map(a => a.category))].length },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2 shadow-sm">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0"
                placeholder="Search artworks or artists..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none text-gray-700 bg-white shadow-sm"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {artworks.length === 0 ? (
                <div className="col-span-3 text-center py-16 bg-white rounded-xl border border-gray-100">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No artworks found</p>
                </div>
              ) : (
                artworks.map(art => (
                  <div key={art._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="h-40 bg-gray-100 overflow-hidden relative">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      {!art.isAvailable && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-lg">SOLD</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{art.title}</p>
                          <p className="text-xs text-gray-500 truncate">by {art.artistName}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700 flex-shrink-0">
                          {art.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-900">PKR {art.price?.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">{formatDate(art.createdAt)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelected(art)}
                          className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => handleDelete(art._id)}
                          disabled={deletingId === art._id}
                          className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          {deletingId === art._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Detail Modal */}
          {selected && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Artwork Details</h3>
                  <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <X size={18} />
                  </button>
                </div>
                <div className="h-48 bg-gray-100 rounded-xl overflow-hidden mb-4">
                  <img
                    src={getImageUrl(selected.image)}
                    alt={selected.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                <p className="font-bold text-gray-900 text-lg mb-1">{selected.title}</p>
                <p className="text-sm text-gray-500 mb-1">by {selected.artistName}</p>
                <p className="text-purple-600 font-bold mb-3">PKR {selected.price?.toLocaleString()}</p>
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  {[
                    ['Category',   selected.category],
                    ['Medium',     selected.medium     || 'N/A'],
                    ['Dimensions', selected.dimensions || 'N/A'],
                    ['Status',     selected.isAvailable ? 'Available' : 'Sold'],
                    ['Views',      selected.views || 0],
                    ['Sales',      selected.sales || 0],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">{l}</p>
                      <p className="font-semibold text-gray-800">{v}</p>
                    </div>
                  ))}
                </div>
                {selected.description && (
                  <p className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-xl p-3">
                    {selected.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(selected._id)}
                    disabled={deletingId === selected._id}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                  >
                    {deletingId === selected._id ? 'Deleting...' : 'Delete Artwork'}
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}