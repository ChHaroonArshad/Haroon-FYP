import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Palette, CheckCircle, AlertCircle, Loader, Check, X, Shield } from 'lucide-react';

const ResetPassword = () => {
  // ALL STATE DECLARATIONS GO HERE (INSIDE THE COMPONENT)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [tokenValid, setTokenValid] = useState(true);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false
  });

  // FUNCTIONS GO HERE (INSIDE THE COMPONENT)
  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const getPasswordStrength = (password) => {
    const validation = validatePassword(password);
    const score = Object.values(validation).filter(Boolean).length;
    if (score <= 2) return { text: 'Weak', color: 'text-red-600', bg: 'bg-red-600' };
    if (score <= 3) return { text: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-600' };
    if (score <= 4) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-600' };
    return { text: 'Strong', color: 'text-green-600', bg: 'bg-green-600' };
  };

  // useEffect MUST BE INSIDE THE COMPONENT
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      setTokenValid(false);
    }
  }, []); // Empty dependency array

  // Countdown effect
  useEffect(() => {
    if (resetSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resetSuccess && countdown === 0) {
      window.location.href = '/login';
    }
  }, [resetSuccess, countdown]);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return false;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.uppercase || !passwordValidation.lowercase || !passwordValidation.number) {
      setMessage({ type: 'error', text: 'Password must contain uppercase, lowercase, and numbers' });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return false;
    }

    return true;
  };

  const handleResetPassword = () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    setTimeout(() => {
      setLoading(false);
      setResetSuccess(true);
      setMessage({ type: 'success', text: 'Password reset successful!' });
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleResetPassword();
    }
  };

  const passwordValidation = validatePassword(formData.password);
  const passwordStrength = getPasswordStrength(formData.password);

  // Invalid Token UI
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* ... rest of invalid token UI ... */}
      </div>
    );
  }

  // MAIN RETURN - JSX GOES HERE
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Your existing JSX code */}
    </div>
  );
}; // <-- Component ends here

export default ResetPassword; // <-- Export must be AFTER the component