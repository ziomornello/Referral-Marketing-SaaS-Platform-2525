import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiTrash2, FiMessageCircle, FiUsers, FiAlertTriangle, FiEye } = FiIcons;

const AdminChat = () => {
  const { chatMessages, deleteChatMessage } = useData();
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [filter, setFilter] = useState('all');

  const activeMessages = chatMessages.filter(msg => !msg.isDeleted);
  const deletedMessages = chatMessages.filter(msg => msg.isDeleted);

  const filteredMessages = filter === 'all' ? activeMessages : 
                          filter === 'deleted' ? deletedMessages : activeMessages;

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo messaggio?')) {
      deleteChatMessage(messageId);
      toast.success('Messaggio eliminato con successo!');
    }
  };

  const handleBulkDelete = () => {
    if (selectedMessages.length === 0) {
      toast.error('Seleziona almeno un messaggio');
      return;
    }

    if (window.confirm(`Sei sicuro di voler eliminare ${selectedMessages.length} messaggi?`)) {
      selectedMessages.forEach(messageId => {
        deleteChatMessage(messageId);
      });
      setSelectedMessages([]);
      toast.success(`${selectedMessages.length} messaggi eliminati con successo!`);
    }
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'dd/MM/yyyy HH:mm', { locale: it });
  };

  const stats = [
    {
      icon: FiMessageCircle,
      label: 'Messaggi Totali',
      value: chatMessages.length,
      color: 'text-primary-600',
      bg: 'bg-primary-100'
    },
    {
      icon: FiUsers,
      label: 'Messaggi Attivi',
      value: activeMessages.length,
      color: 'text-success-600',
      bg: 'bg-success-100'
    },
    {
      icon: FiTrash2,
      label: 'Messaggi Eliminati',
      value: deletedMessages.length,
      color: 'text-error-600',
      bg: 'bg-error-100'
    },
    {
      icon: FiAlertTriangle,
      label: 'Report Ricevuti',
      value: 0,
      color: 'text-warning-600',
      bg: 'bg-warning-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Moderazione Chat</h1>
          <p className="text-gray-600">
            Gestisci e modera i messaggi della chat della comunità
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <SafeIcon icon={stat.icon} className={`text-xl ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tutti ({chatMessages.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-success-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Attivi ({activeMessages.length})
              </button>
              <button
                onClick={() => setFilter('deleted')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'deleted'
                    ? 'bg-error-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Eliminati ({deletedMessages.length})
              </button>
            </div>

            {selectedMessages.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 bg-error-600 text-white px-4 py-2 rounded-lg hover:bg-error-700 transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="text-sm" />
                <span>Elimina Selezionati ({selectedMessages.length})</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Messages List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {filteredMessages.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    message.isDeleted ? 'bg-red-50 opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {filter !== 'deleted' && (
                        <input
                          type="checkbox"
                          checked={selectedMessages.includes(message.id)}
                          onChange={() => toggleMessageSelection(message.id)}
                          className="mt-1"
                        />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <SafeIcon icon={FiUsers} className="text-white text-sm" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{message.userName}</p>
                            <p className="text-xs text-gray-500">
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                          {message.isDeleted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800">
                              Eliminato
                            </span>
                          )}
                        </div>
                        
                        <div className="bg-gray-100 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-900">{message.message}</p>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>ID: {message.id}</span>
                          <span>User ID: {message.userId}</span>
                        </div>
                      </div>
                    </div>

                    {!message.isDeleted && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                          title="Elimina messaggio"
                        >
                          <SafeIcon icon={FiTrash2} className="text-sm" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiMessageCircle} className="text-6xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {filter === 'deleted' ? 'Nessun messaggio eliminato' : 'Nessun messaggio trovato'}
              </h3>
              <p className="text-gray-400">
                {filter === 'deleted' 
                  ? 'I messaggi eliminati appariranno qui'
                  : 'I messaggi della chat appariranno qui quando gli utenti inizieranno a chattare'
                }
              </p>
            </div>
          )}
        </motion.div>

        {/* Moderation Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
            <SafeIcon icon={FiEye} className="text-blue-600" />
            <span>Linee Guida Moderazione</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Contenuti da rimuovere:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Linguaggio offensivo o inappropriato</li>
                <li>• Spam o messaggi ripetitivi</li>
                <li>• Informazioni personali sensibili</li>
                <li>• Contenuti promozionali non autorizzati</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best practices:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Controlla regolarmente i nuovi messaggi</li>
                <li>• Rispondi rapidamente ai report</li>
                <li>• Mantieni un tono professionale</li>
                <li>• Documenta le azioni di moderazione</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminChat;