import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit2, FiTrash2, FiStar, FiCheck, FiX, FiSave, FiImage, FiEye, FiEyeOff } = FiIcons;

const AdminApprovedProofs = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProof, setEditingProof] = useState(null);
  const [formData, setFormData] = useState({
    bonus_id: '',
    bonus_name: '',
    user_name: '',
    amount: '',
    image_url: '',
    description: '',
    admin_notes: '',
    is_featured: false
  });

  useEffect(() => {
    fetchProofs();
  }, []);

  const fetchProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_proofs_rh847')
        .select('*')
        .order('approved_at', { ascending: false });

      if (error) throw error;
      setProofs(data || []);
    } catch (error) {
      console.error('Error fetching proofs:', error);
      toast.error('Errore nel caricamento delle prove');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bonus_id: '',
      bonus_name: '',
      user_name: '',
      amount: '',
      image_url: '',
      description: '',
      admin_notes: '',
      is_featured: false
    });
    setEditingProof(null);
  };

  const handleCreate = () => {
    setShowModal(true);
    resetForm();
  };

  const handleEdit = (proof) => {
    setEditingProof(proof.id);
    setFormData({
      bonus_id: proof.bonus_id,
      bonus_name: proof.bonus_name,
      user_name: proof.user_name,
      amount: proof.amount.toString(),
      image_url: proof.image_url,
      description: proof.description,
      admin_notes: proof.admin_notes || '',
      is_featured: proof.is_featured
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const proofData = {
      ...formData,
      bonus_id: parseInt(formData.bonus_id),
      amount: parseFloat(formData.amount)
    };

    try {
      if (editingProof) {
        const { error } = await supabase
          .from('approved_proofs_rh847')
          .update(proofData)
          .eq('id', editingProof);

        if (error) throw error;
        toast.success('Prova aggiornata con successo!');
      } else {
        const { error } = await supabase
          .from('approved_proofs_rh847')
          .insert([proofData]);

        if (error) throw error;
        toast.success('Prova aggiunta con successo!');
      }

      setShowModal(false);
      resetForm();
      fetchProofs();
    } catch (error) {
      console.error('Error saving proof:', error);
      toast.error('Errore nel salvataggio della prova');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa prova?')) {
      try {
        const { error } = await supabase
          .from('approved_proofs_rh847')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Prova eliminata con successo!');
        fetchProofs();
      } catch (error) {
        console.error('Error deleting proof:', error);
        toast.error('Errore nell\'eliminazione della prova');
      }
    }
  };

  const toggleFeatured = async (proof) => {
    try {
      const { error } = await supabase
        .from('approved_proofs_rh847')
        .update({ is_featured: !proof.is_featured })
        .eq('id', proof.id);

      if (error) throw error;
      toast.success(`Prova ${proof.is_featured ? 'rimossa dalle' : 'aggiunta alle'} prove in evidenza!`);
      fetchProofs();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Errore nell\'aggiornamento della prova');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Gestione Prove Approvate</h1>
            <p className="text-gray-600 mt-2">
              Gestisci le prove di pagamento che verranno mostrate pubblicamente
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="text-sm" />
            <span>Nuova Prova</span>
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
                <SafeIcon icon={FiCheck} className="text-xl text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{proofs.length}</div>
                <div className="text-sm text-gray-600">Prove Totali</div>
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
              <div className="bg-warning-100 rounded-lg p-3">
                <SafeIcon icon={FiStar} className="text-xl text-warning-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {proofs.filter(p => p.is_featured).length}
                </div>
                <div className="text-sm text-gray-600">In Evidenza</div>
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
              <div className="bg-success-100 rounded-lg p-3">
                <SafeIcon icon={FiCheck} className="text-xl text-success-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  €{proofs.reduce((acc, proof) => acc + parseFloat(proof.amount), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Valore Totale</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Proofs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {proofs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prova
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Importo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {proofs.map((proof) => (
                    <tr key={proof.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={proof.image_url}
                            alt={proof.bonus_name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{proof.bonus_name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{proof.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{proof.user_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-success-600">€{proof.amount}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {format(new Date(proof.approved_at), 'dd/MM/yyyy', { locale: it })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFeatured(proof)}
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                            proof.is_featured
                              ? 'bg-warning-100 text-warning-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <SafeIcon icon={proof.is_featured ? FiStar : FiEye} className="text-xs" />
                          <span>{proof.is_featured ? 'In Evidenza' : 'Normale'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(proof)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Modifica"
                          >
                            <SafeIcon icon={FiEdit2} className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(proof.id)}
                            className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                            title="Elimina"
                          >
                            <SafeIcon icon={FiTrash2} className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiCheck} className="text-6xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                Nessuna prova ancora
              </h3>
              <p className="text-gray-400 mb-4">
                Inizia aggiungendo la prima prova approvata
              </p>
              <button
                onClick={handleCreate}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Aggiungi Prima Prova
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
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingProof ? 'Modifica Prova' : 'Nuova Prova'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <SafeIcon icon={FiX} className="text-lg" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Bonus
                    </label>
                    <input
                      type="number"
                      name="bonus_id"
                      value={formData.bonus_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Bonus
                    </label>
                    <input
                      type="text"
                      name="bonus_name"
                      value={formData.bonus_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="es. Revolut"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Utente
                    </label>
                    <input
                      type="text"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="es. Mario R."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Importo (€)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="25.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Immagine
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://..."
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
                    placeholder="Descrizione della prova..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note Admin
                  </label>
                  <textarea
                    name="admin_notes"
                    value={formData.admin_notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Note di verifica..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Metti in evidenza questa prova
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
                    <span>{editingProof ? 'Aggiorna' : 'Aggiungi'} Prova</span>
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

export default AdminApprovedProofs;