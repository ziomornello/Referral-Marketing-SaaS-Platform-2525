import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import SafeIcon from '../common/SafeIcon';
import FullScreenGuide from '../components/FullScreenGuide';
import ApprovedProofs from '../components/ApprovedProofs';
import BonusStateSelector from '../components/BonusStateSelector';
import { getStateConfig, BONUS_STATES } from '../utils/bonusStates';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const {
  FiCalendar,
  FiEuro,
  FiUsers,
  FiCopy,
  FiCheck,
  FiUpload,
  FiFile,
  FiX,
  FiExternalLink,
  FiCheckCircle,
  FiBookOpen,
  FiLock,
  FiChevronRight,
  FiArrowLeft,
  FiZap,
  FiFileText,
  FiGift,
  FiTrendingUp
} = FiIcons;

const BonusDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bonuses, addSubmission, loading, submissions } = useData();

  // State management
  const [copiedCode, setCopiedCode] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [submissionType, setSubmissionType] = useState('completion');
  const [notes, setNotes] = useState('');
  const [showFullScreenGuide, setShowFullScreenGuide] = useState(false);
  const [showFullScreenClosure, setShowFullScreenClosure] = useState(false);
  const [showFullScreenExtra, setShowFullScreenExtra] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [userBonusState, setUserBonusState] = useState(BONUS_STATES.NOT_STARTED);

  // Find bonus with detailed logging
  const bonus = bonuses.find(b => {
    console.log('🔍 Confronto bonus:', {
      bonusId: b.id,
      paramId: id,
      match: b.id === parseInt(id),
      bonusData: b
    });
    return b.id === parseInt(id);
  });

  // Check user's current state for this bonus
  const userSubmission = submissions.find(sub => 
    sub.userId === user?.id && sub.bonusId === parseInt(id)
  );

  // Loading and error handling
  useEffect(() => {
    console.log('🔍 BonusDetail useEffect:', {
      id,
      bonusesLength: bonuses.length,
      bonus,
      loading,
      bonuses: bonuses.map(b => ({ id: b.id, name: b.name }))
    });

    if (!loading) {
      setPageLoading(false);

      // Set initial state based on submission
      if (userSubmission) {
        switch (userSubmission.status) {
          case 'pending':
            setUserBonusState(BONUS_STATES.WAITING_PAYMENT);
            break;
          case 'approved':
            setUserBonusState(BONUS_STATES.COMPLETED);
            break;
          case 'rejected':
            setUserBonusState(BONUS_STATES.REJECTED);
            break;
          default:
            setUserBonusState(BONUS_STATES.NOT_STARTED);
        }
      }
    }
  }, [id, bonuses, loading, bonus, userSubmission]);

  // Dropzone configuration
  const onDrop = (acceptedFiles) => {
    console.log('📁 File caricati:', acceptedFiles);
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onError: (error) => {
      console.error('❌ Errore dropzone:', error);
      toast.error('Errore nel caricamento file');
    }
  });

  // Helper functions
  const copyToClipboard = (text, type) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedCode(type);
      toast.success('🎉 Copiato negli appunti!');
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (error) {
      console.error('❌ Errore copia:', error);
      toast.error('Errore nella copia');
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmission = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('❌ Carica almeno un file come prova');
      return;
    }

    try {
      const submission = {
        userId: user.id,
        userName: user.name,
        bonusId: bonus.id,
        bonusName: bonus.name,
        type: submissionType,
        files: uploadedFiles.map(file => ({
          name: file.name,
          size: file.size
        })),
        notes,
        submittedAt: new Date()
      };

      await addSubmission(submission);
      setUserBonusState(BONUS_STATES.WAITING_PAYMENT);
      toast.success('🎉 Prova inviata con successo! Attendi l\'approvazione dell\'admin.');

      // Reset form
      setUploadedFiles([]);
      setNotes('');
      setActiveSection(null);
    } catch (error) {
      console.error('❌ Errore invio submission:', error);
      toast.error('Errore nell\'invio della prova');
    }
  };

  const handleStateChange = (newState) => {
    setUserBonusState(newState);
    toast.success(`✅ Stato aggiornato: ${getStateConfig(newState).label}`);
  };

  // 🔥 FIX: Funzione per convertire URL share in embed URL
  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    
    // Se è già un URL embed, restituiscilo così com'è
    if (url.includes('/e/')) {
      return url;
    }
    
    // Converti URL share in embed URL
    if (url.includes('/share/')) {
      return url.replace('/share/', '/e/');
    }
    
    return url;
  };

  // Loading states
  if (pageLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-600 mb-4"></div>
          <p className="text-gray-600">🔄 Caricamento bonus...</p>
          <p className="text-sm text-gray-500 mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }

  // Bonus not found
  if (!bonus) {
    console.log('❌ Bonus non trovato:', {
      id,
      paramId: parseInt(id),
      bonuses: bonuses.map(b => ({ id: b.id, name: b.name }))
    });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">❌ Bonus non trovato</h2>
          <p className="text-gray-600 mb-6">
            Il bonus con ID <strong>{id}</strong> non esiste o è stato rimosso.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🏠 Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(bonus.expiryDate) < new Date();
  const referralLink = bonus.referralTemplate?.replace('{CODE}', user?.referralCode || 'REF123');
  const hasExtraContent = bonus.extraTitle || bonus.extraDescription || bonus.extraGuideCode || bonus.extraGuideLink;
  const hasCompletedBonus = userBonusState === BONUS_STATES.COMPLETED;
  const stateConfig = getStateConfig(userBonusState);

  // 🔥 SEZIONI CON LOGICA INTELLIGENTE PER GUIDE FIRST
  const sections = [
    // User State Management - Always first
    {
      id: 'state',
      title: '📊 Il Tuo Progresso',
      description: stateConfig.userDescription || 'Traccia il tuo progresso con questo bonus',
      icon: FiTrendingUp,
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      available: true,
      action: () => {
        // For users, this shows current state info
        toast.info(`📊 Stato attuale: ${stateConfig.userLabel || stateConfig.label}`);
      }
    }
  ];

  // 🔥 LOGICA GUIDE FIRST CORRETTA - Ordine dinamico basato su guideFirst
  if (bonus.guideFirst) {
    // Se guideFirst=true, mostra prima la guida
    sections.push(
      {
        id: 'guide',
        title: '📖 Guida Completa',
        description: 'Segui la guida step-by-step PRIMA di procedere',
        icon: FiBookOpen,
        color: 'bg-blue-500',
        available: !!bonus.guideCode,
        action: () => setShowFullScreenGuide(true)
      },
      {
        id: 'referral',
        title: '🔗 Link di Invito',
        description: 'Copia il link o visita il sito DOPO aver letto la guida',
        icon: FiCopy,
        color: 'bg-green-500',
        available: !!referralLink,
        action: () => {
          // Scroll to referral section
          document.getElementById('referral-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    );
  } else {
    // Se guideFirst=false, mostra prima il link di invito
    sections.push(
      {
        id: 'referral',
        title: '🔗 Link di Invito',
        description: 'Copia il link o visita il sito per iniziare',
        icon: FiCopy,
        color: 'bg-green-500',
        available: !!referralLink,
        action: () => {
          // Scroll to referral section
          document.getElementById('referral-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      },
      {
        id: 'guide',
        title: '📖 Guida Completa',
        description: 'Consulta la guida per ulteriori dettagli',
        icon: FiBookOpen,
        color: 'bg-blue-500',
        available: !!bonus.guideCode,
        action: () => setShowFullScreenGuide(true)
      }
    );
  }

  // Aggiungi le altre sezioni
  sections.push(
    {
      id: 'closure',
      title: '🔒 Chiusura Conto',
      description: 'Procedura per chiudere il conto',
      icon: FiLock,
      color: 'bg-orange-500',
      available: !!bonus.closureCode?.trim(),
      action: () => setShowFullScreenClosure(true)
    },
    // 🔥 SEZIONE BONUS EXTRA
    {
      id: 'extra',
      title: bonus.extraTitle || '⚡ Bonus Extra',
      description: bonus.extraDescription || 'Attività aggiuntive per guadagnare di più',
      icon: FiZap,
      color: 'bg-purple-500',
      available: hasExtraContent,
      action: () => {
        if (bonus.extraGuideCode) {
          setShowFullScreenExtra(true);
        } else if (bonus.extraGuideLink) {
          window.open(bonus.extraGuideLink, '_blank');
        }
      }
    },
    // 🔥 CARICA PROVE - SOLO SE HA COMPLETATO IL BONUS
    {
      id: 'proofs',
      title: hasCompletedBonus ? '🎉 Hai Completato questo Bonus!' : '🌟 Condividi il Tuo Successo!',
      description: hasCompletedBonus ? 'Guarda le altre prove approvate' : 'Completa il bonus per condividere il tuo successo',
      icon: hasCompletedBonus ? FiGift : FiUpload,
      color: hasCompletedBonus ? 'bg-green-500' : 'bg-gray-400',
      available: hasCompletedBonus, // 🔥 VISIBILE SOLO SE COMPLETATO
      action: () => setActiveSection(activeSection === 'proofs' ? null : 'proofs')
    }
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <SafeIcon icon={FiArrowLeft} className="text-lg" />
          <span>🏠 Torna alla Dashboard</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-purple-100"
        >
          <div className="relative h-48 sm:h-64">
            {/* 🔥 FIX: Immagine responsive senza tagliare */}
            <img
              src={bonus.image}
              alt={bonus.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                console.log('❌ Errore caricamento immagine bonus:', bonus.image);
                e.target.src = 'https://via.placeholder.com/400x200?text=Immagine+Non+Disponibile';
              }}
            />
            {isExpired && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-bold text-xl">⏰ SCADUTO</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-lg font-bold shadow-lg">
              💰 €{bonus.signupBonus}
            </div>
            {/* User State Badge */}
            <div className="absolute top-4 left-4">
              <BonusStateSelector
                currentState={userBonusState}
                onStateChange={handleStateChange}
                userMode={true}
                showProgress={true}
              />
            </div>
          </div>
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              🎯 {bonus.name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-3 shadow-md">
                  <SafeIcon icon={FiEuro} className="text-2xl text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">💰 Bonus Iscrizione</p>
                  <p className="text-xl font-bold text-gray-900">€{bonus.signupBonus}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-3 shadow-md">
                  <SafeIcon icon={FiUsers} className="text-2xl text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">👥 Bonus Referral</p>
                  <p className="text-xl font-bold text-gray-900">€{bonus.referralBonus}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg p-3 shadow-md">
                  <SafeIcon icon={FiCalendar} className="text-2xl text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">⏰ Scadenza</p>
                  <p className="text-lg font-bold text-gray-900">
                    {format(new Date(bonus.expiryDate), 'dd MMM yyyy', { locale: it })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                📈 Il Tuo Stato
              </h3>
              <p className="text-gray-600">
                {stateConfig.userDescription || stateConfig.description}
              </p>
            </div>
            <BonusStateSelector
              currentState={userBonusState}
              onStateChange={handleStateChange}
              showProgress={true}
            />
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-purple-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📝 Informazioni su {bonus.name}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {bonus.description}
          </p>
          {/* 🔥 NOTE AGGIUNTIVE */}
          {bonus.notes && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={FiFileText} className="text-blue-600" />
                <h3 className="font-medium text-blue-900">📋 Note Importanti</h3>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed">
                {bonus.notes}
              </p>
            </div>
          )}
        </motion.div>

        {/* 🔥 FIX: Referral Link - RISPETTA L'ORDINE guideFirst */}
        {referralLink && (
          <motion.div
            id="referral-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-200"
          >
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              🔗 Il Tuo Link Personalizzato
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 bg-white rounded-lg px-4 py-3 font-mono break-all border-2 border-purple-200 shadow-sm">
                {referralLink}
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => copyToClipboard(referralLink, 'link')}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold shadow-md"
                >
                  <SafeIcon icon={copiedCode === 'link' ? FiCheck : FiCopy} className="text-sm" />
                  <span>{copiedCode === 'link' ? '✅ Copiato!' : '📋 Copia'}</span>
                </button>
                <a
                  href={referralLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors font-semibold shadow-md"
                >
                  <SafeIcon icon={FiExternalLink} className="text-sm" />
                  <span>🌐 Vai al Sito</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6 mb-6"
        >
          {sections.filter(section => section.available).map((section) => (
            <div key={section.id}>
              <motion.button
                onClick={section.action}
                className="w-full bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-left group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`${section.color} rounded-lg p-4 text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <SafeIcon icon={section.icon} className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-gray-600">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <SafeIcon 
                    icon={FiChevronRight} 
                    className={`text-lg text-gray-400 group-hover:text-purple-600 transition-colors ${
                      activeSection === section.id ? 'rotate-90' : ''
                    } transition-transform`} 
                  />
                </div>
              </motion.button>

              {/* Proofs Section Expandable Content - SOLO SE COMPLETATO */}
              <AnimatePresence>
                {activeSection === 'proofs' && section.id === 'proofs' && hasCompletedBonus && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white rounded-xl shadow-lg p-6 mt-4 border border-gray-200">
                      {/* Approved Proofs */}
                      <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                          🌟 Chi Ha Già Guadagnato!
                        </h2>
                        <ApprovedProofs />
                      </div>

                      {/* 🔥 SEZIONE UPLOAD RIMOSSA - Solo prove approvate visibili */}
                      <div className="text-center py-8 bg-green-50 border border-green-200 rounded-lg">
                        <SafeIcon icon={FiCheckCircle} className="text-6xl text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-green-800 mb-2">
                          🎉 Congratulazioni!
                        </h3>
                        <p className="text-green-700">
                          Hai completato questo bonus con successo! La tua prova è stata approvata.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* 🔥 SEZIONE UPLOAD PROVE - SOLO SE NON COMPLETATO */}
        {!hasCompletedBonus && userBonusState !== BONUS_STATES.NOT_STARTED && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📤 Invia Prova di Completamento
            </h2>

            {/* Submission Type */}
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                📋 Tipo di Prova
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="completion"
                    checked={submissionType === 'completion'}
                    onChange={(e) => setSubmissionType(e.target.value)}
                    className="mr-3 w-4 h-4 text-purple-600"
                  />
                  <span>✅ Prova di completamento bonus</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="payment"
                    checked={submissionType === 'payment'}
                    onChange={(e) => setSubmissionType(e.target.value)}
                    className="mr-3 w-4 h-4 text-purple-600"
                  />
                  <span>💰 Prova di pagamento ricevuto</span>
                </label>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                📎 Carica File
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-purple-300 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50'
                }`}
              >
                <input {...getInputProps()} />
                <SafeIcon icon={FiUpload} className="text-4xl text-purple-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  {isDragActive
                    ? '📂 Rilascia i file qui...'
                    : '📂 Trascina i file o clicca per selezionare'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, PDF, TXT (max 10MB)
                </p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200"
                    >
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiFile} className="text-purple-500 text-lg" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            📊 {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <SafeIcon icon={FiX} className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                💬 Note Aggiuntive (Opzionale)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50"
                placeholder="💭 Aggiungi eventuali note..."
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmission}
              disabled={uploadedFiles.length === 0 || isExpired}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {uploadedFiles.length === 0 
                ? '📎 Carica Prima un File'
                : isExpired
                ? '⏰ Bonus Scaduto'
                : '📤 Invia Prova'
              }
            </button>
          </motion.div>
        )}

        {/* Full Screen Modals */}
        <FullScreenGuide
          isOpen={showFullScreenGuide}
          onClose={() => setShowFullScreenGuide(false)}
          title={`📖 Guida ${bonus.name}`}
          content={bonus.guideCode ? convertToEmbedUrl(bonus.guideCode) : '<p>📖 Guida non disponibile per questo bonus.</p>'}
        />

        <FullScreenGuide
          isOpen={showFullScreenClosure}
          onClose={() => setShowFullScreenClosure(false)}
          title={`🔒 Chiusura Conto ${bonus.name}`}
          content={bonus.closureCode ? convertToEmbedUrl(bonus.closureCode) : '<p>🔒 Procedura di chiusura non disponibile per questo bonus.</p>'}
        />

        {/* 🔥 MODAL BONUS EXTRA */}
        <FullScreenGuide
          isOpen={showFullScreenExtra}
          onClose={() => setShowFullScreenExtra(false)}
          title={bonus.extraTitle || `⚡ Bonus Extra ${bonus.name}`}
          content={bonus.extraGuideCode ? convertToEmbedUrl(bonus.extraGuideCode) : '<p>⚡ Contenuto extra non disponibile per questo bonus.</p>'}
        />
      </div>
    </div>
  );
};

export default BonusDetail;