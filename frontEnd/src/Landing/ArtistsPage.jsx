import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Star, MapPin, Award, CheckCircle,
  Heart, Users, Loader, AlertCircle
} from 'lucide-react';
import Navbar        from './Navbar';
import Footer        from './Footer';
import { artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const GRADIENTS = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-indigo-500',
  'from-rose-500 to-orange-500',
  'from-green-500 to-teal-500',
  'from-amber-500 to-yellow-500',
  'from-cyan-500 to-blue-500',
];

export default function ArtistsPage() {
  const [searchTerm,   setSearchTerm]   = useState('');
  const [likedArtists, setLikedArtists] = useState({});
  const [artists,      setArtists]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      setError('');
      try {
        // Load artworks and build unique artist list with real data
        const data = await artworkAPI.getAll({ limit: 100, showSold: true });
        const seen  = new Set();
        const list  = [];

        for (const art of (data.artworks || [])) {
          const id = (art.artist?._id || art.artist)?.toString();
          if (!id || seen.has(id)) continue;
          seen.add(id);
          list.push({
            _id:        id,
            name:       art.artistName,
            avatar:     art.artist?.avatar   || '',
            city:       art.artist?.city     || 'Pakistan',
            specialty:  art.artist?.specialty || art.category + ' Artist',
            bio:        art.artist?.bio       || '',
            rating:     art.rating            || 0,
            sales:      art.sales             || 0,
            artworks:   0,
            followers:  0,
            verified:   true,
          });
        }

        // Count artworks per artist
        for (const art of (data.artworks || [])) {
          const id = (art.artist?._id || art.artist)?.toString();
          const found = list.find(a => a._id === id);
          if (found) found.artworks += 1;
        }

        setArtists(list);
      } catch (err) {
        setError('Failed to load artists: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const filtered = artists.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLike = id => setLikedArtists(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-800 via-purple-700 to-blue-700 pt-24 md:pt-28 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">
            Discover Artists
          </h1>
          <p className="text-white/80 text-base md:text-lg mb-7">
            Connect with talented artists from across Pakistan
          </p>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search artists by name or specialty..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none bg-white shadow-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-5">
          {loading
            ? 'Loading...'
            : <><span className="font-semibold text-gray-800">{filtered.length}</span> artists</>
          }
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No artists found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filtered.map((a, idx) => (
              <div key={a._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                {/* Cover gradient */}
                <div className={`relative h-28 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                  />
                  <button
                    onClick={() => toggleLike(a._id)}
                    className={`absolute bottom-3 right-3 p-1.5 rounded-lg backdrop-blur-sm transition ${
                      likedArtists[a._id] ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedArtists[a._id] ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Profile */}
                <div className="px-5 pb-5 -mt-8">
                  <div className="flex justify-center mb-3">
                    <div className="relative">
                      {a.avatar ? (
                        <img
                          src={getImageUrl(a.avatar)}
                          alt={a.name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} border-4 border-white shadow-md items-center justify-center text-white font-black text-2xl ${a.avatar ? 'hidden' : 'flex'}`}
                      >
                        {a.name?.charAt(0)?.toUpperCase()}
                      </div>
                      {a.verified && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-white">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center mb-3">
                    <h3 className="font-bold text-gray-900 text-base">{a.name}</h3>
                    <p className="text-purple-600 font-medium text-sm">{a.specialty}</p>
                    <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {a.city}
                    </div>
                    {a.bio && (
                      <p className="text-gray-500 text-xs mt-2 leading-relaxed line-clamp-2">{a.bio}</p>
                    )}
                  </div>
                  {a.rating > 0 && (
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900 text-sm">{a.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 mb-4 py-3 border-t border-b border-gray-100">
                    {[['Artworks', a.artworks], ['Sales', a.sales]].map(([label, val]) => (
                      <div key={label} className="text-center">
                        <p className="font-bold text-gray-900 text-sm">{val}</p>
                        <p className="text-gray-400 text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                  <Link to="/login">
                    <button className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition">
                      View Profile
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-700 py-14 px-4 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Are You an Artist?</h2>
          <p className="text-white/80 mb-6">Join our community and showcase your talent to thousands</p>
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