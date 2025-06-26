import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiMail, FiPhone, FiLock, FiSave, FiEye, FiEyeOff, FiCamera, FiUpload, FiX } = FiIcons;

const Profile = () => {
  const { user, refreshUserData } = useAuth();
  const { updateUser } = useData();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profile_image: user?.profile_image || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  // 🔥 FUNZIONE PER CONVERTIRE FILE IN BASE64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // 🔥 GESTIONE UPLOAD IMMAGINE LOCALE
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validazione tipo file
    if (!file.type.startsWith('image/')) {
      toast.error('❌ Seleziona solo file immagine (JPG, PNG, GIF)');
      return;
    }

    // Validazione dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('❌ Immagine troppo grande (max 5MB)');
      return;
    }

    setUploadingImage(true);

    try {
      // Converti in Base64 per storage locale
      const base64String = await convertToBase64(file);
      
      // Salva in localStorage con chiave unica
      const imageKey = `profile_image_${user.id}_${Date.now()}`;
      localStorage.setItem(imageKey, base64String);

      // Aggiorna form data
      setFormData(prev => ({
        ...prev,
        profile_image: base64String
      }));

      toast.success('📷 Immagine caricata con successo!');
    } catch (error) {
      console.error('Errore upload immagine:', error);
      toast.error('❌ Errore nel caricamento dell\'immagine');
    } finally {
      setUploadingImage(false);
    }
  };

  // 🔥 RIMOZIONE IMMAGINE
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      profile_image: ''
    }));
    toast.success('🗑️ Immagine rimossa');
  };

  const validateForm = () => {
    const newErrors = {};

    // Validazione nome
    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è richiesto';
    }

    // Validazione email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    // Validazione telefono
    if (!formData.phone.trim()) {
      newErrors.phone = 'Il numero di telefono è richiesto';
    } else if (!/^[+]?[\d\s()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Numero di telefono non valido';
    }

    // Validazione password (solo se sta cercando di cambiarla)
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Inserisci la password attuale per modificarla';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'Inserisci la nuova password';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'La nuova password deve essere di almeno 6 caratteri';
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Le password non coincidono';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Rimuovi errore quando l'utente inizia a digitare
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('❌ Controlla i campi del form');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        profile_image: formData.profile_image.trim()
      };

      // Se sta cambiando la password, aggiungi anche quella
      if (formData.newPassword) {
        // In un'app reale, qui dovresti verificare la password attuale
        // e hashare quella nuova. Per ora simuliamo
        updateData.password_hash = `updated_${formData.newPassword}`;
      }

      await updateUser(user.id, updateData);

      // Aggiorna i dati dell'utente nel context
      await refreshUserData();

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      toast.success('✅ Profilo aggiornato con successo!');
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      toast.error('❌ Errore nell\'aggiornamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Profile Image Upload */}
          <div className="relative inline-block mb-4">
            {formData.profile_image ? (
              <div className="relative">
                <img
                  src={formData.profile_image}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover mx-auto shadow-lg border-4 border-purple-200"
                  onError={(e) => {
                    // Fallback se l'immagine non carica
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback avatar (hidden by default) */}
                <div 
                  className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg border-4 border-purple-200" 
                  style={{ display: 'none' }}
                >
                  <SafeIcon icon={FiUser} className="text-3xl text-white" />
                </div>
                {/* Remove Button */}
                <button
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  title="Rimuovi immagine"
                >
                  <SafeIcon icon={FiX} className="text-sm" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg border-4 border-purple-200">
                <SafeIcon icon={FiUser} className="text-3xl text-white" />
              </div>
            )}

            {/* Upload Button */}
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
              <SafeIcon icon={uploadingImage ? FiUpload : FiCamera} className={`text-purple-600 ${uploadingImage ? 'animate-pulse' : ''}`} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div>

          {/* Upload Instructions */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              📷 Carica una tua foto per personalizzare il profilo
            </p>
            <p className="text-xs text-gray-500">
              Supporta: JPG, PNG, GIF (max 5MB)
            </p>
            {uploadingImage && (
              <p className="text-xs text-purple-600 font-medium animate-pulse">
                ⏳ Caricamento in corso...
              </p>
            )}
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Il Mio Profilo
          </h1>
          <p className="text-gray-600 mt-2">Gestisci le tue informazioni personali e la sicurezza dell'account</p>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-purple-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Info Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiUser} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Informazioni Account</h2>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {/* Nome */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SafeIcon icon={FiUser} className="text-gray-400" />
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
                      <SafeIcon icon={FiMail} className="text-gray-400" />
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
                      <SafeIcon icon={FiPhone} className="text-gray-400" />
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
              </div>
            </div>

            {/* Security Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiLock} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Sicurezza</h2>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Suggerimento:</strong> Lascia vuoti i campi password se non vuoi modificarla.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {/* Password Attuale */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Password Attuale
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SafeIcon icon={FiLock} className="text-gray-400" />
                    </div>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Password attuale"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      <SafeIcon icon={showCurrentPassword ? FiEyeOff : FiEye} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                  {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                </div>

                {/* Nuova Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Nuova Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SafeIcon icon={FiLock} className="text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nuova password (min 6 caratteri)"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      <SafeIcon icon={showNewPassword ? FiEyeOff : FiEye} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                  {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                </div>

                {/* Conferma Nuova Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Conferma Nuova Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SafeIcon icon={FiLock} className="text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Conferma nuova password"
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
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Aggiornamento in corso...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiSave} className="text-sm" />
                    <span>Salva Modifiche</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;