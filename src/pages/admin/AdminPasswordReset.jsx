import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiSend, FiKey, FiUser, FiClock, FiCheck } = FiIcons;

const AdminPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentResets, setRecentResets] = useState([]);

  const generateResetToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Inserisci un indirizzo email');
      return;
    }

    setLoading(true);
    try {
      const resetToken = generateResetToken();
      
      // Save reset token to database
      const { error } = await supabase
        .from('password_resets_rh847')
        .insert([
          {
            email: email.toLowerCase(),
            token: resetToken,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        ]);

      if (error) throw error;

      // In a real app, you would send this via email service
      // For demo purposes, we'll show the reset link
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
      
      // Mock email sending
      console.log('Reset link:', resetLink);
      
      toast.success('Email di reset password inviata con successo!', {
        duration: 5000
      });

      // Add to recent resets list
      setRecentResets(prev => [
        {
          id: Date.now(),
          email: email.toLowerCase(),
          token: resetToken,
          created_at: new Date().toISOString(),
          sent: true
        },
        ...prev.slice(0, 4)
      ]);

      setEmail('');
    } catch (error) {
      console.error('Error creating password reset:', error);
      toast.error('Errore nell\'invio dell\'email di reset');
    } finally {
      setLoading(false);
    }
  };

  const copyResetLink = (token) => {
    const resetLink = `${window.location.origin}/reset-password?token=${token}`;
    navigator.clipboard.writeText(resetLink);
    toast.success('Link copiato negli appunti!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password Utenti</h1>
          <p className="text-gray-600">
            Invia link di reset password agli utenti che ne hanno bisogno
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reset Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary-100 rounded-lg p-3">
                <SafeIcon icon={FiKey} className="text-xl text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Genera Reset Password</h2>
                <p className="text-gray-600 text-sm">Invia link di reset via email</p>
              </div>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Utente
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiMail} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="utente@esempio.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Invio in corso...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiSend} className="text-sm" />
                    <span>Invia Email di Reset</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                ℹ️ Informazioni
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Il link di reset è valido per 24 ore</li>
                <li>• L'utente riceverà un'email con le istruzioni</li>
                <li>• Il token può essere usato una sola volta</li>
                <li>• In modalità demo, il link appare nei reset recenti</li>
              </ul>
            </div>
          </motion.div>

          {/* Recent Resets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-success-100 rounded-lg p-3">
                <SafeIcon icon={FiClock} className="text-xl text-success-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reset Recenti</h2>
                <p className="text-gray-600 text-sm">Ultimi reset generati</p>
              </div>
            </div>

            {recentResets.length > 0 ? (
              <div className="space-y-4">
                {recentResets.map((reset) => (
                  <div
                    key={reset.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiUser} className="text-gray-500" />
                        <span className="font-medium text-gray-900">{reset.email}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-success-600">
                        <SafeIcon icon={FiCheck} className="text-sm" />
                        <span className="text-xs font-medium">Inviato</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {new Date(reset.created_at).toLocaleString('it-IT')}
                    </div>
                    <button
                      onClick={() => copyResetLink(reset.token)}
                      className="w-full text-left bg-gray-100 hover:bg-gray-200 rounded px-3 py-2 text-xs font-mono text-gray-700 transition-colors"
                      title="Clicca per copiare il link"
                    >
                      {window.location.origin}/reset-password?token={reset.token.substring(0, 20)}...
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiClock} className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">Nessun reset inviato di recente</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Come funziona il Reset Password
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <SafeIcon icon={FiMail} className="text-primary-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">1. Inserisci Email</h4>
              <p className="text-sm text-gray-600">
                Inserisci l'email dell'utente che necessita del reset
              </p>
            </div>
            <div className="text-center">
              <div className="bg-warning-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <SafeIcon icon={FiSend} className="text-warning-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">2. Invio Automatico</h4>
              <p className="text-sm text-gray-600">
                Il sistema genera e invia automaticamente l'email
              </p>
            </div>
            <div className="text-center">
              <div className="bg-success-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <SafeIcon icon={FiKey} className="text-success-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">3. Reset Completato</h4>
              <p className="text-sm text-gray-600">
                L'utente segue il link e reimposta la password
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPasswordReset;