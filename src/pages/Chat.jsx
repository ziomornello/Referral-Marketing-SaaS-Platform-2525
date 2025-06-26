import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiSend, FiMessageCircle, FiUsers, FiSmile, FiHelpCircle, FiChevronDown } = FiIcons;

const Chat = () => {
  const { user } = useAuth();
  const { chatMessages, addChatMessage, bonuses } = useData();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const messagesEndRef = useRef(null);

  // 🔥 UNIFICAZIONE: Mostra TUTTI i messaggi non cancellati
  const activeMessages = chatMessages.filter(msg => !msg.isDeleted);

  // 🔥 CALCOLA SOLO IL NUMERO DI UTENTI REALI ONLINE
  useEffect(() => {
    const calculateOnlineUsersCount = () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Utenti unici che hanno inviato messaggi nell'ultima ora
      const recentActiveUserIds = new Set();
      
      activeMessages
        .filter(msg => new Date(msg.timestamp) > oneHourAgo)
        .forEach(msg => {
          recentActiveUserIds.add(msg.userId);
        });

      // Aggiungi l'utente corrente se loggato
      if (user) {
        recentActiveUserIds.add(user.id);
      }

      return recentActiveUserIds.size;
    };

    setOnlineUsersCount(calculateOnlineUsersCount());

    // Aggiorna ogni 30 secondi
    const interval = setInterval(() => {
      setOnlineUsersCount(calculateOnlineUsersCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [activeMessages, user]);

  // 🔥 DOMANDE RAPIDE DINAMICHE BASATE SU BONUS SELEZIONATO
  const getQuickQuestionsForBonus = (bonus) => {
    if (!bonus) return [];
    
    try {
      // Carica domande rapide salvate nel bonus
      const savedQuestions = bonus.quick_questions ? JSON.parse(bonus.quick_questions) : [];
      if (savedQuestions.length > 0) {
        return savedQuestions;
      }
    } catch (error) {
      console.log('Errore parsing domande rapide:', error);
    }

    // Domande generiche per il bonus se non ce ne sono di specifiche
    return [
      { id: 1, text: `Come funziona l'iscrizione a ${bonus.name}?` },
      { id: 2, text: `Quanto tempo ci vuole per ricevere il bonus ${bonus.name}?` },
      { id: 3, text: `Quali sono i requisiti per ${bonus.name}?` },
      { id: 4, text: `Qualcuno ha già completato ${bonus.name}? Come è andata?` },
      { id: 5, text: `Ci sono problemi noti con ${bonus.name}?` }
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || message.trim();
    
    if (!textToSend || sending) {
      return;
    }

    if (!user) {
      toast.error('❌ Devi essere loggato per inviare messaggi');
      return;
    }

    setSending(true);

    try {
      console.log('💬 Invio messaggio:', {
        userId: user.id,
        userName: user.name,
        message: textToSend
      });

      await addChatMessage({
        userId: user.id,
        userName: user.name,
        message: textToSend
      });

      if (!messageText) {
        setMessage('');
      }

      setShowQuickQuestions(false);
      toast.success('💬 Messaggio inviato!');
    } catch (error) {
      console.error('❌ Errore invio messaggio:', error);
      toast.error('❌ Errore nell\'invio del messaggio');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleQuickQuestion = (question) => {
    const questionText = selectedBonus 
      ? `[${selectedBonus.name}] ${question.text}`
      : question.text;
    handleSendMessage(questionText);
  };

  const formatMessageTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm');
    } else {
      return format(messageDate, 'dd/MM HH:mm');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            💬 Chat Comunità
          </h1>
          <p className="text-gray-600">
            Condividi esperienze, fai domande e aiuta altri utenti con bonus e referral
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-lg p-3">
                <SafeIcon icon={FiMessageCircle} className="text-xl text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeMessages.length}</div>
                <div className="text-sm text-gray-600">Messaggi Totali</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-lg p-3">
                <div className="relative">
                  <SafeIcon icon={FiUsers} className="text-xl text-green-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{onlineUsersCount}</div>
                <div className="text-sm text-gray-600">Utenti Online</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 rounded-lg p-3">
                <SafeIcon icon={FiHelpCircle} className="text-xl text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{bonuses.length}</div>
                <div className="text-sm text-gray-600">Bonus Disponibili</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Questions con Selezione Bonus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <SafeIcon icon={FiHelpCircle} className="text-xl text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">
              🚀 Domande Rapide per Bonus
            </h2>
          </div>
          
          {/* Selezione Bonus */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona un bonus per vedere le domande rapide:
            </label>
            <div className="relative">
              <select
                value={selectedBonus?.id || ''}
                onChange={(e) => {
                  const bonus = bonuses.find(b => b.id === parseInt(e.target.value));
                  setSelectedBonus(bonus);
                  if (bonus) {
                    setShowQuickQuestions(true);
                  } else {
                    setShowQuickQuestions(false);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
              >
                <option value="">Scegli un bonus...</option>
                {bonuses.filter(bonus => bonus.isActive).map((bonus) => (
                  <option key={bonus.id} value={bonus.id}>
                    {bonus.name} - €{bonus.signupBonus}
                  </option>
                ))}
              </select>
              <SafeIcon 
                icon={FiChevronDown} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
              />
            </div>
          </div>

          {/* Domande Rapide */}
          <AnimatePresence>
            {showQuickQuestions && selectedBonus && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">
                    ❓ Domande per {selectedBonus.name}:
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {getQuickQuestionsForBonus(selectedBonus).map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleQuickQuestion(q)}
                      disabled={sending}
                      className="text-left p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-pink-100 transition-all disabled:opacity-50 group"
                    >
                      <div className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                        ❓ {q.text}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedBonus && (
            <div className="text-center py-8 text-gray-500">
              <SafeIcon icon={FiHelpCircle} className="text-4xl mb-2" />
              <p>Seleziona un bonus per vedere le domande rapide correlate</p>
            </div>
          )}
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">💬</span>
                <div>
                  <h3 className="text-xl font-bold">Chat Generale</h3>
                  <p className="text-sm opacity-90">
                    {activeMessages.length} messaggi • Tutti i topic di discussione
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Utenti online</div>
                <div className="text-2xl font-bold">{onlineUsersCount}</div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {activeMessages.length > 0 ? (
              activeMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      msg.userId === user?.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    }`}
                  >
                    {msg.userId !== user?.id && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {msg.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-gray-500">
                          {msg.userName}
                        </div>
                      </div>
                    )}
                    <div className="text-sm leading-relaxed">{msg.message}</div>
                    <div
                      className={`text-xs mt-2 ${
                        msg.userId === user?.id ? 'text-primary-200' : 'text-gray-500'
                      }`}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <SafeIcon icon={FiMessageCircle} className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-4">
                  🌟 Inizia la conversazione!
                </h3>
                <p className="text-gray-400 mb-6">
                  Condividi le tue esperienze con bonus e referral, fai domande o aiuta altri utenti.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Suggerimenti per iniziare:</h4>
                  <ul className="text-sm text-blue-800 text-left space-y-1">
                    <li>• Condividi quale bonus hai completato</li>
                    <li>• Chiedi consigli sui bonus migliori</li>
                    <li>• Racconta la tua esperienza</li>
                    <li>• Aiuta altri utenti con domande</li>
                  </ul>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Scrivi un messaggio alla comunità..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    maxLength={500}
                    disabled={sending}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={sending}
                  >
                    <SafeIcon icon={FiSmile} className="text-lg" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!message.trim() || sending}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <SafeIcon icon={FiSend} className="text-lg mr-2" />
                      <span className="hidden sm:inline">Invia</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>💡 <strong>Suggerimento:</strong> Usa le domande rapide per argomenti specifici</span>
                  <span>•</span>
                  <span>Sii rispettoso e costruttivo</span>
                </div>
                <span className={message.length > 450 ? 'text-orange-600 font-medium' : ''}>
                  {message.length}/500
                </span>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Chat Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center space-x-2">
            <SafeIcon icon={FiUsers} className="text-blue-600" />
            <span>📋 Linee Guida della Comunità</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-3">✅ Comportamenti Incoraggiati:</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• 🤝 Aiuta altri utenti con domande e dubbi</li>
                <li>• 📊 Condividi esperienze reali sui bonus</li>
                <li>• 💡 Offri consigli utili e costruttivi</li>
                <li>• 🎉 Celebra i successi della comunità</li>
                <li>• 🔍 Fai domande specifiche sui bonus</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-800 mb-3">❌ Comportamenti da Evitare:</h4>
              <ul className="text-sm text-red-700 space-y-2">
                <li>• 🚫 Linguaggio offensivo o inappropriato</li>
                <li>• 📧 Condivisione di informazioni personali</li>
                <li>• 🔄 Spam o messaggi ripetitivi</li>
                <li>• 💰 Promozione di servizi esterni non autorizzati</li>
                <li>• 🤥 Informazioni false o fuorvianti</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              <strong>🛡️ Moderazione:</strong> I moderatori monitorano attivamente la chat per garantire un ambiente sicuro e costruttivo per tutti.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;