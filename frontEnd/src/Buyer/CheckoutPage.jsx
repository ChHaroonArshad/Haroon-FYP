import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ChevronLeft, ShoppingBag, MapPin, Phone, User,
  CreditCard, Truck, CheckCircle, Loader, AlertCircle,
  FileText, Package
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader  from './BuyerHeader';
import { artworkAPI } from '../services/api';
import { orderAPI }   from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CheckoutPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const artworkId = location.state?.artworkId || new URLSearchParams(location.search).get('artworkId');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [artwork,     setArtwork]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [placing,     setPlacing]     = useState(false);
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    fullName:      storedUser.fullName || '',
    phone:         storedUser.phone    || '',
    address:       storedUser.address  || '',
    city:          storedUser.city     || '',
    notes:         '',
    paymentMethod: 'cod',
  });

  useEffect(() => {
    const fetchArtwork = async () => {
      if (!artworkId) {
        setError('No artwork selected. Please go back and try again.');
        setLoading(false);
        return;
      }
      try {
        const data = await artworkAPI.getById(artworkId);
        setArtwork(data.artwork);
      } catch (err) {
        setError('Failed to load artwork details.');
      } finally {
        setLoading(false);
      }
    };
    fetchArtwork();
  }, [artworkId]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setError('');
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!form.phone.trim())    errors.phone    = 'Phone number is required';
    if (!form.address.trim())  errors.address  = 'Address is required';
    if (!form.city.trim())     errors.city     = 'City is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    setPlacing(true);
    setError('');

    try {
      const data = await orderAPI.create({
        artworkId:     artworkId,
        fullName:      form.fullName,
        phone:         form.phone,
        address:       form.address,
        city:          form.city,
        notes:         form.notes,
        paymentMethod: form.paymentMethod,
      });

      // Redirect to success
      navigate('/buyer/orders', {
        state: {
          orderPlaced:   true,
          orderNumber:   data.order.orderNumber,
          artworkTitle:  data.order.artworkTitle,
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const paymentMethods = [
    { id: 'cod',       label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive'    },
    { id: 'easypaisa', label: 'Easypaisa',         icon: '📱', desc: 'Mobile wallet payment'   },
    { id: 'jazzcash',  label: 'JazzCash',          icon: '📲', desc: 'Mobile wallet payment'   },
    { id: 'bank',      label: 'Bank Transfer',     icon: '🏦', desc: 'Direct bank transfer'    },
  ];

  const inputCls = (field) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition ${
      fieldErrors[field]
        ? 'border-red-300 focus:ring-red-200'
        : 'border-gray-200 focus:ring-purple-200 focus:border-purple-400'
    }`;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading checkout...</p>
        </div>
      </div>
    </div>
  );

  if (error && !artwork) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Checkout"
          subtitle="Complete your purchase"
        />

        <main className="p-4 md:p-6 max-w-5xl mx-auto">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm font-medium mb-5 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left — Form (2 cols) */}
            <div className="lg:col-span-2 space-y-5">

              {/* Delivery Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" /> Delivery Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      placeholder="Recipient full name"
                      className={inputCls('fullName')}
                    />
                    {fieldErrors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      placeholder="+92 300 1234567"
                      className={inputCls('phone')}
                    />
                    {fieldErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.address}
                      onChange={e => handleChange('address', e.target.value)}
                      placeholder="House no, street, area"
                      className={inputCls('address')}
                    />
                    {fieldErrors.address && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.city}
                      onChange={e => handleChange('city', e.target.value)}
                      placeholder="e.g. Islamabad"
                      className={inputCls('city')}
                    />
                    {fieldErrors.city && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Order Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      value={form.notes}
                      onChange={e => handleChange('notes', e.target.value)}
                      placeholder="Any special instructions..."
                      className={inputCls('notes')}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" /> Payment Method
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {paymentMethods.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => handleChange('paymentMethod', pm.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${
                        form.paymentMethod === pm.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{pm.icon}</span>
                      <div>
                        <p className={`font-bold text-sm ${form.paymentMethod === pm.id ? 'text-purple-700' : 'text-gray-900'}`}>
                          {pm.label}
                        </p>
                        <p className="text-xs text-gray-500">{pm.desc}</p>
                      </div>
                      {form.paymentMethod === pm.id && (
                        <CheckCircle className="w-5 h-5 text-purple-600 ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="space-y-4">

              {/* Artwork Card */}
              {artwork && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-purple-600" /> Order Summary
                  </h2>
                  <div className="flex gap-3 mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={getImageUrl(artwork.image)}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{artwork.title}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">by {artwork.artistName}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-lg font-medium">
                        {artwork.category}
                      </span>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 py-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Artwork Price</span>
                      <span className="font-semibold text-gray-900">PKR {artwork.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-2 border-t border-gray-100">
                      <span className="text-gray-900">Total</span>
                      <span className="text-purple-600 text-base">PKR {artwork.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
                      <Truck className="w-4 h-4" /> Estimated delivery: 5-7 business days
                    </div>
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-base hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-xl shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing
                  ? <><Loader className="w-5 h-5 animate-spin" /> Placing Order...</>
                  : <><Package className="w-5 h-5" /> Place Order</>
                }
              </button>

              <p className="text-center text-xs text-gray-400">
                By placing this order you agree to our Terms of Service
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CheckoutPage;