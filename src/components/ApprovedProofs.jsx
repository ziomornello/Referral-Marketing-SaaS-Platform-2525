import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiEuro, FiUser, FiCalendar, FiStar } = FiIcons;

const ApprovedProofs = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedProofs();
  }, []);

  const fetchApprovedProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_proofs_rh847')
        .select('*')
        .order('approved_at', { ascending: false });

      if (error) throw error;
      setProofs(data || []);
    } catch (error) {
      console.error('Error fetching approved proofs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const featuredProofs = proofs.filter(proof => proof.is_featured);
  const regularProofs = proofs.filter(proof => !proof.is_featured);

  return (
    <div className="space-y-8">
      {/* Featured Proofs */}
      {featuredProofs.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <SafeIcon icon={FiStar} className="text-xl text-warning-500" />
            <h3 className="text-xl font-bold text-gray-900">Prove in Evidenza</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {featuredProofs.map((proof, index) => (
              <motion.div
                key={proof.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl p-6 border border-warning-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={proof.image_url}
                      alt={`Prova ${proof.bonus_name}`}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="absolute -top-2 -right-2 bg-warning-500 text-white rounded-full p-1">
                      <SafeIcon icon={FiStar} className="text-sm" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{proof.bonus_name}</h4>
                      <div className="bg-success-100 text-success-800 px-2 py-1 rounded-full text-sm font-medium">
                        €{proof.amount}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{proof.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>da {proof.user_name}</span>
                      <span>{format(new Date(proof.approved_at), 'dd MMM yyyy', { locale: it })}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Proofs */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Tutte le Prove Approvate</h3>
        {regularProofs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularProofs.map((proof, index) => (
              <motion.div
                key={proof.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <img
                    src={proof.image_url}
                    alt={`Prova ${proof.bonus_name}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-success-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    €{proof.amount}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {proof.bonus_name}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {proof.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiUser} className="text-xs" />
                      <span>{proof.user_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiCalendar} className="text-xs" />
                      <span>{format(new Date(proof.approved_at), 'dd/MM/yyyy', { locale: it })}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-1 text-success-600">
                      <SafeIcon icon={FiCheckCircle} className="text-sm" />
                      <span className="text-xs font-medium">Verificato dagli Admin</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <SafeIcon icon={FiCheckCircle} className="text-6xl text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">
              Nessuna prova ancora
            </h4>
            <p className="text-gray-400">
              Le prove approvate dagli amministratori appariranno qui
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedProofs;