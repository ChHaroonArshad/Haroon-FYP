import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, TrendingUp, ShoppingBag, ArrowUpRight,
  Calendar, Loader, AlertCircle, Eye, Star, Package
} from 'lucide-react';
import SellerSidebar  from './SellerSidebar';
import SellerHeader   from './SellerHeader';
import { orderAPI, artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COMMISSION = 0.10;

export default function EarningsAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders,      setOrders]      = useState([]);
  const [artworks,    setArtworks]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [period,      setPeriod]      = useState('month');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [ordersData, artworksData] = await Promise.all([
          orderAPI.getSellerOrders(),
          artworkAPI.getMine(),
        ]);
        setOrders(ordersData.orders     || []);
        setArtworks(artworksData.artworks || []);
      } catch (err) {
        setError('Failed to load earnings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatPKR = (n) => {
    if (!n) return 'PKR 0';
    if (n >= 1000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000)    return `PKR ${(n / 1000).toFixed(0)}K`;
    return `PKR ${n}`;
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  // Computed stats
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const pendingOrders   = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'in-transit');
  const totalRevenue    = deliveredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalNet        = Math.round(totalRevenue * (1 - COMMISSION));
  const pendingRevenue  = pendingOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  // Monthly revenue from real orders
  const monthlyMap = {};
  deliveredOrders.forEach(o => {
    const m = new Date(o.createdAt).getMonth();
    monthlyMap[m] = (monthlyMap[m] || 0) + (o.totalAmount || 0);
  });
  const monthlyData = Object.entries(monthlyMap)
    .map(([m, amount]) => ({ month: parseInt(m), label: MONTHS[parseInt(m)], amount }))
    .sort((a, b) => a.month - b.month);
  const maxAmount = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.amount)) : 1;

  // Top artworks by revenue from real orders
  const artworkRevMap = {};
  deliveredOrders.forEach(o => {
    const key = o.artworkTitle || 'Unknown';
    if (!artworkRevMap[key]) artworkRevMap[key] = { revenue: 0, sales: 0, image: o.artworkImage || '' };
    artworkRevMap[key].revenue += o.totalAmount || 0;
    artworkRevMap[key].sales   += 1;
  });
  const topArtworks = Object.entries(artworkRevMap)
    .map(([title, data]) => ({ title, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  // Recent transactions
  const recentTransactions = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const statCards = [
    { label: 'Total Revenue',   value: formatPKR(totalRevenue), sub: 'Gross earnings',    icon: DollarSign,  from: 'from-emerald-500', to: 'to-green-600'   },
    { label: 'Net Earnings',    value: formatPKR(totalNet),     sub: 'After 10% platform', icon: TrendingUp,  from: 'from-indigo-500',  to: 'to-indigo-700'  },
    { label: 'Pending Revenue', value: formatPKR(pendingRevenue), sub: 'In progress orders',icon: Calendar,   from: 'from-amber-500',   to: 'to-orange-600'  },
    { label: 'Total Sales',     value: deliveredOrders.length,  sub: 'Completed orders',   icon: ShoppingBag, from: 'from-purple-500',  to: 'to-purple-700'  },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading earnings...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Earnings & Analytics"
          subtitle="Your real financial performance"
        />

        <main className="p-4 md:p-6 space-y-5 w-full max-w-7xl mx-auto">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-2xl p-4 text-white shadow-md`}>
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-white/80 text-xs font-medium mb-0.5">{s.label}</p>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-white/60 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Revenue Overview</h2>
                <p className="text-xs text-gray-500 mt-0.5">Monthly earnings from delivered orders</p>
              </div>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {['week','month','year'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                      period === p
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {monthlyData.length === 0 ? (
              <div className="h-40 flex items-center justify-center bg-gray-50 rounded-xl">
                <div className="text-center">
                  <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">No revenue data yet</p>
                  <p className="text-gray-300 text-xs mt-0.5">Revenue chart will appear after deliveries</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-end gap-2 h-40 mb-2">
                  {monthlyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-xs text-gray-500 font-semibold opacity-0 group-hover:opacity-100 transition">
                        {formatPKR(d.amount)}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all hover:from-indigo-700 hover:to-indigo-500 cursor-pointer relative"
                        style={{ height: `${Math.max((d.amount / maxAmount) * 130, 6)}px` }}
                        title={`${d.label}: ${formatPKR(d.amount)}`}
                      />
                      <span className="text-xs text-gray-400 font-medium">{d.label}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                  {[
                    { label: 'Total Revenue', value: formatPKR(totalRevenue)         },
                    { label: 'Net Earnings',  value: formatPKR(totalNet)             },
                    { label: 'Avg / Order',   value: deliveredOrders.length > 0
                        ? formatPKR(Math.round(totalRevenue / deliveredOrders.length))
                        : 'PKR 0'
                    },
                  ].map(s => (
                    <div key={s.label} className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-100">
                      <p className="font-black text-indigo-700 text-base">{s.value}</p>
                      <p className="text-xs text-indigo-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600" /> Recent Transactions
              </h2>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map(txn => {
                    const net = Math.round((txn.totalAmount || 0) * (1 - COMMISSION));
                    const isPaid = txn.status === 'delivered';
                    return (
                      <div key={txn._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{txn.artworkTitle}</p>
                          <p className="text-xs text-gray-500">{txn.buyerName} · {formatDate(txn.createdAt)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-black text-indigo-600 text-sm">+{formatPKR(net)}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                            isPaid
                              ? 'bg-green-100 text-green-700'
                              : txn.status === 'cancelled'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full" />
                10% platform commission deducted from gross
              </p>
            </div>

            {/* Top Performing Artworks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> Top Performing
              </h2>
              {topArtworks.length === 0 ? (
                <div className="text-center py-10">
                  <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No sales data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topArtworks.map((art, i) => (
                    <div key={art.title} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm ${
                        i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-blue-400'
                      }`}>
                        {i + 1}
                      </div>
                      {art.image && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                          <img
                            src={getImageUrl(art.image)}
                            alt={art.title}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{art.title}</p>
                        <p className="text-xs text-gray-500">{art.sales} sale{art.sales !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-indigo-600 text-sm">{formatPKR(art.revenue)}</p>
                        <p className="text-xs text-gray-400">{formatPKR(Math.round(art.revenue * (1 - COMMISSION)))} net</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Artwork Performance Table */}
          {artworks.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" /> All Artworks Performance
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Artwork', 'Category', 'Price', 'Views', 'Sales', 'Rating', 'Status'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {artworks.map(art => (
                      <tr key={art._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={getImageUrl(art.image)}
                                alt={art.title}
                                className="w-full h-full object-cover"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            </div>
                            <p className="font-semibold text-gray-900 truncate max-w-[120px]">{art.title}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                            {art.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                          PKR {art.price?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{(art.views || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-600">{art.sales || 0}</td>
                        <td className="px-4 py-3">
                          {art.rating > 0 ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold text-gray-700">{art.rating.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No ratings</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                            art.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>
                            {art.isAvailable ? 'Available' : 'Sold'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}