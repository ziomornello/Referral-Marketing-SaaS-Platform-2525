import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import SafeIcon from '../common/SafeIcon';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { BONUS_STATES } from '../utils/bonusStates';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiEuro, FiUsers, FiArrowRight, FiClock, FiX, FiRotateCcw } = FiIcons;

const BonusCard = ({ 
  bonus, 
  showDetails = false, 
  userBonusState = null, 
  onStateChange = null, 
  showDeclineOption = false 
}) => {
  const { addSubmission, updateSubmissionStatus, submissions } = useData();
  const { user } = useAuth();

  const isExpired = new Date(bonus.expiryDate) < new Date();
  const today = new Date();
  const expiryDate = new Date(bonus.expiryDate);
  const isExpiringToday = expiryDate.toDateString() === today.toDateString();
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 3 && daysUntilExpiry >= 0;

  console.log('🎯 BonusCard render:', {
    bonus,
    showDetails,
    isExpired,
    isExpiringToday,
    daysUntilExpiry,
    isExpiringSoon,
    userBonusState
  });

  if (!bonus) {
    console.log('❌ BonusCard: bonus non definito');
    return null;
  }

  // 🔥 FIX: GESTIONE RIFIUTO BONUS SEMPLIFICATA SENZA POPUP
  const handleDeclineBonus = async () => {
    if (!user) {
      toast.error('❌ Devi essere loggato');
      return;
    }

    try {
      console.log('🔄 Rifiuto bonus:', {
        userId: user.id,
        bonusId: bonus.id,
        bonusName: bonus.name
      });

      // 🔥 FIX: Crea submission con stato corretto
      const submission = {
        userId: user.id,
        userName: user.name,
        bonusId: bonus.id,
        bonusName: bonus.name,
        type: 'admin_update', // 🔥 FIX: Cambiato da user_declined a admin_update
        files: [],
        notes: `Utente non interessato al bonus (${new Date().toLocaleString('it-IT')})`,
        status: 'user_declined' // 🔥 Lo status rimane user_declined
      };

      console.log('📤 Dati submission da creare:', submission);
      await addSubmission(submission, true); // 🔥 FIX: true per admin_created

      if (onStateChange) {
        onStateChange(BONUS_STATES.USER_DECLINED);
      }

      toast.success(
        `✅ Hai segnalato di non essere interessato al bonus "${bonus.name}". Puoi sempre cambiare idea dalla tua dashboard.`,
        {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            color: '#fff',
            borderRadius: '12px'
          }
        }
      );

      // 🔥 FIX: Ricarica la pagina per aggiornare lo stato
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Errore nel rifiutare il bonus:', error);
      toast.error('❌ Errore nel salvare la preferenza: ' + (error.message || 'Errore sconosciuto'));
    }
  };

  // 🔥 FIX: GESTIONE RIPENSAMENTO CON updateSubmissionStatus
  const handleReinterest = async () => {
    if (!user) {
      toast.error('❌ Devi essere loggato');
      return;
    }

    try {
      console.log('🔄 Inizio ripensamento per bonus:', bonus.id, 'utente:', user.id);

      // 🔥 FIX: Trova la submission esistente
      const existingSubmission = submissions.find(sub => 
        sub.userId === user.id && 
        sub.bonusId === bonus.id && 
        sub.status === 'user_declined'
      );

      if (existingSubmission) {
        console.log('📝 Aggiornamento submission esistente:', existingSubmission.id);
        // Aggiorna la submission esistente
        await updateSubmissionStatus(
          existingSubmission.id,
          'cancelled',
          `Utente ha cambiato idea - reinteressato al bonus (${new Date().toLocaleString('it-IT')})`,
          false // Notifica utente
        );
      } else {
        console.log('➕ Creazione nuova submission per reset');
        // Crea nuova submission di reset
        const resetSubmission = {
          userId: user.id,
          userName: user.name,
          bonusId: bonus.id,
          bonusName: bonus.name,
          type: 'admin_update',
          files: [],
          notes: `Utente ha cambiato idea - reinteressato al bonus (${new Date().toLocaleString('it-IT')})`,
          status: 'cancelled'
        };

        await addSubmission(resetSubmission, true); // admin_created=true
      }

      if (onStateChange) {
        onStateChange(BONUS_STATES.NOT_STARTED);
      }

      toast.success(
        `✅ Ora sei di nuovo interessato al bonus "${bonus.name}"!`,
        {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            borderRadius: '12px'
          }
        }
      );

      // 🔥 FIX: Ricarica la pagina per aggiornare lo stato
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Errore nel ripristinare interesse:', error);
      toast.error('❌ Errore nel salvare la preferenza: ' + (error.message || 'Errore sconosciuto'));
    }
  };

  // 🔥 Determine priority styling with urgency messaging
  const getPriorityStyle = () => {
    if (userBonusState === BONUS_STATES.USER_DECLINED) {
      return {
        borderColor: '#ea580c', // orange-600
        backgroundColor: '#fff7ed', // orange-50
        priority: 0,
        label: '🙅 Non Interessato',
        labelColor: 'text-orange-700 bg-orange-100',
        urgentMessage: '💭 Hai segnalato di non essere interessato a questo bonus'
      };
    }

    if (isExpiringToday) {
      return {
        borderColor: '#dc2626', // red-600
        backgroundColor: '#fef2f2', // red-50
        priority: 1,
        label: '🚨 ULTIMO GIORNO - SCADE OGGI!',
        labelColor: 'text-red-700 bg-red-100',
        urgentMessage: '⚡ AFFRETTATI! Ultimo giorno disponibile!'
      };
    }

    if (daysUntilExpiry === 1) {
      return {
        borderColor: '#dc2626', // red-600
        backgroundColor: '#fef2f2', // red-50
        priority: 1,
        label: '🔥 SCADE DOMANI - ULTIMO GIORNO UTILE!',
        labelColor: 'text-red-700 bg-red-100',
        urgentMessage: '⏰ Solo un giorno rimasto! Non perdere questa opportunità!'
      };
    }

    if (isExpiringSoon) {
      return {
        borderColor: '#d97706', // amber-600
        backgroundColor: '#fffbeb', // amber-50
        priority: 2,
        label: `⚠️ SCADE TRA ${daysUntilExpiry} GIORNI - AFFRETTATI!`,
        labelColor: 'text-amber-700 bg-amber-100',
        urgentMessage: `⏳ Solo ${daysUntilExpiry} giorni rimasti! Inizia subito!`
      };
    }

    if (isExpired) {
      return {
        borderColor: '#6b7280', // gray-500
        backgroundColor: '#f9fafb', // gray-50
        priority: 3,
        label: '❌ SCADUTO',
        labelColor: 'text-gray-700 bg-gray-100',
        urgentMessage: 'Bonus non più disponibile'
      };
    }

    return {
      borderColor: '#e5e7eb', // gray-200
      backgroundColor: '#ffffff', // white
      priority: 4,
      label: null,
      labelColor: '',
      urgentMessage: ''
    };
  };

  const priorityStyle = getPriorityStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: isExpired ? 0 : -5 }}
      className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
        isExpired ? 'opacity-60' : 'hover:shadow-xl'
      } ${
        isExpiringToday || daysUntilExpiry === 1 
          ? 'ring-2 ring-red-500 ring-opacity-50 animate-pulse' 
          : ''
      }`}
      style={{
        backgroundColor: priorityStyle.backgroundColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: priorityStyle.borderColor
      }}
    >
      {/* Priority Label */}
      {priorityStyle.label && (
        <div className={`px-4 py-2 text-center font-bold text-sm ${priorityStyle.labelColor}`}>
          {priorityStyle.label}
        </div>
      )}

      <div className="relative">
        {/* 🔥 FIX: Immagine responsive con object-fit per non tagliare */}
        <div className="w-full h-40 sm:h-48 overflow-hidden">
          <img 
            src={bonus.image} 
            alt={bonus.name}
            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              console.log('❌ Errore caricamento immagine bonus:', bonus.image);
              e.target.src = 'https://via.placeholder.com/300x200?text=Immagine+Non+Disponibile';
            }}
          />
        </div>

        {isExpired && !isExpiringToday && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-base sm:text-lg">SCADUTO</span>
          </div>
        )}

        <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium ${
          isExpiringToday || daysUntilExpiry === 1 
            ? 'bg-red-600 text-white ring-2 ring-red-300 animate-pulse'
            : isExpiringSoon 
            ? 'bg-amber-600 text-white ring-2 ring-amber-300'
            : 'bg-primary-600 text-white'
        }`}>
          €{bonus.signupBonus}
        </div>

        {/* Urgency indicator */}
        {(isExpiringToday || daysUntilExpiry === 1) && (
          <div className="absolute top-3 left-3 bg-red-600 text-white p-2 rounded-full animate-pulse">
            🚨
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{bonus.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{bonus.description}</p>

        {/* 🔥 Urgent message for expiring bonuses */}
        {priorityStyle.urgentMessage && !isExpired && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            isExpiringToday || daysUntilExpiry === 1
              ? 'bg-red-100 text-red-800 border border-red-200'
              : userBonusState === BONUS_STATES.USER_DECLINED
              ? 'bg-orange-100 text-orange-800 border border-orange-200'
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}>
            {priorityStyle.urgentMessage}
          </div>
        )}

        <div className="space-y-2 sm:space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-success-600">
              <SafeIcon icon={FiEuro} className="text-sm" />
              <span className="text-xs sm:text-sm">Bonus Iscrizione: €{bonus.signupBonus}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-primary-600">
              <SafeIcon icon={FiUsers} className="text-sm" />
              <span className="text-xs sm:text-sm">Bonus Referral: €{bonus.referralBonus}</span>
            </div>
          </div>

          <div className={`flex items-center space-x-2 text-xs sm:text-sm ${
            isExpiringToday || daysUntilExpiry === 1 
              ? 'text-red-700 font-bold'
              : isExpiringSoon 
              ? 'text-amber-700 font-semibold'
              : isExpired 
              ? 'text-gray-500'
              : 'text-gray-500'
          }`}>
            <SafeIcon icon={FiCalendar} className="text-sm" />
            <span>
              {isExpiringToday 
                ? '🚨 SCADE OGGI!'
                : daysUntilExpiry === 1
                ? '🔥 SCADE DOMANI!'
                : isExpired
                ? `Scaduto il ${format(new Date(bonus.expiryDate), 'dd MMMM yyyy', { locale: it })}`
                : `Scade il ${format(new Date(bonus.expiryDate), 'dd MMMM yyyy', { locale: it })}`
              }
            </span>
          </div>
        </div>

        {/* 🔥 AZIONI BASED ON STATE */}
        {userBonusState === BONUS_STATES.USER_DECLINED ? (
          // Bonus rifiutato dall'utente - Mostra opzione per cambiare idea
          <div className="space-y-3">
            <div className="text-center text-xs sm:text-sm text-orange-700 py-2 sm:py-3 bg-orange-100 border border-orange-200 rounded-lg">
              🙅 Hai segnalato di non essere interessato a questo bonus
            </div>
            <button
              onClick={handleReinterest}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
            >
              <SafeIcon icon={FiRotateCcw} className="text-sm" />
              <span>Cambia Idea - Interessato!</span>
            </button>
          </div>
        ) : showDetails ? (
          // Bonus normale - Azioni standard con opzione rifiuto
          <div className="space-y-2">
            <Link
              to={`/bonus/${bonus.id}`}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                isExpired
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isExpiringToday || daysUntilExpiry === 1
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                  : isExpiringSoon
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
              onClick={(e) => {
                if (isExpired) {
                  e.preventDefault();
                  return;
                }
                console.log('🔗 Navigazione a bonus detail:', bonus.id);
              }}
            >
              <span>
                {isExpiringToday || daysUntilExpiry === 1
                  ? '🚨 INIZIA SUBITO!'
                  : isExpiringSoon
                  ? '⚠️ Inizia Prima che Scada'
                  : 'Visualizza Dettagli'
                }
              </span>
              <SafeIcon icon={FiArrowRight} className="text-sm" />
            </Link>

            {/* 🔥 OPZIONE RIFIUTO BONUS (solo se non scaduto e se richiesta) */}
            {!isExpired && showDeclineOption && (
              <button
                onClick={handleDeclineBonus}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm border border-gray-300"
              >
                <SafeIcon icon={FiX} className="text-sm" />
                <span>Non Interessato</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center text-xs sm:text-sm text-gray-500 py-2 sm:py-3 border border-gray-200 rounded-lg">
            Accedi per vedere i dettagli
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BonusCard;