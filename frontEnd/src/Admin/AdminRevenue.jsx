import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { DollarSign, TrendingUp, ShoppingCart, Users } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const revenueData = [120, 195, 155, 280, 310, 245, 390, 420, 355, 480, 520, 610];
const maxRev = Math.max(...revenueData);

const monthlyData = [
  { month: 'December', revenue: 'Rs 610K', orders: 342, growth: '+18%', avgOrder: 'Rs 1,784' },
  { month: 'November', revenue: 'Rs 520K', orders: 298, growth: '+8%', avgOrder: 'Rs 1,745' },
  { month: 'October', revenue: 'Rs 480K', orders: 274, growth: '+6%', avgOrder: 'Rs 1,752' },
  { month: 'September', revenue: 'Rs 355K', orders: 201, growth: '-4%', avgOrder: 'Rs 1,766' },
  { month: 'August', revenue: 'Rs 420K', orders: 238, growth: '+8%', avgOrder: 'Rs 1,765' },
  { month: 'July', revenue: 'Rs 390K', orders: 220, growth: '+59%', avgOrder: 'Rs 1,773' },
];

const categoryData = [
  { name: 'Abstract', percent: 32, revenue: 'Rs 195K' },
  { name: 'Landscape', percent: 28, revenue: 'Rs 171K' },
  { name: 'Calligraphy', percent: 18, revenue: 'Rs 110K' },
  { name: 'Portrait', percent: 12, revenue: 'Rs 73K' },
  { name: 'Miniature', percent: 10, revenue: 'Rs 61K' },
];

const topSellers = [
  { name: 'Fatima Arts', revenue: 'Rs 284K', orders: 142, percent: 47 },
  { name: 'Hassan Studio', revenue: 'Rs 236K', orders: 118, percent: 39 },
  { name: 'Zara Creations', revenue: 'Rs 190K', orders: 95, percent: 31 },
  { name: 'Ali Paintings', revenue: 'Rs 174K', orders: 87, percent: 28 },
];

export default function AdminRevenue() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title="Revenue" subtitle="Financial performance" />
        <main className="p-4 md:p-6 space-y-5">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Revenue', value: 'Rs 4.82M', change: '+23% YoY', icon: DollarSign, from: 'from-green-500', to: 'to-emerald-600' },
              { label: 'Monthly Revenue', value: 'Rs 610K', change: '+18% MoM', icon: TrendingUp, from: 'from-blue-500', to: 'to-blue-600' },
              { label: 'Total Orders', value: '3,241', change: '+8.2%', icon: ShoppingCart, from: 'from-purple-500', to: 'to-purple-600' },
              { label: 'Avg Order Value', value: 'Rs 1,487', change: '+2.1%', icon: Users, from: 'from-orange-500', to: 'to-red-500' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-xl p-4 text-white shadow-sm`}>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                  <s.icon size={17} />
                </div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-white/80 text-xs mt-0.5">{s.label}</p>
                <p className="text-white/70 text-xs mt-1">{s.change}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {['Overview', 'Monthly', 'By Category', 'Top Sellers'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === t ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {tab === 'Overview' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Revenue — All Months</h3>
              <div className="flex items-end gap-1 md:gap-2 h-40 overflow-x-auto pb-2">
                {revenueData.map((val, i) => (
                  <div key={i} className="flex-1 min-w-[24px] flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all"
                      style={{ height: `${(val / maxRev) * 120}px` }}
                    />
                    <span className="text-xs text-gray-400">{months[i].slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Tab */}
          {tab === 'Monthly' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      {['Month', 'Revenue', 'Orders', 'Avg Order', 'Growth'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {monthlyData.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-800">{m.month}</td>
                        <td className="px-5 py-3 font-bold text-gray-900">{m.revenue}</td>
                        <td className="px-5 py-3 text-gray-600">{m.orders}</td>
                        <td className="px-5 py-3 text-gray-600">{m.avgOrder}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold ${m.growth.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{m.growth}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* By Category Tab */}
          {tab === 'By Category' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-gray-900">Revenue by Category</h3>
              {categoryData.map(c => (
                <div key={c.name}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">{c.revenue}</span>
                      <span className="text-xs text-gray-400 w-8 text-right">{c.percent}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Sellers Tab */}
          {tab === 'Top Sellers' && (
            <div className="space-y-3">
              {topSellers.map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.orders} orders</p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" style={{ width: `${s.percent}%` }} />
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 text-sm flex-shrink-0">{s.revenue}</p>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}