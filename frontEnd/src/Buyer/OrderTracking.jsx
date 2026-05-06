import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Package, Truck, CheckCircle,
  MapPin, Clock, Shield, Loader, AlertCircle,
  XCircle, MessageCircle
} from 'lucide-react';
import BuyerSidebar  from './BuyerSidebar';
import BuyerHeader   from './BuyerHeader';
import { orderAPI, messageAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const STATUS_STEPS = [
  {
    key:   'pending',
    label: 'Order Placed',
    desc:  'Your order has been received by the artist',
    icon:  Package,
  },
  {
    key:   'confirmed',
    label: 'Order Confirmed',
    desc:  'Artist has confirmed and is preparing your artwork',
    icon:  CheckCircle,
  },
  {
    key:   'in-transit',
    label: 'In Transit',
    desc:  'Your artwork is on its way to you',
    icon:  Truck,
  },
  {
    key:   'delivered',
    label: 'Delivered',
    desc:  'Your artwork has been delivered successfully',
    icon:  CheckCircle,
  },
];

const PAYMENT_LABELS = {
  cod:       'Cash on Delivery',
  easypaisa: 'Easypaisa',
  jazzcash:  'JazzCash',
  bank:      'Bank Transfer',
};

const STATUS_CONFIG = {
  pending:     { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Pending'    },
  confirmed:   { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Confirmed'  },
  'in-transit':{ bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Transit' },
  delivered:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Delivered'  },
  cancelled:   { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Cancelled'  },
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [order,        setOrder]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [chatLoading,  setChatLoading]  = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderAPI.getById(orderId);
        setOrder(data.order);
      } catch (err) {
        setError('Order not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  const handleChat = async () => {
    if (!order || chatLoading) return;
    setChatLoading(true);
    try {
      const data = await messageAPI.getOrCreateConversation(order.seller.toString());
      navigate('/buyer/messages', {
        state: { conversationId: data.conversation._id },
      });
    } catch (err) {
      navigate('/buyer/messages');
    } finally {
      setChatLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading order details...</p>
        </div>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────
  if (error || !order) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Order not found</h3>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => navigate('/buyer/orders')}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );

  // ── Cancelled order ──────────────────────────────────────
  if (order.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 min-w-0">
          <BuyerHeader
            onMenuClick={() => setSidebarOpen(true)}
            title="Order Tracking"
            subtitle={order.orderNumber || order._id}
          />
          <main className="p-4 md:p-6 max-w-2xl mx-auto">
            <button
              onClick={() => navigate('/buyer/orders')}
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm font-medium mb-5 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Orders
            </button>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Order Cancelled</h2>
              <p className="text-gray-500 text-sm mb-2">
                {order.orderNumber || order._id.toString().slice(-6).toUpperCase()}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                This order has been cancelled.
              </p>
              <button
                onClick={() => navigate('/buyer/browse')}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
              >
                Browse Artworks
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Calculate progress ───────────────────────────────────
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
  const progress = currentStepIndex === -1
    ? 0
    : Math.round(((currentStepIndex + 1) / STATUS_STEPS.length) * 100);

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Order Tracking"
          subtitle={order.orderNumber || order._id}
        />

        <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">

          {/* Back */}
          <button
            onClick={() => navigate('/buyer/orders')}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm font-medium transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Orders
          </button>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-gray-900">Delivery Progress</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Order placed {formatDate(order.createdAt)}
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Order Placed</span>
              <span className="font-bold text-purple-600">{progress}% Complete</span>
              <span>Delivered</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">

            {/* Timeline */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-6">Tracking Timeline</h2>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100 z-0" />

                <div className="space-y-6">
                  {STATUS_STEPS.map((step, i) => {
                    const isDone    = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    const Icon      = step.icon;

                    return (
                      <div key={step.key} className="flex gap-4 relative">
                        {/* Step circle */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${
                          isDone && !isCurrent
                            ? 'bg-green-500 border-green-500'
                            : isCurrent
                            ? 'bg-purple-600 border-purple-600 shadow-lg shadow-purple-200'
                            : 'bg-white border-gray-200'
                        }`}>
                          {isDone && !isCurrent ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : isCurrent ? (
                            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                          )}
                        </div>

                        {/* Step content */}
                        <div className={`flex-1 pb-2 ${!isDone && !isCurrent ? 'opacity-40' : ''}`}>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={`font-bold text-sm ${
                              isCurrent
                                ? 'text-purple-600'
                                : isDone
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}>
                              {step.label}
                            </h3>
                            {isCurrent && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg font-semibold flex-shrink-0">
                                Current
                              </span>
                            )}
                            {isDone && !isCurrent && (
                              <span className="text-xs text-green-600 font-semibold flex-shrink-0 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Done
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                          {isDone && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {i === 0
                                ? formatDate(order.createdAt)
                                : formatDate(order.updatedAt)
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivered celebration */}
              {order.status === 'delivered' && (
                <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="font-bold text-green-800 text-sm">Your artwork has been delivered!</p>
                  <p className="text-green-600 text-xs mt-0.5">
                    Thank you for supporting Pakistani artists
                  </p>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-4">

              {/* Artwork */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Artwork</h3>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={getImageUrl(order.artworkImage)}
                      alt={order.artworkTitle}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">
                      {order.artworkTitle}
                    </h4>
                    <p className="text-gray-500 text-xs">by {order.sellerName}</p>
                    <p className="text-purple-600 font-bold text-sm mt-0.5">
                      PKR {order.artworkPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Order Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order No.</span>
                    <span className="font-bold text-gray-900 text-xs">
                      {order.orderNumber || order._id.toString().slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Placed</span>
                    <span className="font-semibold text-gray-900 text-xs">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment</span>
                    <span className="font-semibold text-gray-900 text-xs">
                      {PAYMENT_LABELS[order.paymentMethod] || 'Cash on Delivery'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-2">
                    <span className="text-gray-500">Payment Status</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                      order.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {order.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-purple-600" /> Delivery Address
                </h3>
                <p className="text-sm font-bold text-gray-900">{order.fullName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.address}</p>
                <p className="text-xs text-gray-500">{order.city}</p>
                {order.phone && (
                  <p className="text-xs text-gray-500 mt-0.5">📞 {order.phone}</p>
                )}
                {order.notes && (
                  <p className="text-xs text-purple-600 mt-1 italic">
                    Note: {order.notes}
                  </p>
                )}
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-green-600" /> Payment Summary
                </h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Artwork</span>
                    <span>PKR {order.artworkPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between font-black text-gray-900 border-t border-gray-100 pt-2 mt-1">
                    <span>Total</span>
                    <span className="text-purple-600">
                      PKR {order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Artist */}
              <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Contact Artist</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {order.sellerName?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{order.sellerName}</p>
                    <p className="text-xs text-gray-500">Artist</p>
                  </div>
                </div>
                <button
                  onClick={handleChat}
                  disabled={chatLoading}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {chatLoading
                    ? <Loader className="w-4 h-4 animate-spin" />
                    : <MessageCircle className="w-4 h-4" />
                  }
                  Send Message
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderTracking;