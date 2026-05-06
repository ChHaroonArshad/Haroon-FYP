

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Palette, CheckCircle, AlertCircle, Loader, Check, X } from 'lucide-react';
import { authAPI } from '../services/api';

const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => ({
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
  });

  const getPasswordStrength = (password) => {
    const v = validatePassword(password);
    const score = Object.values(v).filter(Boolean).length;
    if (score <= 1) return { text: 'Weak',   color: 'text-red-600',    bg: 'bg-red-500' };
    if (score <= 2) return { text: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-500' };
    if (score <= 3) return { text: 'Good',   color: 'text-blue-600',   bg: 'bg-blue-500' };
    return           { text: 'Strong', color: 'text-green-600',  bg: 'bg-green-500' };
  };

  const handleBlur = (field) => setTouched({ ...touched, [field]: true });
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      setMessage({ type: 'error', text: 'Full name must be at least 3 characters' });
      return false;
    }
    if (!validateEmail(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return false;
    }
    const pv = validatePassword(formData.password);
    if (!pv.length || !pv.uppercase || !pv.lowercase || !pv.number) {
      setMessage({ type: 'error', text: 'Password must be 8+ chars with uppercase, lowercase and a number' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return false;
    }
    if (!formData.agreeTerms) {
      setMessage({ type: 'error', text: 'Please agree to Terms and Conditions' });
      return false;
    }
    return true;
  };

  // ── REAL SIGNUP — saves to MongoDB ──
  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.signup({
        fullName: formData.fullName,
        email:    formData.email,
        password: formData.password,
        role:     formData.role,
      });

      // Save token and user to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setMessage({ type: 'success', text: 'Account created successfully! Redirecting...' });

      setTimeout(() => {
        if (response.user.role === 'artist') navigate('/seller/home');
        else if (response.user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/buyer/home');
      }, 1000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);
  const passwordStrength   = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Palette className="w-10 h-10 text-white" />
            <span className="text-3xl font-bold text-white">ArtBazaar</span>
          </div>
          <p className="text-white/80">Pakistan's Premier Art Marketplace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success'
                ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                : <AlertCircle className="w-5 h-5 flex-shrink-0" />
              }
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600 mb-6">Join the art community today</p>

          <div className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none ${
                    touched.fullName && formData.fullName.length < 3 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ahmed Ali"
                />
              </div>
              {touched.fullName && formData.fullName.length > 0 && formData.fullName.length < 3 && (
                <p className="text-red-500 text-xs mt-1">Name must be at least 3 characters</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none ${
                    touched.email && !validateEmail(formData.email) ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>
              {touched.email && formData.email && !validateEmail(formData.email) && (
                <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to join as <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['buyer', 'artist'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleInputChange('role', r)}
                    className={`p-3 border-2 rounded-lg font-medium transition ${
                      formData.role === r
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-300 text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    {r === 'buyer' ? '🛍️ Buyer' : '🎨 Artist'}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.bg} transition-all duration-300`}
                        style={{ width: `${(Object.values(passwordValidation).filter(Boolean).length / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.text}</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { key: 'length',    label: 'At least 8 characters' },
                      { key: 'uppercase', label: 'One uppercase letter' },
                      { key: 'lowercase', label: 'One lowercase letter' },
                      { key: 'number',    label: 'One number' },
                    ].map(({ key, label }) => (
                      <div key={key} className={`text-xs flex items-center gap-1 ${passwordValidation[key] ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation[key] ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none ${
                    touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
              />
              <span className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">Terms and Conditions</a>
                {' '}and{' '}
                <a href="/privacy-policy" className="text-purple-600 hover:text-purple-700 font-medium">Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader className="w-5 h-5 animate-spin" /> Creating Account...</>
                : 'Create Account'
              }
            </button>
          </div>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">Sign In</a>
          </p>
        </div>

        <p className="text-center text-white/80 text-sm mt-6">
          © 2026 ArtBazaar. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
// code with OT
//  import { authAPI } from '../services/api';
// import React, { useState } from 'react';
// import { Mail, Lock, User, Eye, EyeOff, Palette, CheckCircle, AlertCircle, Loader, Check, X } from 'lucide-react';

// const SignupPage = () => {
//   const [currentStep, setCurrentStep] = useState('signup'); // 'signup' or 'verify'
//   const [loading, setLoading] = useState(false);
//   const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   // Form state
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: 'buyer',
//     agreeTerms: false
//   });

//   // Validation states
//   const [touched, setTouched] = useState({
//     fullName: false,
//     email: false,
//     password: false,
//     confirmPassword: false
//   });

//   // Validation functions
//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   const validatePassword = (password) => {
//     return {
//       length: password.length >= 8,
//       uppercase: /[A-Z]/.test(password),
//       lowercase: /[a-z]/.test(password),
//       number: /[0-9]/.test(password),
//       special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
//     };
//   };

//   const getPasswordStrength = (password) => {
//     const validation = validatePassword(password);
//     const score = Object.values(validation).filter(Boolean).length;
//     if (score <= 2) return { text: 'Weak', color: 'text-red-600', bg: 'bg-red-600' };
//     if (score <= 3) return { text: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-600' };
//     if (score <= 4) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-600' };
//     return { text: 'Strong', color: 'text-green-600', bg: 'bg-green-600' };
//   };

//   // Handle field blur
//   const handleBlur = (field) => {
//     setTouched({ ...touched, [field]: true });
//   };

//   // Handle input change
//   const handleInputChange = (field, value) => {
//     setFormData({ ...formData, [field]: value });
//     setMessage({ type: '', text: '' });
//   };

//   // Validate form
//   const validateForm = () => {
//     if (!formData.fullName.trim()) {
//       setMessage({ type: 'error', text: 'Full name is required' });
//       return false;
//     }

//     if (formData.fullName.trim().length < 3) {
//       setMessage({ type: 'error', text: 'Full name must be at least 3 characters' });
//       return false;
//     }

//     if (!validateEmail(formData.email)) {
//       setMessage({ type: 'error', text: 'Please enter a valid email address' });
//       return false;
//     }

//     if (formData.password.length < 8) {
//       setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
//       return false;
//     }

//     const passwordValidation = validatePassword(formData.password);
//     if (!passwordValidation.uppercase || !passwordValidation.lowercase || !passwordValidation.number) {
//       setMessage({ type: 'error', text: 'Password must contain uppercase, lowercase, and numbers' });
//       return false;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setMessage({ type: 'error', text: 'Passwords do not match' });
//       return false;
//     }

//     if (!formData.agreeTerms) {
//       setMessage({ type: 'error', text: 'Please agree to Terms and Conditions' });
//       return false;
//     }

//     return true;
//   };

//   // Handle Signup
//   const handleSignup = () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     // Simulate API call to register user and send OTP
//     setTimeout(() => {
//       setLoading(false);
//       setMessage({ type: 'success', text: '6-digit OTP sent to your email!' });
//       setCurrentStep('verify');
      
//       // TODO: Replace with actual API call
//       // const response = await fetch('/api/auth/register', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({
//       //     fullName: formData.fullName,
//       //     email: formData.email,
//       //     password: formData.password,
//       //     role: formData.role
//       //   })
//       // });
//     }, 1500);
//   };

//   // Handle Verification Code Input
//   const handleVerificationInput = (index, value) => {
//     if (!/^\d*$/.test(value)) return; // Only allow numbers
//     if (value.length > 1) return;
    
//     const newCode = [...verificationCode];
//     newCode[index] = value;
//     setVerificationCode(newCode);

//     // Auto-focus next input
//     if (value && index < 5) {
//       const nextInput = document.getElementById(`otp-${index + 1}`);
//       if (nextInput) nextInput.focus();
//     }
//   };

//   // Handle backspace in OTP
//   const handleKeyDown = (index, e) => {
//     if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
//       const prevInput = document.getElementById(`otp-${index - 1}`);
//       if (prevInput) prevInput.focus();
//     }
//   };

//   // Handle Verify OTP
//   const handleVerifyOTP = () => {
//     const otp = verificationCode.join('');
    
//     if (otp.length !== 6) {
//       setMessage({ type: 'error', text: 'Please enter complete 6-digit OTP' });
//       return;
//     }

//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     // Simulate API call to verify OTP
//     setTimeout(() => {
//       setLoading(false);
//       setMessage({ type: 'success', text: 'Email verified successfully! Redirecting to dashboard...' });
      
//       // TODO: Replace with actual API call and redirect
//       // const response = await fetch('/api/auth/verify-otp', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({ email: formData.email, otp })
//       // });
//       // if (response.ok) {
//       //   // Store JWT token
//       //   // Redirect to appropriate dashboard based on role
//       // }
//     }, 1500);
//   };

//   // Resend OTP
//   const handleResendOTP = () => {
//     setLoading(true);
//     setVerificationCode(['', '', '', '', '', '']);
    
//     setTimeout(() => {
//       setLoading(false);
//       setMessage({ type: 'success', text: 'New OTP sent to your email!' });
      
//       // TODO: Replace with actual API call
//       // await fetch('/api/auth/resend-otp', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({ email: formData.email })
//       // });
//     }, 1000);
//   };

//   const passwordValidation = validatePassword(formData.password);
//   const passwordStrength = getPasswordStrength(formData.password);

//   return (
//     <div className="min-h-screen bg-gradient-to-br  from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/20"></div>
      
//       <div className="relative z-10 w-full max-w-md">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center space-x-2 mb-2">
//             <Palette className="w-10 h-10 text-white" />
//             <span className="text-3xl font-bold text-white">ArtBazaar</span>
//           </div>
//           <p className="text-white/80">Pakistan's Premier Art Marketplace</p>
//         </div>

//         {/* Main Card */}
//         <div className="bg-white rounded-2xl shadow-2xl p-8">
//           {/* Progress Indicator */}
//           <div className="flex items-center justify-center mb-6">
//             <div className="flex items-center">
//               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                 currentStep === 'signup' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
//               }`}>
//                 {currentStep === 'verify' ? <Check className="w-5 h-5" /> : '1'}
//               </div>
//               <div className={`w-20 h-1 ${currentStep === 'verify' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
//               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                 currentStep === 'verify' ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
//               }`}>
//                 2
//               </div>
//             </div>
//           </div>

//           {/* Message Alert */}
//           {message.text && (
//             <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
//               message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
//             }`}>
//               {message.type === 'success' ? (
//                 <CheckCircle className="w-5 h-5" />
//               ) : (
//                 <AlertCircle className="w-5 h-5" />
//               )}
//               <span className="text-sm">{message.text}</span>
//             </div>
//           )}

//           {/* SIGNUP FORM */}
//           {currentStep === 'signup' && (
//             <div>
//               <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
//               <p className="text-gray-600 mb-6">Join the art community today</p>

//               <div className="space-y-4">
//                 {/* Full Name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Full Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       value={formData.fullName}
//                       onChange={(e) => handleInputChange('fullName', e.target.value)}
//                       onBlur={() => handleBlur('fullName')}
//                       className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
//                         touched.fullName && formData.fullName.length < 3 ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                       placeholder="John Doe"
//                     />
//                   </div>
//                   {touched.fullName && formData.fullName.length > 0 && formData.fullName.length < 3 && (
//                     <p className="text-red-500 text-xs mt-1">Name must be at least 3 characters</p>
//                   )}
//                 </div>

//                 {/* Email */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) => handleInputChange('email', e.target.value)}
//                       onBlur={() => handleBlur('email')}
//                       className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
//                         touched.email && !validateEmail(formData.email) ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                       placeholder="your.email@example.com"
//                     />
//                   </div>
//                   {touched.email && formData.email && !validateEmail(formData.email) && (
//                     <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
//                   )}
//                 </div>

//                 {/* Role Selection */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     I want to join as <span className="text-red-500">*</span>
//                   </label>
//                   <div className="grid grid-cols-2 gap-3">
//                     <button
//                       type="button"
//                       onClick={() => handleInputChange('role', 'buyer')}
//                       className={`p-3 border-2 rounded-lg font-medium transition ${
//                         formData.role === 'buyer'
//                           ? 'border-purple-600 bg-purple-50 text-purple-600'
//                           : 'border-gray-300 text-gray-700 hover:border-purple-300'
//                       }`}
//                     >
//                       🛍️ Buyer
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => handleInputChange('role', 'artist')}
//                       className={`p-3 border-2 rounded-lg font-medium transition ${
//                         formData.role === 'artist'
//                           ? 'border-purple-600 bg-purple-50 text-purple-600'
//                           : 'border-gray-300 text-gray-700 hover:border-purple-300'
//                       }`}
//                     >
//                       🎨 Artist
//                     </button>
//                   </div>
//                 </div>

//                 {/* Password */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Password <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={formData.password}
//                       onChange={(e) => handleInputChange('password', e.target.value)}
//                       onBlur={() => handleBlur('password')}
//                       className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//                       placeholder="Min. 8 characters"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                     </button>
//                   </div>
                  
//                   {/* Password Strength */}
//                   {formData.password && (
//                     <div className="mt-2">
//                       <div className="flex items-center gap-2 mb-2">
//                         <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
//                           <div 
//                             className={`h-full ${passwordStrength.bg} transition-all duration-300`}
//                             style={{ width: `${(Object.values(passwordValidation).filter(Boolean).length / 5) * 100}%` }}
//                           ></div>
//                         </div>
//                         <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.text}</span>
//                       </div>
                      
//                       {/* Password Requirements */}
//                       <div className="space-y-1">
//                         <div className={`text-xs flex items-center gap-1 ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
//                           {passwordValidation.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
//                           At least 8 characters
//                         </div>
//                         <div className={`text-xs flex items-center gap-1 ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
//                           {passwordValidation.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
//                           One uppercase letter
//                         </div>
//                         <div className={`text-xs flex items-center gap-1 ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
//                           {passwordValidation.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
//                           One lowercase letter
//                         </div>
//                         <div className={`text-xs flex items-center gap-1 ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
//                           {passwordValidation.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
//                           One number
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Confirm Password */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Confirm Password <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type={showConfirmPassword ? 'text' : 'password'}
//                       value={formData.confirmPassword}
//                       onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
//                       onBlur={() => handleBlur('confirmPassword')}
//                       className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
//                         touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword 
//                           ? 'border-red-500' 
//                           : 'border-gray-300'
//                       }`}
//                       placeholder="Re-enter password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                     </button>
//                   </div>
//                   {touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword && (
//                     <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
//                   )}
//                   {formData.confirmPassword && formData.password === formData.confirmPassword && (
//                     <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
//                       <Check className="w-3 h-3" /> Passwords match
//                     </p>
//                   )}
//                 </div>

//                 {/* Terms Checkbox */}
//                 <label className="flex items-start cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={formData.agreeTerms}
//                     onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
//                     className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
//                   />
//                   <span className="ml-2 text-sm text-gray-700">
//                     I agree to the{' '}
//                     <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
//                       Terms and Conditions
//                     </a>{' '}
//                     and{' '}
//                     <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
//                       Privacy Policy
//                     </a>
//                   </span>
//                 </label>

//                 {/* Submit Button */}
//                 <button
//                   onClick={handleSignup}
//                   disabled={loading}
//                   className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader className="w-5 h-5 animate-spin" />
//                       Creating Account...
//                     </>
//                   ) : (
//                     'Create Account & Send OTP'
//                   )}
//                 </button>
//               </div>

//               {/* Login Link */}
//               <p className="text-center text-gray-600 mt-6">
//                 Already have an account?{' '}
//                 <a href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
//                   Sign In
//                 </a>
//               </p>
//             </div>
//           )}

//           {/* EMAIL VERIFICATION (OTP) */}
//           {currentStep === 'verify' && (
//             <div className="text-center">
//               <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <Mail className="w-8 h-8 text-purple-600" />
//               </div>

//               <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
//               <p className="text-gray-600 mb-2">
//                 We've sent a 6-digit OTP to
//               </p>
//               <p className="font-semibold text-gray-900 mb-8">{formData.email}</p>

//               <div className="space-y-6">
//                 {/* OTP Input Boxes */}
//                 <div className="flex justify-center gap-3">
//                   {verificationCode.map((digit, index) => (
//                     <input
//                       key={index}
//                       id={`otp-${index}`}
//                       type="text"
//                       inputMode="numeric"
//                       maxLength={1}
//                       value={digit}
//                       onChange={(e) => handleVerificationInput(index, e.target.value)}
//                       onKeyDown={(e) => handleKeyDown(index, e)}
//                       className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none"
//                     />
//                   ))}
//                 </div>

//                 {/* Verify Button */}
//                 <button
//                   onClick={handleVerifyOTP}
//                   disabled={loading}
//                   className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader className="w-5 h-5 animate-spin" />
//                       Verifying...
//                     </>
//                   ) : (
//                     'Verify Email'
//                   )}
//                 </button>
//               </div>

//               {/* Resend OTP */}
//               <div className="mt-6">
//                 <p className="text-gray-600 text-sm mb-2">Didn't receive the OTP?</p>
//                 <button
//                   onClick={handleResendOTP}
//                   disabled={loading}
//                   className="text-purple-600 hover:text-purple-700 font-semibold text-sm disabled:opacity-50"
//                 >
//                   Resend OTP
//                 </button>
//               </div>

//               {/* Change Email */}
//               <button
//                 onClick={() => setCurrentStep('signup')}
//                 className="text-gray-600 hover:text-gray-900 text-sm mt-4"
//               >
//                 Change email address
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <p className="text-center text-white/80 text-sm mt-6">
//           © 2026 ArtBazaar. All rights reserved.
//         </p>
//       </div>
//     </div>
//   );
// };

// // ... existing code ...

// // Handle Signup
// const handleSignup = async () => {
//   if (!validateForm()) return;

//   setLoading(true);
//   setMessage({ type: '', text: '' });

//   try {
//     const response = await authAPI.signup({
//       fullName: formData.fullName,
//       email: formData.email,
//       password: formData.password,
//       role: formData.role
//     });

//     setLoading(false);
//     setMessage({ type: 'success', text: response.message });
//     setCurrentStep('verify');
//   } catch (error) {
//     setLoading(false);
//     setMessage({
//       type: 'error',
//       text: error.response?.data?.message || 'Signup failed. Please try again.'
//     });
//   }
// };

// // Handle Verify OTP
// const handleVerifyOTP = async () => {
//   const otp = verificationCode.join('');
  
//   if (otp.length !== 6) {
//     setMessage({ type: 'error', text: 'Please enter complete 6-digit OTP' });
//     return;
//   }

//   setLoading(true);
//   setMessage({ type: '', text: '' });

//   try {
//     const response = await authAPI.verifyOTP(formData.email, otp);

//     // Store token
//     localStorage.setItem('token', response.token);
//     localStorage.setItem('user', JSON.stringify(response.user));

//     setLoading(false);
//     setMessage({ type: 'success', text: 'Email verified successfully!' });

//     // Redirect based on role
//     setTimeout(() => {
//       if (response.user.role === 'artist') {
//         window.location.href = '/artist/dashboard';
//       } else {
//         window.location.href = '/buyer/dashboard';
//       }
//     }, 1500);
//   } catch (error) {
//     setLoading(false);
//     setMessage({
//       type: 'error',
//       text: error.response?.data?.message || 'Verification failed'
//     });
//   }
// };

// // Resend OTP
// const handleResendOTP = async () => {
//   setLoading(true);
//   setVerificationCode(['', '', '', '', '', '']);
  
//   try {
//     const response = await authAPI.resendOTP(formData.email);
//     setLoading(false);
//     setMessage({ type: 'success', text: response.message });
//   } catch (error) {
//     setLoading(false);
//     setMessage({
//       type: 'error',
//       text: error.response?.data?.message || 'Failed to resend OTP'
//     });
//   }
// };

// export default SignupPage;