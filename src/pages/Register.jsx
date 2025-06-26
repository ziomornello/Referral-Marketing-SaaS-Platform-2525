import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone, FiType } = FiIcons;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptPromotions: false,
    textSize: 'normal'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è richiesto';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Il numero di telefono è richiesto';
    } else if (!/^[+]?[\d\s()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Numero di telefono non valido';
    }

    if (!formData.password) {
      newErrors.password = 'La password è richiesta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La password deve essere di almeno 6 caratteri';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Form submission started:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validazione fallita:', errors);
      toast.error('❌ Controlla i campi del form');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Calling register function...');
      const success = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        acceptPromotions: formData.acceptPromotions,
        textSize: formData.textSize
      });

      if (success) {
        console.log('✅ Registrazione completata con successo');
        toast.success('🎉 Registrazione completata! Reindirizzamento...');
        
        // Slight delay to show success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        console.log('❌ Registrazione fallita');
        toast.error('❌ Errore durante la registrazione');
      }
    } catch (error) {
      console.error('❌ Errore durante registrazione:', error);
      toast.error('❌ Errore imprevisto durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          <div className="text-center mb-8">
            {/* Efallmo Logo */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Unisciti a Efallmo
            </h2>
            <p className="text-gray-600 mt-2">Inizia il tuo viaggio nel mondo dei bonus</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiUser} className="text-purple-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Il tuo nome completo"
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiMail} className="text-purple-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="La tua email"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Telefono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Numero di Telefono *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiPhone} className="text-purple-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+39 123 456 7890"
                  disabled={loading}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiLock} className="text-purple-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="La tua password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Conferma Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Conferma Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiLock} className="text-purple-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Conferma la tua password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  <SafeIcon icon={showConfirmPassword ? FiEyeOff : FiEye} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Dimensione Testo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <SafeIcon icon={FiType} className="inline mr-2" />
                Preferenze di Lettura
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="textSize"
                    value="normal"
                    checked={formData.textSize === 'normal'}
                    onChange={handleChange}
                    className="mr-3 w-4 h-4 text-purple-600"
                    disabled={loading}
                  />
                  <span className="text-sm">Testo Normale</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="textSize"
                    value="large"
                    checked={formData.textSize === 'large'}
                    onChange={handleChange}
                    className="mr-3 w-4 h-4 text-purple-600"
                    disabled={loading}
                  />
                  <span className="text-lg">Testo Grande (per chi ha difficoltà visive)</span>
                </label>
              </div>
            </div>

            {/* Consenso Promozioni */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptPromotions"
                  checked={formData.acceptPromotions}
                  onChange={handleCheckboxChange}
                  className="mt-1 mr-3 w-4 h-4 text-purple-600"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">
                  Accetto di ricevere comunicazioni promozionali sui bonus e le app tramite{' '}
                  <strong>SMS, Email e WhatsApp</strong>. Potrai disattivare questa opzione in qualsiasi momento.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Registrazione in corso...</span>
                </div>
              ) : (
                'Registrati Gratis 🚀'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Hai già un account?{' '}
              <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                Accedi qui
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;