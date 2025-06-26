import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiAward } = FiIcons;

const AdminRewards = () => {
  const { rewards, addReward, updateReward, deleteReward } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
    image: '',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cost: '',
      image: '',
      isActive: true
    });
    setEditingReward(null);
  };

  const handleCreate = () => {
    setShowModal(true);
    resetForm();
  };

  const handleEdit = (reward) => {
    setEditingReward(reward.id);
    setFormData({
      name: reward.name,
      description: reward.description,
      cost: reward.cost.toString(),
      image: reward.image,
      isActive: reward.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const rewardData = {
      ...formData,
      cost: parseInt(formData.cost)
    };

    if (editingReward) {
      updateReward(editingReward, rewardData);
      toast.success('Premio aggiornato con successo!');
    } else {
      addReward(rewardData);
      toast.success('Premio creato con successo!');
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo premio?')) {
      deleteReward(id);
      toast.success('Premio eliminato con successo!');
    }
  };

  const toggleStatus = (reward) => {
    updateReward(reward.id, { isActive: !reward.isActive });
    toast.success(`Premio ${reward.isActive ? 'disattivato' : 'attivato'} con successo!`);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestione Premi</h1>
            <p className="text-gray-600 mt-2">
              Configura i premi disponibili nel catalogo punti
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="text-sm" />
            <span>Nuovo Premio</span>
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 rounded-lg p-3">
                <SafeIcon icon={FiAward} className="text-xl text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{rewards.length}</div>
                <div className="text-sm text-gray-600">Premi Totali</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-success-100 rounded-lg p-3">
                <SafeIcon icon={FiEye} className="text-xl text-success-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {rewards.filter(r => r.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Premi Attivi</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-warning-100 rounded-lg p-3">
                <SafeIcon icon={FiAward} className="text-xl text-warning-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {rewards.reduce((acc, reward) => acc + reward.cost, 0)}
                </div>
                <div className="text-sm text-gray-600">Punti Totali</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rewards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {rewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                    !reward.isActive ? 'opacity-60' : ''
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
                    {!reward.isActive && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">NASCOSTO</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{reward.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-bold text-primary-600">
                        {reward.cost} punti
                      </div>
                      <button
                        onClick={() => toggleStatus(reward)}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                          reward.isActive
                            ? 'bg-success-100 text-success-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <SafeIcon icon={reward.isActive ? FiEye : FiEyeOff} className="text-xs" />
                        <span>{reward.isActive ? 'Attivo' : 'Nascosto'}</span>
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(reward)}
                        className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        <SafeIcon icon={FiEdit2} className="text-sm" />
                        <span>Modifica</span>
                      </button>
                      <button
                        onClick={() => handleDelete(reward.id)}
                        className="flex items-center justify-center py-2 px-3 text-error-600 border border-error-600 rounded-lg hover:bg-error-50 transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} className="text-sm" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <SafeIcon icon={FiAward} className="text-6xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                Nessun premio ancora
              </h3>
              <p className="text-gray-400 mb-4">
                Inizia creando il primo premio per il catalogo punti
              </p>
              <button
                onClick={handleCreate}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Crea Primo Premio
              </button>
            </div>
          )}
        </motion.div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingReward ? 'Modifica Premio' : 'Nuovo Premio'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <SafeIcon icon={FiX} className="text-lg" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Premio
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="es. Buono Amazon €10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Descrizione del premio..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo in Punti
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Immagine
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Premio attivo e visibile agli utenti
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <SafeIcon icon={FiSave} className="text-sm" />
                    <span>{editingReward ? 'Aggiorna' : 'Crea'} Premio</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRewards;