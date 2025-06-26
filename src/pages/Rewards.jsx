import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiAward, FiGift, FiCheck, FiStar, FiTrendingUp } = FiIcons;

const Rewards = () => {
  const { user, updateUserPoints } = useAuth();
  const { rewards } = useData();
  const [selectedReward, setSelectedReward] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const activeRewards = rewards.filter(reward => reward.isActive);

  const canAfford = (cost) => user?.points >= cost;

  const handleRedemption = (reward) => {
    setSelectedReward(reward);
    setShowConfirmModal(true);
  };

  const confirmRedemption = () => {
    if (selectedReward && canAfford(selectedReward.cost)) {
      updateUserPoints(-selectedReward.cost);
      toast.success(`${selectedReward.name} riscattato con successo! Riceverai il codice via email.`);
      setShowConfirmModal(false);
      setSelectedReward(null);
    }
  };

  const userStats = [
    {
      icon: FiAward,
      label: 'Punti Disponibili',
      value: user?.points || 0,
      color: 'text-primary-600',
      bg: 'bg-primary-100'
    },
    {
      icon: FiGift,
      label: 'Premi Riscattati',
      value: '2',
      color: 'text-success-600',
      bg: 'bg-success-100'
    },
    {
      icon: FiStar,
      label: 'Livello Utente',
      value: 'Gold',
      color: 'text-warning-600',
      bg: 'bg-warning-100'
    },
    {
      icon: FiTrendingUp,
      label: 'Punti Questo Mese',
      value: '+150',
      color: 'text-error-600',
      bg: 'bg-error-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Centro Premi</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Riscatta i tuoi punti con premi esclusivi. Ogni punto guadagnato ti avvicina 
            al tuo prossimo premio!
          </p>
        </motion.div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {userStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bg} mb-4`}>
                <SafeIcon icon={stat.icon} className={`text-xl ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Points Balance Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 mb-8 text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-2">Il Tuo Saldo Punti</h2>
          <div className="text-4xl font-bold mb-2">{user?.points || 0}</div>
          <p className="text-primary-100">
            Continua a completare bonus e invitare amici per guadagnare più punti!
          </p>
        </motion.div>

        {/* Rewards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Premi Disponibili</h2>
          
          {activeRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    !canAfford(reward.cost) ? 'opacity-60' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {reward.cost} punti
                    </div>
                    {!canAfford(reward.cost) && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Punti Insufficienti</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.name}</h3>
                    <p className="text-gray-600 mb-4">{reward.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-primary-600">
                        {reward.cost} punti
                      </div>
                      <div className={`text-sm px-3 py-1 rounded-full ${
                        canAfford(reward.cost) 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-error-100 text-error-800'
                      }`}>
                        {canAfford(reward.cost) ? 'Disponibile' : 'Non disponibile'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRedemption(reward)}
                      disabled={!canAfford(reward.cost)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        canAfford(reward.cost)
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford(reward.cost) ? 'Riscatta Premio' : `Servono ${reward.cost - (user?.points || 0)} punti`}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <SafeIcon icon={FiGift} className="text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">
                Nessun premio disponibile
              </h3>
              <p className="text-gray-400">
                I premi verranno aggiunti presto. Continua a guadagnare punti!
              </p>
            </div>
          )}
        </motion.div>

        {/* Confirmation Modal */}
        {showConfirmModal && selectedReward && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiGift} className="text-2xl text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Conferma Riscatto
                </h3>
                <p className="text-gray-600">
                  Sei sicuro di voler riscattare <strong>{selectedReward.name}</strong> per <strong>{selectedReward.cost} punti</strong>?
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Punti attuali:</span>
                  <span className="font-bold">{user?.points || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Costo premio:</span>
                  <span className="font-bold text-error-600">-{selectedReward.cost}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Punti rimanenti:</span>
                  <span className="font-bold text-primary-600">
                    {(user?.points || 0) - selectedReward.cost}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmRedemption}
                  className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Conferma Riscatto
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;