import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Image, Tag, DollarSign, FileText,
  CheckCircle, AlertCircle, Loader, X, Palette
} from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader  from './SellerHeader';
import { artworkAPI } from '../services/api';

const CATEGORIES = ['Landscape', 'Abstract', 'Traditional', 'Modern', 'Calligraphy', 'Portraits', 'Other'];

const UploadArtwork = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [message,     setMessage]     = useState({ type: '', text: '' });
  const [preview,     setPreview]     = useState(null);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    price:       '',
    category:    '',
    medium:      '',
    dimensions:  '',
    tags:        '',
    image:       null,
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 5MB' });
      return;
    }
    setForm(prev => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image: null }));
    setPreview(null);
  };

  const validateForm = () => {
    if (!form.title.trim())       { setMessage({ type:'error', text:'Title is required' });       return false; }
    if (!form.description.trim()) { setMessage({ type:'error', text:'Description is required' }); return false; }
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      setMessage({ type:'error', text:'Please enter a valid price' }); return false;
    }
    if (!form.category)  { setMessage({ type:'error', text:'Please select a category' }); return false; }
    if (!form.image)     { setMessage({ type:'error', text:'Please upload an image' });   return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('title',       form.title);
      formData.append('description', form.description);
      formData.append('price',       form.price);
      formData.append('category',    form.category);
      formData.append('medium',      form.medium);
      formData.append('dimensions',  form.dimensions);
      formData.append('tags',        form.tags);
      formData.append('image',       form.image);

      await artworkAPI.upload(formData);

      setMessage({ type: 'success', text: 'Artwork uploaded successfully!' });
      setTimeout(() => navigate('/seller/dashboard'), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Upload failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Upload Artwork"
          subtitle="Share your creation with the world"
        />

        <main className="p-4 md:p-6 w-full max-w-7xl mx-auto">

          {/* Message */}
          {message.text && (
            <div className={`mb-5 p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success'
                ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              }
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">

            {/* Left — Image Upload */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-indigo-600" /> Artwork Image
                </h2>

                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-700 text-sm font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Image ready to upload
                      </p>
                      <p className="text-green-600 text-xs mt-0.5">{form.image?.name}</p>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition group">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="font-bold text-gray-900 mb-1">Click to upload image</p>
                      <p className="text-gray-500 text-sm">JPG, PNG, WebP up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Tips */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Tips for better sales
                </h3>
                <ul className="space-y-2 text-sm text-indigo-800">
                  {[
                    'Use high quality, well-lit photos',
                    'Square images work best (1:1 ratio)',
                    'Write a detailed description',
                    'Set a competitive price',
                    'Add relevant tags for discoverability',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — Form Fields */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Artwork Details
              </h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="e.g. Sunset Over Hunza Valley"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Describe your artwork, inspiration, technique..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition resize-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Price (PKR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => handleChange('price', e.target.value)}
                    placeholder="e.g. 25000"
                    min="0"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleChange('category', cat)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        form.category === cat
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medium */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Medium <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.medium}
                  onChange={e => handleChange('medium', e.target.value)}
                  placeholder="e.g. Oil on canvas, Watercolor, Digital"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition"
                />
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Dimensions <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={e => handleChange('dimensions', e.target.value)}
                  placeholder="e.g. 24 x 36 inches"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tags <span className="text-gray-400 font-normal">(comma separated)</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.tags}
                    onChange={e => handleChange('tags', e.target.value)}
                    placeholder="e.g. mountains, nature, pakistan"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-5 h-5" /> Upload Artwork</>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UploadArtwork;