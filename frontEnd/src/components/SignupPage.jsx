import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Palette, CheckCircle, AlertCircle, Loader, Check, X, Camera, UploadCloud } from 'lucide-react';
import AvatarEditor from 'react-avatar-editor';
import { authAPI } from '../services/api';

const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [showAdminOption, setShowAdminOption] = useState(false);

  // --- Image Upload State ---
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [scale, setScale] = useState(1);
  const [croppedImageFile, setCroppedImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    agreeTerms: false,
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateEmail = (email) => {
    const isValidFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
    if (!isValidFormat) return false;
    const localPart = email.split('@')[0];
    const isPurelyNumeric = /^\d+$/.test(localPart);
    return !isPurelyNumeric;
  };

  const validatePassword = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  });

  const getPasswordStrength = (password) => {
    const v = validatePassword(password);
    const score = Object.values(v).filter(Boolean).length;
    if (score <= 2) return { text: 'Weak', color: 'text-red-600', bg: 'bg-red-500' };
    if (score <= 3) return { text: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-500' };
    if (score <= 4) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-500' };
    return { text: 'Strong', color: 'text-green-600', bg: 'bg-green-500' };
  };

  const handleBlur = (field) => setTouched({ ...touched, [field]: true });

  const handleInputChange = (field, value) => {
    const sanitizedValue = typeof value === 'string' ? value.replace(/</g, "&lt;").replace(/>/g, "&gt;") : value;
    setFormData({ ...formData, [field]: sanitizedValue });
    setMessage({ type: '', text: '' });
  };

  // --- Image Handling Logic ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setShowCropper(true);
    }
  };

  const handleSaveCrop = () => {
    if (editorRef.current) {
      const canvasScaled = editorRef.current.getImageScaledToCanvas();
      canvasScaled.toBlob((blob) => {
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        setCroppedImageFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setShowCropper(false);
      }, 'image/jpeg', 0.95);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      setMessage({ type: 'error', text: 'Full name must be at least 3 characters.' });
      return false;
    }
    if (!validateEmail(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }
    const pv = validatePassword(formData.password);
    if (Object.values(pv).includes(false)) {
      setMessage({ type: 'error', text: 'Password does not meet all security requirements.' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return false;
    }
    if (!formData.agreeTerms) {
      setMessage({ type: 'error', text: 'You must agree to the Terms and Conditions.' });
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Use FormData to send both text and the image file
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName.trim());
      submitData.append('email', formData.email.trim().toLowerCase());
      submitData.append('password', formData.password);
      submitData.append('role', formData.role);

      if (croppedImageFile) {
        submitData.append('avatar', croppedImageFile);
      }

      const response = await authAPI.signup(submitData);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setMessage({ type: 'success', text: 'Account created successfully! Redirecting...' });

      setTimeout(() => {
        const routeMap = { artist: '/seller/home', admin: '/admin/dashboard', buyer: '/buyer/home' };
        navigate(routeMap[response.user.role] || '/buyer/home');
      }, 1500);

    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Signup failed.' });
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);
  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Palette className="w-10 h-10 text-purple-400" />
            <span className="text-3xl font-extrabold text-white tracking-tight">ArtBazaar</span>
          </div>
          <p className="text-gray-300 font-medium">Pakistan's Premier Art Marketplace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 transition-all ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-gray-500 mb-6 text-sm">Join the marketplace to buy or sell exclusive art.</p>

          {/* --- Image Cropper Modal --- */}
          {showCropper && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4">Adjust Profile Picture</h3>
                <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
                  <AvatarEditor
                    ref={editorRef}
                    image={selectedImage}
                    width={200}
                    height={200}
                    border={30}
                    borderRadius={100} // Circular crop visual
                    color={[255, 255, 255, 0.6]}
                    scale={scale}
                    rotate={0}
                  />
                </div>
                <div className="w-full mb-6">
                  <label className="text-sm text-gray-600 block mb-2 text-center">Zoom</label>
                  <input
                    type="range"
                    value={scale}
                    min="1"
                    max="3"
                    step="0.01"
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setShowCropper(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSaveCrop} className="flex-1 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">Apply</button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5" noValidate>

            {/* Profile Picture Upload UI */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center overflow-hidden bg-purple-50 group-hover:border-purple-500 transition-colors">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-purple-400 group-hover:text-purple-600 transition-colors" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-purple-600 p-1.5 rounded-full cursor-pointer hover:bg-purple-700 shadow-md transition-transform hover:scale-105">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Upload Profile Picture (Optional)</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all ${touched.fullName && formData.fullName.length < 3 ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="e.g. Ahmed Ali"
                  maxLength={50}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all ${touched.email && !validateEmail(formData.email) ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Role Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Account Type <span className="text-red-500">*</span>
              </label>

              <input
                type="password"
                placeholder="Enter Admin Key..."
                className="w-full mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                onChange={(e) => {
                  setAdminKey(e.target.value);
                  if (e.target.value === "YOUR_SECRET_KEY") setShowAdminOption(true);
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                {['buyer', 'artist', showAdminOption ? 'admin' : null].filter(Boolean).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleInputChange('role', r)}
                    className={`p-3 border rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${formData.role === r ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100'}`}
                  >
                    {r === 'buyer' ? '🛍️ Buyer' : r === 'artist' ? '🎨 Artist' : '👑 Admin'}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  placeholder="Create a secure password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {formData.password && (
                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.bg} transition-all duration-500 ease-out`}
                        style={{ width: `${(Object.values(passwordValidation).filter(Boolean).length / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${passwordStrength.color}`}>{passwordStrength.text}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'length', label: '8+ Characters' },
                      { key: 'uppercase', label: 'Uppercase' },
                      { key: 'lowercase', label: 'Lowercase' },
                      { key: 'number', label: 'Number' },
                      { key: 'special', label: 'Special (!@#)' },
                    ].map(({ key, label }) => (
                      <div key={key} className={`text-[11px] font-medium flex items-center gap-1.5 ${passwordValidation[key] ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation[key] ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all ${touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start cursor-pointer mt-2 group">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 transition-colors"
                  required
                />
              </div>
              <span className="ml-2.5 text-sm text-gray-600 leading-tight group-hover:text-gray-800 transition-colors">
                I agree to the{' '}
                <a href="/terms" className="text-purple-600 hover:text-purple-800 font-semibold underline decoration-transparent hover:decoration-purple-600 transition-all">Terms</a>
                {' '}and{' '}
                <a href="/privacy" className="text-purple-600 hover:text-purple-800 font-semibold underline decoration-transparent hover:decoration-purple-600 transition-all">Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !formData.agreeTerms}
              className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
            >
              {loading ? <><Loader className="w-5 h-5 animate-spin" /> Processing...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-8">
            Already have an account?{' '}
            <a href="/login" className="text-purple-600 hover:text-purple-800 font-bold transition-colors">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;