import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Star, Share2, ChevronLeft,
  CheckCircle, Package, Shield, Truck, Eye,
  MessageCircle, MapPin, Loader, AlertCircle
} from 'lucide-react';
import BuyerSidebar  from './BuyerSidebar';
import BuyerHeader   from './BuyerHeader';
import { artworkAPI, messageAPI, reviewAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const ArtworkDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFavorite,  setIsFavorite]  = useState(false);
  const [artwork,     setArtwork]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [related,     setRelated]     = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [reviews,     setReviews]     = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await artworkAPI.getById(id);
        setArtwork(data.artwork);

        const [relatedData, reviewData] = await Promise.all([
          artworkAPI.getAll({ category: data.artwork.category, limit: 4, showSold: true }),
          reviewAPI.getArtworkReviews(id),
        ]);

        setRelated((relatedData.artworks || []).filter(a => a._id !== id).slice(0, 3));
        setReviews(reviewData.reviews || []);
      } catch (err) {
        setError('Artwork not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAll();
  }, [id]);

  const handleChat = async () => {
    if (chatLoading) return;
    setChatLoading(true);
    try {
      const sellerId = artwork.artist?._id || artwork.artist;
      const data     = await messageAPI.getOrCreateConversation(sellerId.toString());
      navigate('/buyer/messages', { state: { conversationId: data.conversation._id } });
    } catch (err) {
      navigate('/buyer/messages');
    } finally {
      setChatLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  // ── Loading ──────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading artwork...</p>
        </div>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────
  if (error || !artwork) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Artwork not found</h3>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => navigate('/buyer/browse')}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
          >
            Back to Browse
          </button>
        </div>
      </div>
    </div>
  );

  const discount = artwork.originalPrice
    ? Math.round((1 - artwork.price / artwork.originalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Artwork Detail"
          subtitle={artwork.title}
        />

        <main className="p-4 md:p-6 w-full max-w-7xl mx-auto">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm font-medium mb-5 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">

            {/* Image */}
            <div>
              <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square shadow-lg relative">
                <img
                  src={getImageUrl(artwork.image)}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div
                  style={{ display: 'none' }}
                  className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 items-center justify-center text-8xl absolute inset-0 flex"
                >
                  🎨
                </div>
                {!artwork.isAvailable && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="px-6 py-2 bg-red-500 text-white font-black text-lg rounded-xl tracking-widest">
                      SOLD
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">
                    {artwork.category}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-2">
                    {artwork.title}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    by <span className="font-semibold text-gray-700">{artwork.artistName}</span>
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2.5 rounded-xl border-2 transition ${
                      isFavorite
                        ? 'border-red-200 bg-red-50 text-red-500'
                        : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2.5 rounded-xl border-2 border-gray-200 text-gray-400 hover:border-purple-200 hover:text-purple-500 transition">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-black ${artwork.isAvailable ? 'text-purple-600' : 'text-gray-400 line-through'}`}>
                  PKR {artwork.price.toLocaleString()}
                </span>
                {discount && artwork.isAvailable && (
                  <>
                    <span className="text-gray-400 line-through text-lg">
                      PKR {artwork.originalPrice.toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <strong className="text-gray-900">
                    {artwork.rating > 0 ? artwork.rating.toFixed(1) : 'New'}
                  </strong>
                  {reviews.length > 0 && (
                    <span className="text-gray-400">({reviews.length} reviews)</span>
                  )}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Eye className="w-4 h-4" /> {artwork.views}
                </span>
                {artwork.sales > 0 && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <Package className="w-4 h-4" /> {artwork.sales} sold
                  </span>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 py-4 border-y border-gray-100">
                {[
                  ['Category',   artwork.category],
                  ['Medium',     artwork.medium     || 'Not specified'],
                  ['Dimensions', artwork.dimensions || 'Not specified'],
                  ['Listed',     formatDate(artwork.createdAt)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{k}</p>
                    <p className="font-semibold text-gray-900 text-sm">{v}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">{artwork.description}</p>

              {/* Tags */}
              {artwork.tags && artwork.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map(t => (
                    <span
                      key={t}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-purple-100 hover:text-purple-600 cursor-pointer transition"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Availability */}
              <div className={`flex items-center gap-2 text-sm font-semibold ${
                artwork.isAvailable ? 'text-green-600' : 'text-red-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${artwork.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                {artwork.isAvailable ? 'Available for purchase' : 'This artwork has been sold'}
              </div>

              {/* CTA Buttons */}
              {artwork.isAvailable ? (
                <div className="flex gap-3 pt-1">
                  <Link to="/buyer/checkout" state={{ artworkId: artwork._id }} className="flex-1">
                    <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
                      <ShoppingCart className="w-5 h-5" /> Buy Now
                    </button>
                  </Link>
                  <button
                    onClick={handleChat}
                    disabled={chatLoading}
                    className="py-3 px-5 border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {chatLoading ? <Loader className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                    Chat
                  </button>
                </div>
              ) : (
                <div className="pt-1 space-y-3">
                  <div className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-red-200">
                    <Package className="w-5 h-5" /> This Artwork Has Been Sold
                  </div>
                  <button
                    onClick={handleChat}
                    disabled={chatLoading}
                    className="w-full py-3 border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {chatLoading ? <Loader className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                    Contact Artist
                  </button>
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  [Shield,  'Verified',  'Authentic artwork' ],
                  [Truck,   'Delivery',  '5-7 business days' ],
                  [Package, 'Packaged',  'Safe packaging'    ],
                ].map(([Icon, title, desc]) => (
                  <div key={title} className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                    <Icon className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="font-semibold text-gray-900 text-xs">{title}</p>
                    <p className="text-gray-500 text-xs">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Artist Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">About the Artist</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-100 flex-shrink-0">
                {artwork.artist?.avatar ? (
                  <img
                    src={getImageUrl(artwork.artist.avatar)}
                    alt={artwork.artistName}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 items-center justify-center text-white font-black text-xl ${artwork.artist?.avatar ? 'hidden' : 'flex'}`}>
                  {artwork.artistName?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{artwork.artistName}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {artwork.artist?.city || 'Pakistan'}
                </div>
                {artwork.artist?.specialty && (
                  <p className="text-xs text-purple-600 font-medium mt-0.5">{artwork.artist.specialty}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Verified Artist</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link to={`/buyer/artist/${artwork.artist?._id || artwork.artist}`}>
                  <button className="px-4 py-2 border-2 border-purple-200 text-purple-600 rounded-xl font-semibold text-sm hover:bg-purple-600 hover:text-white transition">
                    View Profile
                  </button>
                </Link>
                <button
                  onClick={handleChat}
                  disabled={chatLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {chatLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                  Message
                </button>
              </div>
            </div>
          </div>

          {/* ── Reviews Section ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">
                Customer Reviews
                {reviews.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({reviews.length})</span>
                )}
              </h2>
              {artwork.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${
                        s <= Math.round(artwork.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-200'
                      }`} />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{artwork.rating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">/ 5</span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Be the first to review after purchasing this artwork
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {review.buyerAvatar ? (
                            <img
                              src={getImageUrl(review.buyerAvatar)}
                              alt={review.buyerName}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            review.buyerName?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{review.buyerName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3.5 h-3.5 ${
                                  s <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-200'
                                }`} />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold flex-shrink-0">
                        Verified Purchase
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {review.comment}
                    </p>

                    {review.reply && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 ml-4">
                        <p className="text-xs font-bold text-indigo-700 mb-1">
                          Artist's Reply:
                        </p>
                        <p className="text-sm text-gray-700">{review.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Artworks */}
          {related.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">More in {artwork.category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map(a => (
                  <Link to={`/buyer/artwork/${a._id}`} key={a._id}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition border border-gray-100 group cursor-pointer">
                      <div className="h-40 overflow-hidden bg-gray-100 relative">
                        <img
                          src={getImageUrl(a.image)}
                          alt={a.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        {!a.isAvailable && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-lg">SOLD</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{a.title}</h3>
                        <p className="text-gray-500 text-xs mb-1">by {a.artistName}</p>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-sm ${a.isAvailable ? 'text-purple-600' : 'text-gray-400 line-through'}`}>
                            PKR {a.price.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-700">
                              {a.rating > 0 ? a.rating.toFixed(1) : 'New'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default ArtworkDetail;