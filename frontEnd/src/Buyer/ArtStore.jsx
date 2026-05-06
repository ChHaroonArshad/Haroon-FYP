import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Plus, Minus, X, Star,
  Truck, Package, Grid, List, Tag, Sparkles
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader  from './BuyerHeader';

const CATEGORIES = [
  { name: 'All',         icon: '🎨', count: 45 },
  { name: 'Paints',      icon: '🖌️', count: 12 },
  { name: 'Brushes',     icon: '✏️', count: 15 },
  { name: 'Canvas',      icon: '🖼️', count: 8  },
  { name: 'Sketchbooks', icon: '📓', count: 6  },
  { name: 'Tools',       icon: '🔧', count: 10 },
  { name: 'Digital',     icon: '💻', count: 4  },
];

const PRODUCTS = [
  {
    id: 1,
    name:          'Professional Acrylic Set',
    description:   '24 vibrant colors, 12ml tubes, lightfast pigments',
    price:         3500,
    originalPrice: 4200,
    category:      'Paints',
    rating:        4.8,
    reviews:       127,
    inStock:       true,
    stock:         15,
    badge:         'Bestseller',
    badgeColor:    'bg-purple-600',
    gradient:      'from-purple-100 to-pink-100',
    emoji:         '🎨',
  },
  {
    id: 2,
    name:          'Artist Brush Set (12pc)',
    description:   'Premium hog bristle & synthetic mix, all sizes',
    price:         2200,
    originalPrice: null,
    category:      'Brushes',
    rating:        4.9,
    reviews:       98,
    inStock:       true,
    stock:         22,
    badge:         'Top Rated',
    badgeColor:    'bg-amber-500',
    gradient:      'from-amber-100 to-orange-100',
    emoji:         '🖌️',
  },
  {
    id: 3,
    name:          'Stretched Canvas Set of 5',
    description:   '16×20 inches, triple primed, acid-free',
    price:         4500,
    originalPrice: null,
    category:      'Canvas',
    rating:        4.7,
    reviews:       86,
    inStock:       true,
    stock:         8,
    badge:         null,
    badgeColor:    '',
    gradient:      'from-blue-100 to-indigo-100',
    emoji:         '🖼️',
  },
  {
    id: 4,
    name:          'Premium Sketchbook A4',
    description:   '180gsm, 80 sheets, hardbound, perforated pages',
    price:         1800,
    originalPrice: null,
    category:      'Sketchbooks',
    rating:        4.6,
    reviews:       142,
    inStock:       true,
    stock:         35,
    badge:         null,
    badgeColor:    '',
    gradient:      'from-green-100 to-teal-100',
    emoji:         '📓',
  },
  {
    id: 5,
    name:          'Watercolor Paint Set (36)',
    description:   'Professional grade, vibrant pigments, pan format',
    price:         5200,
    originalPrice: 6500,
    category:      'Paints',
    rating:        5.0,
    reviews:       76,
    inStock:       true,
    stock:         12,
    badge:         'Premium',
    badgeColor:    'bg-indigo-600',
    gradient:      'from-cyan-100 to-blue-100',
    emoji:         '💧',
  },
  {
    id: 6,
    name:          'Digital Drawing Tablet',
    description:   '10×6 inch active area, 8192 pressure levels',
    price:         15000,
    originalPrice: null,
    category:      'Digital',
    rating:        4.9,
    reviews:       54,
    inStock:       true,
    stock:         5,
    badge:         'Hot Deal',
    badgeColor:    'bg-red-500',
    gradient:      'from-slate-100 to-gray-100',
    emoji:         '💻',
  },
  {
    id: 7,
    name:          'Palette Knife Set (5pc)',
    description:   'Stainless steel, ergonomic handles, various shapes',
    price:         1200,
    originalPrice: null,
    category:      'Tools',
    rating:        4.5,
    reviews:       63,
    inStock:       true,
    stock:         28,
    badge:         null,
    badgeColor:    '',
    gradient:      'from-rose-100 to-pink-100',
    emoji:         '🔧',
  },
  {
    id: 8,
    name:          'Oil Paint Starter Kit',
    description:   '12 colors, 37ml tubes, professional artist quality',
    price:         6800,
    originalPrice: null,
    category:      'Paints',
    rating:        4.8,
    reviews:       91,
    inStock:       false,
    stock:         0,
    badge:         null,
    badgeColor:    '',
    gradient:      'from-yellow-100 to-orange-100',
    emoji:         '🟡',
  },
  {
    id: 9,
    name:          'Adjustable Easel Stand',
    description:   'Beechwood tripod, portable, holds up to 48" canvas',
    price:         8500,
    originalPrice: null,
    category:      'Tools',
    rating:        4.7,
    reviews:       45,
    inStock:       true,
    stock:         7,
    badge:         null,
    badgeColor:    '',
    gradient:      'from-amber-100 to-yellow-100',
    emoji:         '🪵',
  },
];

