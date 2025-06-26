import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiEye, FiClock, FiUser, FiFile, FiMessageSquare } = FiIcons;

const AdminApprovals = () => {
  const { submissions, updateSubmissionStatus } = useData();
  const { updateUserPoints } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning-600 bg-warning-100';
      case 'approved': return 'text-success-600 bg-success-100';
      case 'rejected': return 'text-error-600 bg-error-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'In Attesa';
      case 'approved': return 'Approvato';
      case 'rejected': return 'Rifiutato';
      default: return status;
    }
  };

  const handleApproval = (submission, status) => {
    setSelectedSubmission(submission);
    setShowModal(true);
    setAdminNotes('');
    
    // Pre-fill notes for rejection
    if (status === 'rejected') {
      setAdminNotes('Specifica il motivo del rifiuto...');
    }
  };

  const confirmApproval = (status) => {
    if (!selectedSubmission) return;

    updateSubmissionStatus(selectedSubmission.id, status, adminNotes);
    
    // Award points for approved submissions
    if (status === 'approved') {
      const pointsToAward = selectedSubmission.type === 'completion' ? 50 : 75;
      updateUserPoints(pointsToAward);
      toast.success(`Prova approvata! ${pointsToAward} punti assegnati all'utente.`);
    } else {
      toast.success('Stato submission aggiornato con successo!');
    }

    setShowModal(false);
    setSelectedSubmission(null);
    setAdminNotes('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestione Approvazioni</h1>
          <p className="text-gray-600">
            Rivedi e approva le prove inviate dagli utenti per i bonus completati
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-warning-100 rounded-lg p-3">
                <SafeIcon icon={FiClock} className="text-xl text-warning-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">In Attesa</div>
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
                <SafeIcon icon={FiCheck} className="text-xl text-success-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Approvate</div>
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
              <div className="bg-error-100 rounded-lg p-3">
                <SafeIcon icon={FiX} className="text-xl text-error-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.status === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600">Rifiutate</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 rounded-lg p-3">
                <SafeIcon icon={FiUser} className="text-xl text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
                <div className="text-sm text-gray-600">Totali</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Tutte ({submissions.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-warning-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              In Attesa ({submissions.filter(s => s.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-success-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Approvate ({submissions.filter(s => s.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-error-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Rifiutate ({submissions.filter(s => s.status === 'rejected').length})
            </button>
          </div>
        </motion.div>

        {/* Submissions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {filteredSubmissions.length > 0 ? (
            <div className="space-y-4 p-6">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {submission.bonusName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {getStatusText(submission.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Utente:</strong> {submission.userName}</p>
                        <p><strong>Tipo:</strong> {submission.type === 'completion' ? 'Completamento bonus' : 'Prova pagamento'}</p>
                        <p><strong>Data invio:</strong> {format(new Date(submission.submittedAt), 'dd MMMM yyyy HH:mm', { locale: it })}</p>
                        {submission.reviewedAt && (
                          <p><strong>Data revisione:</strong> {format(new Date(submission.reviewedAt), 'dd MMMM yyyy HH:mm', { locale: it })}</p>
                        )}
                      </div>
                    </div>
                    
                    {submission.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproval(submission, 'approved')}
                          className="flex items-center space-x-1 px-3 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
                        >
                          <SafeIcon icon={FiCheck} className="text-sm" />
                          <span>Approva</span>
                        </button>
                        <button
                          onClick={() => handleApproval(submission, 'rejected')}
                          className="flex items-center space-x-1 px-3 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
                        >
                          <SafeIcon icon={FiX} className="text-sm" />
                          <span>Rifiuta</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Files */}
                  {submission.files && submission.files.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">File allegati:</h4>
                      <div className="flex flex-wrap gap-2">
                        {submission.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
                          >
                            <SafeIcon icon={FiFile} className="text-gray-500" />
                            <span>{file.name}</span>
                            <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {submission.notes && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Note dell'utente:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        {submission.notes}
                      </p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {submission.adminNotes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Note admin:</h4>
                      <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                        {submission.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiEye} className="text-6xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {filter === 'all' ? 'Nessuna submission ancora' : `Nessuna submission ${getStatusText(filter).toLowerCase()}`}
              </h3>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? 'Le prove inviate dagli utenti appariranno qui'
                  : `Non ci sono submission con stato "${getStatusText(filter).toLowerCase()}"`
                }
              </p>
            </div>
          )}
        </motion.div>

        {/* Approval Modal */}
        {showModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Conferma Azione
                </h3>
                <p className="text-gray-600 mb-4">
                  Stai per modificare lo stato della submission di <strong>{selectedSubmission.userName}</strong> 
                  per il bonus <strong>{selectedSubmission.bonusName}</strong>.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note amministratore (opzionale)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Aggiungi note per l'utente..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={() => confirmApproval('approved')}
                    className="flex items-center justify-center space-x-1 flex-1 py-2 px-4 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
                  >
                    <SafeIcon icon={FiCheck} className="text-sm" />
                    <span>Approva</span>
                  </button>
                  <button
                    onClick={() => confirmApproval('rejected')}
                    className="flex items-center justify-center space-x-1 flex-1 py-2 px-4 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
                  >
                    <SafeIcon icon={FiX} className="text-sm" />
                    <span>Rifiuta</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovals;