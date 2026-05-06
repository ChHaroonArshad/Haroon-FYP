import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader  from './AdminHeader';
import {
  Search, CheckCircle, XCircle, Trash2,
  Users, UserCheck, UserX, Shield,
  MoreVertical, Loader, AlertCircle
} from 'lucide-react';
import { adminAPI } from '../services/api';

const ROLE_STYLE = {
  artist: 'bg-purple-100 text-purple-700',
  buyer:  'bg-blue-100 text-blue-700',
  admin:  'bg-red-100 text-red-700',
};

export default function AdminUsers() {
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [filterRole,    setFilterRole]    = useState('all');
  const [openMenu,      setOpenMenu]      = useState(null);
  const [deletingId,    setDeletingId]    = useState(null);
  const [total,         setTotal]         = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search)               params.search = search;
      if (filterRole !== 'all') params.role   = filterRole;
      const data = await adminAPI.getUsers(params);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search, filterRole]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      setOpenMenu(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  const statCards = [
    { label: 'Total',     value: users.length,                              icon: Users,      color: 'text-blue-600 bg-blue-50'   },
    { label: 'Artists',   value: users.filter(u => u.role === 'artist').length, icon: UserCheck, color: 'text-purple-600 bg-purple-50'},
    { label: 'Buyers',    value: users.filter(u => u.role === 'buyer').length,  icon: Shield,    color: 'text-green-600 bg-green-50' },
    { label: 'Admins',    value: users.filter(u => u.role === 'admin').length,  icon: UserX,     color: 'text-red-600 bg-red-50'     },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Manage Users"
          subtitle={`${total} total users — real data`}
        />
        <main className="p-4 md:p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards.map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2 shadow-sm">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none text-gray-700 bg-white shadow-sm"
            >
              {['all', 'buyer', 'artist', 'admin'].map(r => (
                <option key={r} value={r}>{r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Loading */}
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
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      {['User', 'Role', 'Phone', 'City', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{u.fullName}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_STYLE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">{u.phone || '—'}</td>
                        <td className="px-5 py-3 text-gray-600 text-xs">{u.city || '—'}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                        <td className="px-5 py-3">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === u._id ? null : u._id)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {openMenu === u._id && (
                              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[140px]">
                                {u.role !== 'admin' && (
                                  <button
                                    onClick={() => handleDelete(u._id)}
                                    disabled={deletingId === u._id}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    <Trash2 size={14} />
                                    {deletingId === u._id ? 'Deleting...' : 'Delete'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-400">No users found</div>
                )}
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {users.map(u => (
                  <div key={u._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.fullName}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${ROLE_STYLE[u.role] || ''}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{u.city || 'No city'}</span>
                      <span>Joined {formatDate(u.createdAt)}</span>
                    </div>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(u._id)}
                        disabled={deletingId === u._id}
                        className="mt-3 w-full py-2 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {deletingId === u._id ? 'Deleting...' : 'Delete User'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}