export default function ArtStore() {
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [viewMode,          setViewMode]          = useState('grid');
  const [selectedCategory,  setSelectedCategory]  = useState('All');
  const [cart,              setCart]              = useState([]);
  const [showCart,          setShowCart]          = useState(false);
  const [searchQuery,       setSearchQuery]       = useState('');

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
          .filter(i => i.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const filtered = PRODUCTS.filter(p =>
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Art Store"
          subtitle="Premium quality supplies"
          searchPlaceholder="Search supplies..."
          searchValue={searchQuery}
          onSearchChange={e => setSearchQuery(e.target.value)}
        />

        <main className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">

          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '25px 25px' }}
            />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="text-purple-200 text-sm font-semibold">Artist Supplies Store</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                  Premium Art Supplies
                </h1>
                <p className="text-purple-200 text-sm mb-4">
                  Professional grade materials for every artist
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="flex items-center gap-1.5 bg-white/20 border border-white/30 px-3 py-1.5 rounded-xl text-white font-semibold">
                    <Truck className="w-3.5 h-3.5" /> Free shipping over PKR 5,000
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/20 border border-white/30 px-3 py-1.5 rounded-xl text-white font-semibold">
                    <Package className="w-3.5 h-3.5" /> 100% Authentic Products
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCart(true)}
                className="relative flex-shrink-0 p-3.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-2xl transition"
              >
                <ShoppingCart className="w-6 h-6 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-black shadow-lg">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  selectedCategory === cat.name
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
                <span className={`text-xs px-1.5 py-0.5 rounded-lg font-bold ${
                  selectedCategory === cat.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">{filtered.length}</span> products
              {selectedCategory !== 'All' && (
                <span className="text-purple-600 font-semibold"> in {selectedCategory}</span>
              )}
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

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-bold text-gray-900 mb-1">No products found</p>
              <p className="text-gray-500 text-sm">Try a different search or category</p>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => {
                const inCart = cart.find(i => i.id === p.id);
                const discount = p.originalPrice
                  ? Math.round((1 - p.price / p.originalPrice) * 100)
                  : null;

                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    {/* Product Image Area */}
                    <div className={`relative h-44 bg-gradient-to-br ${p.gradient} flex items-center justify-center overflow-hidden`}>
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                        {p.emoji}
                      </span>
                      {p.badge && (
                        <span className={`absolute top-3 left-3 ${p.badgeColor} text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md`}>
                          {p.badge}
                        </span>
                      )}
                      {discount && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-xl shadow-md">
                          -{discount}%
                        </span>
                      )}
                      {!p.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-4 py-2 bg-red-500 text-white text-sm font-black rounded-xl">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-lg">
                          {p.category}
                        </span>
                        {p.inStock && p.stock <= 10 && (
                          <span className="text-xs text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-lg">
                            Only {p.stock} left
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-900 text-sm mt-2 mb-0.5">{p.name}</h3>
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{p.description}</p>

                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(p.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                        <span className="text-xs font-semibold text-gray-700 ml-0.5">{p.rating}</span>
                        <span className="text-xs text-gray-400">({p.reviews})</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-purple-600 font-black text-lg">
                          PKR {p.price.toLocaleString()}
                        </span>
                        {p.originalPrice && (
                          <span className="text-gray-400 line-through text-sm">
                            PKR {p.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {inCart ? (
                        <div className="flex items-center justify-between bg-purple-50 rounded-xl p-1.5 border border-purple-100">
                          <button
                            onClick={() => updateQty(p.id, -1)}
                            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-100 transition"
                          >
                            <Minus className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                          <span className="font-black text-purple-700 text-sm">{inCart.quantity} in cart</span>
                          <button
                            onClick={() => updateQty(p.id, 1)}
                            className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm hover:bg-purple-700 transition"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(p)}
                          disabled={!p.inStock}
                          className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                            p.inStock
                              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {p.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map(p => {
                const inCart   = cart.find(i => i.id === p.id);
                const discount = p.originalPrice
                  ? Math.round((1 - p.price / p.originalPrice) * 100)
                  : null;

                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex">
                    <div className={`w-24 h-24 bg-gradient-to-br ${p.gradient} flex items-center justify-center flex-shrink-0 text-4xl relative`}>
                      {p.emoji}
                      {!p.inStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-black">SOLD OUT</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-gray-900 text-sm">{p.name}</h3>
                            {p.badge && (
                              <span className={`${p.badgeColor} text-white text-xs font-black px-2 py-0.5 rounded-lg`}>
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mb-1">{p.description}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-700">{p.rating}</span>
                            <span className="text-xs text-gray-400">({p.reviews})</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {p.originalPrice && (
                            <p className="text-gray-400 line-through text-xs">
                              PKR {p.originalPrice.toLocaleString()}
                            </p>
                          )}
                          <p className="text-purple-600 font-black text-base">
                            PKR {p.price.toLocaleString()}
                          </p>
                          {discount && (
                            <span className="text-xs text-red-600 font-bold">-{discount}% OFF</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-2 py-1 border border-purple-100">
                            <button onClick={() => updateQty(p.id, -1)} className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <Minus className="w-3 h-3 text-gray-700" />
                            </button>
                            <span className="font-black text-purple-700 text-sm">{inCart.quantity}</span>
                            <button onClick={() => updateQty(p.id, 1)} className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(p)}
                            disabled={!p.inStock}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                              p.inStock
                                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {p.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600">
              <div>
                <h2 className="font-black text-white text-lg">Your Cart</h2>
                <p className="text-purple-200 text-xs">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                  <p className="font-bold text-gray-500">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">Add some supplies!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-purple-600 font-black text-sm">
                          PKR {item.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
                          >
                            <Minus className="w-3 h-3 text-gray-700" />
                          </button>
                          <span className="font-black text-gray-900 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-700 transition"
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                          <button
                            onClick={() => updateQty(item.id, -item.quantity)}
                            className="ml-auto p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">PKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-bold ${cartTotal >= 5000 ? 'text-green-600' : 'text-gray-700'}`}>
                      {cartTotal >= 5000 ? '🎉 FREE' : 'PKR 200'}
                    </span>
                  </div>
                  {cartTotal < 5000 && (
                    <p className="text-xs text-purple-600 font-semibold bg-purple-50 px-3 py-1.5 rounded-lg">
                      Add PKR {(5000 - cartTotal).toLocaleString()} more for free shipping!
                    </p>
                  )}
                  <div className="flex justify-between font-black text-gray-900 text-lg pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-purple-600">
                      PKR {(cartTotal + (cartTotal >= 5000 ? 0 : 200)).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black hover:opacity-90 transition shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}