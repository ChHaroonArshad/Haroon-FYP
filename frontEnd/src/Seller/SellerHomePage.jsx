import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, DollarSign, ShoppingBag, Star, Eye, Upload,
  Users, MessageSquare, ArrowRight, CheckCircle,
  Clock, Package, Award, BarChart2, Loader,
  AlertCircle, Palette, Zap
} from 'lucide-react';
import SellerSidebar  from './SellerSidebar';
import SellerHeader   from './SellerHeader';
import { orderAPI, artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const STATUS_CONFIG = {
  delivered:   { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle, label: 'Delivered'  },
  'in-transit':{ bg: 'bg-blue-100',   text: 'text-blue-700',   icon: Package,     label: 'In Transit' },
  confirmed:   { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: CheckCircle, label: 'Confirmed'  },
  pending:     { bg: 'bg-amber-100',  text: 'text-amber-700',  icon: Clock,       label: 'Pending'    },
  cancelled:   { bg: 'bg-red-100',    text: 'text-red-700',    icon: AlertCircle, label: 'Cancelled'  },
};

const QUICK_ACTIONS = [
  { icon: Upload,        label: 'Upload Artwork',  to: '/seller/upload',          bg: 'from-indigo-500 to-indigo-700'  },
  { icon: MessageSquare, label: 'Messages',        to: '/seller/chat',            bg: 'from-purple-500 to-purple-700'  },
  { icon: BarChart2,     label: 'Analytics',       to: '/seller/earnings',        bg: 'from-blue-500 to-blue-700'      },
  { icon: Users,         label: 'Custom Requests', to: '/seller/custom-requests', bg: 'from-amber-500 to-orange-600'   },
];

export default function SellerHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders,      setOrders]      = useState([]);
  const [artworks,    setArtworks]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ordersData, artworksData] = await Promise.all([
          orderAPI.getSellerOrders(),
          artworkAPI.getMine(),
        ]);
        setOrders(ordersData.orders   || []);
        setArtworks(artworksData.artworks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Computed real stats
  const totalRevenue    = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalOrders     = orders.length;
  const totalViews      = artworks.reduce((s, a) => s + (a.views || 0), 0);
  const ratedArtworks   = artworks.filter(a => a.rating > 0);
  const avgRating       = ratedArtworks.length
    ? (ratedArtworks.reduce((s, a) => s + a.rating, 0) / ratedArtworks.length).toFixed(1)
    : '—';

  const recentOrders    = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const topArtworks     = [...artworks].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 3);

  const formatPKR = (n) => n >= 1000000
    ? `PKR ${(n / 1000000).toFixed(1)}M`
    : n >= 1000
    ? `PKR ${(n / 1000).toFixed(0)}K`
    : `PKR ${n}`;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });

  const heroStats = [
    { num: artworks.length,              label: 'Artworks' },
    { num: totalOrders,                  label: 'Orders'   },
    { num: totalViews.toLocaleString(),  label: 'Views'    },
    { num: avgRating,                    label: 'Rating'   },
  ];

  const statCards = [
    {
      icon: DollarSign, label: 'Total Revenue',
      value: formatPKR(totalRevenue),
      bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', text: 'text-emerald-600',
    },
    {
      icon: ShoppingBag, label: 'Total Orders',
      value: totalOrders,
      bg: 'bg-indigo-50', iconBg: 'bg-indigo-500', text: 'text-indigo-600',
    },
    {
      icon: Eye, label: 'Total Views',
      value: totalViews.toLocaleString(),
      bg: 'bg-blue-50', iconBg: 'bg-blue-500', text: 'text-blue-600',
    },
    {
      icon: Star, label: 'Avg Rating',
      value: avgRating,
      bg: 'bg-amber-50', iconBg: 'bg-amber-500', text: 'text-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Artist Dashboard"
          subtitle="Welcome back!"
          action={{ label: 'Upload Art', to: '/seller/upload' }}
        />

        <main className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">

          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
            />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <Palette className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-indigo-200 text-sm font-semibold">Artist Dashboard</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black mb-1 text-white">
                  Welcome back, {user.fullName?.split(' ')[0] || 'Artist'}! 🎨
                </h1>
                <p className="text-indigo-200 text-sm mb-5">
                  Here's how your store is performing today
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/seller/upload">
                    <button className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition flex items-center gap-2 shadow-lg">
                      <Upload className="w-4 h-4" /> Upload Artwork
                    </button>
                  </Link>
                  <Link to="/seller/earnings">
                    <button className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/30 transition border border-white/30">
                      View Earnings
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
                    <p className="text-indigo-200 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {statCards.map((s, i) => (
                <div key={i} className={`${s.bg} rounded-2xl border border-white shadow-sm p-4 hover:shadow-md transition`}>
                  <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5">{s.label}</p>
                  <p className={`text-lg md:text-xl font-black ${s.text} truncate`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map((a, i) => (
                <Link to={a.to} key={i}>
                  <div className={`bg-gradient-to-br ${a.bg} rounded-2xl p-4 flex flex-col items-center gap-2.5 text-center hover:opacity-95 hover:-translate-y-1 transition-all cursor-pointer shadow-md hover:shadow-lg`}>
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                      <a.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-sm text-white">{a.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Orders + Artworks */}
          <div className="grid lg:grid-cols-2 gap-5">

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" /> Recent Orders
                </h2>
                <Link to="/seller/orders" className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl animate-pulse">
                      <div className="w-9 h-9 bg-gray-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-32 mb-1.5" />
                        <div className="h-2.5 bg-gray-200 rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">No orders yet</p>
                  <p className="text-gray-400 text-xs mt-0.5">Upload artworks to start selling</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map(order => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    return (
                      <div key={order._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition group">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{order.artworkTitle}</p>
                          <p className="text-xs text-gray-500">{order.buyerName} · {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-indigo-600 text-sm">PKR {order.totalAmount?.toLocaleString()}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Link to="/seller/orders">
                <button className="w-full mt-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition">
                  View All Orders
                </button>
              </Link>
            </div>

            {/* Top Artworks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Top Artworks
                </h2>
                <Link to="/seller/manage-artworks" className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-28 mb-1.5" />
                        <div className="h-2.5 bg-gray-200 rounded w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topArtworks.length === 0 ? (
                <div className="text-center py-10">
                  <Palette className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">No artworks yet</p>
                  <Link to="/seller/upload">
                    <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition">
                      Upload Now
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {topArtworks.map((art, i) => (
                    <div key={art._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition group">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200">
                          <img
                            src={getImageUrl(art.image)}
                            alt={art.title}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{art.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {(art.views || 0).toLocaleString()}</span>
                          <span className="flex items-center gap-0.5"><ShoppingBag className="w-3 h-3" /> {art.sales || 0} sold</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-indigo-600 text-sm">PKR {art.price?.toLocaleString()}</p>
                        {art.rating > 0 && (
                          <div className="flex items-center justify-end gap-0.5 mt-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600 font-semibold">{art.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/seller/upload">
                <button className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200">
                  <Upload className="w-4 h-4" /> Upload New Artwork
                </button>
              </Link>
            </div>
          </div>

          {/* Motivational CTA */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-purple-200/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '25px 25px' }}
            />
            <div className="relative">
              <h2 className="text-lg font-black mb-1 text-white">Keep Creating! 🚀</h2>
              <p className="text-purple-200 text-sm">Artists who upload weekly earn 3x more on average</p>
            </div>
            <Link to="/seller/upload" className="flex-shrink-0 relative">
              <button className="bg-white text-purple-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-50 transition flex items-center gap-2 shadow-lg">
                <Upload className="w-4 h-4" /> Upload Now
              </button>
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}