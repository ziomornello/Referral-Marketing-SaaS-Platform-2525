import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import BonusCard from '../components/BonusCard';
import UserBonusProgress from '../components/UserBonusProgress';
import SafeIcon from '../common/SafeIcon';
import { BONUS_STATES } from '../utils/bonusStates';
import * as FiIcons from 'react-icons/fi';

const { FiAward, FiTrendingUp, FiGift, FiArrowRight, FiEuro, FiBell, FiX } = FiIcons;

const Dashboard = () => {
  const { user } = useAuth();
  const { bonuses, submissions, appConfig, loading, connectionError, notifications, markNotificationAsRead } = useData();
  const [bonusFilter, setBonusFilter] = useState('available');
  const [showNotifications, setShowNotifications] = useState(false);

  // Funzione per determinare se il nome è femminile
  const isFeminineName = (name) => {
    if (!name) return false;
    const femaleEndings = ['a', 'ia', 'ella', 'ina', 'anna', 'etta', 'osa', 'ica'];
    const femalePrefixes = ['maria', 'anna', 'giulia', 'francesca', 'alessia', 'chiara', 'sara', 'elena', 'valentina'];
    const lowerName = name.toLowerCase().trim();

    // Controlla nomi femminili comuni
    if (femalePrefixes.some(prefix => lowerName.startsWith(prefix))) {
      return true;
    }

    // Controlla terminazioni femminili
    return femaleEndings.some(ending => lowerName.endsWith(ending));
  };

  const welcomeText = isFeminineName(user?.name) ? 'Benvenuta' : 'Benvenuto';

  // 🔥 NOTIFICHE UTENTE
  const userNotifications = notifications.filter(n => n.user_id === user?.id && !n.is_read);

  // 🔥 SIMULAZIONE DATI UTENTE-BONUS CON FILTRO PER BONUS BLOCCATI/NASCOSTI
  const userBonuses = bonuses.map(bonus => {
    const submission = submissions.find(sub => sub.userId === user?.id && sub.bonusId === bonus.id);
    if (submission) {
      // Mappa vecchi stati a nuovi stati
      let state = BONUS_STATES.NOT_STARTED;
      switch (submission.status) {
        case 'pending':
          state = BONUS_STATES.WAITING_PAYMENT;
          break;
        case 'approved':
          state = BONUS_STATES.COMPLETED;
          break;
        case 'rejected':
          state = BONUS_STATES.REJECTED;
          break;
        case 'blocked':
          state = BONUS_STATES.BLOCKED;
          break;
        case 'user_declined':
          state = BONUS_STATES.USER_DECLINED;
          break;
        case 'hidden':
          state = BONUS_STATES.HIDDEN;
          break;
        default:
          state = BONUS_STATES.NOT_STARTED;
      }

      return {
        bonusId: bonus.id,
        state: state
      };
    }

    return {
      bonusId: bonus.id,
      state: BONUS_STATES.NOT_STARTED
    };
  });

  // 🔥 FILTRO BONUS VISIBILI ALL'UTENTE - Nasconde solo bonus bloccati e nascosti dall'admin
  const getVisibleBonusesForUser = () => {
    return bonuses.filter(bonus => {
      const userBonus = userBonuses.find(ub => ub.bonusId === bonus.id);
      if (!userBonus) return true; // Se non ha submission, è visibile

      // 🔥 NASCONDE SOLO BONUS BLOCCATI/NASCOSTI DALL'ADMIN (NON user_declined)
      const hiddenStates = [
        BONUS_STATES.BLOCKED,      // Admin ha bloccato il bonus
        BONUS_STATES.HIDDEN,       // Admin ha nascosto il bonus
        // NON includiamo USER_DECLINED - l'utente deve poterli vedere nella sezione dedicata
      ];

      return !hiddenStates.includes(userBonus.state);
    });
  };

  const visibleBonuses = getVisibleBonusesForUser();

  // Get user's declined bonuses
  const userDeclinedBonuses = userBonuses
    .filter(ub => ub.state === BONUS_STATES.USER_DECLINED)
    .map(ub => bonuses.find(b => b.id === ub.bonusId))
    .filter(Boolean);

  // Get user's completed bonuses (solo tra quelli visibili)
  const userCompletedBonuses = submissions
    .filter(sub => sub.userId === user?.id && sub.status === 'approved')
    .map(sub => sub.bonusId)
    .filter(bonusId => visibleBonuses.some(b => b.id === bonusId)); // Solo bonus visibili

  // 🔥 CALCOLA GUADAGNI POTENZIALI - Solo bonus visibili e non rifiutati
  const calculatePotentialEarnings = () => {
    const availableBonuses = visibleBonuses.filter(bonus => {
      const userBonus = userBonuses.find(ub => ub.bonusId === bonus.id);
      return bonus.isActive &&
        new Date(bonus.expiryDate) > new Date() &&
        !userCompletedBonuses.includes(bonus.id) &&
        userBonus?.state !== BONUS_STATES.USER_DECLINED; // Escludi quelli rifiutati dall'utente
    });

    // 🔥 SOLO BONUS ISCRIZIONE - NON INCLUDIAMO REFERRAL
    const totalSignup = availableBonuses.reduce((sum, bonus) => sum + bonus.signupBonus, 0);

    return {
      totalPotential: totalSignup, // Solo signup bonus
      totalSignup,
      availableCount: availableBonuses.length,
      availableBonuses
    };
  };

  const potentialEarnings = calculatePotentialEarnings();

  // 🔥 SMART SORTING - Priorità per urgenza di scadenza (solo bonus visibili)
  const getFilteredBonuses = () => {
    const activeBonuses = visibleBonuses.filter(bonus => bonus.isActive);
    let filtered = [];

    switch (bonusFilter) {
      case 'available':
        filtered = activeBonuses.filter(bonus => {
          const userBonus = userBonuses.find(ub => ub.bonusId === bonus.id);
          return new Date(bonus.expiryDate) > new Date() &&
            !userCompletedBonuses.includes(bonus.id) &&
            userBonus?.state !== BONUS_STATES.USER_DECLINED; // Escludi rifiutati
        });
        break;
      case 'completed':
        filtered = activeBonuses.filter(bonus =>
          userCompletedBonuses.includes(bonus.id)
        );
        break;
      case 'expired':
        filtered = activeBonuses.filter(bonus =>
          new Date(bonus.expiryDate) <= new Date()
        );
        break;
      // 🔥 NUOVA CATEGORIA: BONUS RIFIUTATI DALL'UTENTE
      case 'declined':
        filtered = userDeclinedBonuses;
        break;
      default:
        filtered = activeBonuses;
    }

    // 🔥 SMART SORTING - Priorità per scadenza urgente
    if (bonusFilter === 'available') {
      return filtered.sort((a, b) => {
        const today = new Date();
        const expiryA = new Date(a.expiryDate);
        const expiryB = new Date(b.expiryDate);
        const daysA = Math.ceil((expiryA - today) / (1000 * 60 * 60 * 24));
        const daysB = Math.ceil((expiryB - today) / (1000 * 60 * 60 * 24));

        // 🔥 PRIORITÀ 1: Scade oggi
        const isExpiringTodayA = expiryA.toDateString() === today.toDateString();
        const isExpiringTodayB = expiryB.toDateString() === today.toDateString();
        if (isExpiringTodayA && !isExpiringTodayB) return -1;
        if (!isExpiringTodayA && isExpiringTodayB) return 1;

        // 🔥 PRIORITÀ 2: Scade domani
        if (daysA === 1 && daysB !== 1) return -1;
        if (daysA !== 1 && daysB === 1) return 1;

        // 🔥 PRIORITÀ 3: Scade presto (2-3 giorni)
        const isExpiringSoonA = daysA <= 3 && daysA >= 0;
        const isExpiringSoonB = daysB <= 3 && daysB >= 0;
        if (isExpiringSoonA && !isExpiringSoonB) return -1;
        if (!isExpiringSoonA && isExpiringSoonB) return 1;

        // Ordina per giorni rimasti (crescente)
        return daysA - daysB;
      });
    }

    return filtered;
  };

  const filteredBonuses = getFilteredBonuses();

  // 🔥 FUNZIONE PER GESTIRE CAMBIO STATO BONUS DALL'UTENTE
  const handleBonusStateChange = (bonusId, newState) => {
    // Aggiorna lo stato locale per feedback immediato
    const updatedBonuses = userBonuses.map(ub => 
      ub.bonusId === bonusId ? { ...ub, state: newState } : ub
    );
    // In un'app reale, qui invieresti la richiesta al server
    console.log('🔄 Stato bonus aggiornato dall\'utente:', { bonusId, newState });
  };

  const stats = [
    {
      icon: FiTrendingUp,
      label: 'Bonus Completati',
      value: userCompletedBonuses.length,
      color: 'text-green-600',
      bg: 'bg-gradient-to-br from-green-400 to-green-600'
    },
    {
      icon: FiGift,
      label: 'Bonus Disponibili',
      value: visibleBonuses.filter(b => {
        const userBonus = userBonuses.find(ub => ub.bonusId === b.id);
        return b.isActive && 
          new Date(b.expiryDate) > new Date() && 
          userBonus?.state !== BONUS_STATES.USER_DECLINED;
      }).length,
      color: 'text-blue-600',
      bg: 'bg-gradient-to-br from-blue-400 to-blue-600'
    }
  ];

  // Add points stat only if points system is enabled
  if (appConfig.pointsSystemEnabled) {
    stats.unshift({
      icon: FiAward,
      label: 'Punti Totali',
      value: user?.points || 0,
      color: 'text-purple-600',
      bg: 'bg-gradient-to-br from-purple-400 to-purple-600'
    });
  }

  const filterOptions = [
    {
      key: 'available',
      label: 'Disponibili',
      emoji: '🎯',
      count: visibleBonuses.filter(b => {
        const userBonus = userBonuses.find(ub => ub.bonusId === b.id);
        return b.isActive &&
          new Date(b.expiryDate) > new Date() &&
          !userCompletedBonuses.includes(b.id) &&
          userBonus?.state !== BONUS_STATES.USER_DECLINED;
      }).length
    },
    {
      key: 'completed',
      label: 'Completati',
      emoji: '✅',
      count: visibleBonuses.filter(b => userCompletedBonuses.includes(b.id)).length
    },
    // 🔥 NUOVA CATEGORIA: BONUS RIFIUTATI
    {
      key: 'declined',
      label: 'Non Interessato',
      emoji: '🙅',
      count: userDeclinedBonuses.length
    },
    {
      key: 'expired',
      label: 'Scaduti',
      emoji: '⏰',
      count: visibleBonuses.filter(b => new Date(b.expiryDate) <= new Date()).length
    }
  ];

  const handleNotificationClick = async (notification) => {
    await markNotificationAsRead(notification.id);
    setShowNotifications(false);

    // Navigate based on notification type
    if (notification.type === 'bonus_status_update' && notification.metadata?.bonusName) {
      // Find bonus and navigate to it
      const bonus = bonuses.find(b => b.name === notification.metadata.bonusName);
      if (bonus) {
        window.location.href = `#/bonus/${bonus.id}`;
      }
    }
  };

  // 🔥 FIX: Funzione per chiudere le notifiche
  const handleCloseNotifications = (e) => {
    e.stopPropagation(); // Previene la propagazione del click
    setShowNotifications(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-600 mb-4"></div>
          <p className="text-gray-600">🔄 Caricamento dati...</p>
          {connectionError && (
            <p className="text-red-600 mt-2">❌ Problema di connessione al database</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                🎉 {welcomeText}, {user?.name}!
              </h1>
            </div>

            {/* 🔥 NOTIFICATIONS BELL CON X MIGLIORATA */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 bg-white rounded-full shadow-lg border border-purple-200 hover:shadow-xl transition-all"
              >
                <SafeIcon icon={FiBell} className="text-xl text-purple-600" />
                {userNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {userNotifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-purple-100 z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">🔔 Notifiche</h3>
                      {/* 🔥 FIX: X Button migliorata con migliore visibilità e funzionalità */}
                      <button
                        onClick={handleCloseNotifications}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        title="Chiudi notifiche"
                      >
                        <SafeIcon icon={FiX} className="text-lg text-gray-500 group-hover:text-gray-700" />
                      </button>
                    </div>
                  </div>
                  {userNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {userNotifications.slice(0, 5).map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className="w-full text-left p-4 hover:bg-purple-50 transition-colors"
                        >
                          <h4 className="font-medium text-gray-900 mb-1 text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            {new Date(notification.created_at).toLocaleDateString('it-IT')}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <SafeIcon icon={FiBell} className="text-4xl mb-2" />
                      <p>Nessuna notifica</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Connection Error Alert */}
        {connectionError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-800">
                <div>
                  <h3 className="font-medium">Problema di Connessione</h3>
                  <p className="text-sm text-red-600">
                    Non è possibile connettersi al database. I dati potrebbero non essere aggiornati.
                  </p>
                </div>
              </div>
              {/* 🔥 FIX: X Button per chiudere l'alert */}
              <button
                onClick={() => window.location.reload()}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                title="Ricarica pagina"
              >
                <SafeIcon icon={FiX} className="text-lg text-red-600 group-hover:text-red-700" />
              </button>
            </div>
          </motion.div>
        )}

        {/* 🔥 GUADAGNI POTENZIALI - Sezione prominente con messaggio accattivante */}
        {potentialEarnings.totalPotential > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <SafeIcon icon={FiEuro} className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold mb-1">
                      🤑 Potresti guadagnare altri €{potentialEarnings.totalPotential.toFixed(2)}!
                    </h2>
                    <p className="text-green-100 text-lg">
                      💰 Bastano {potentialEarnings.availableCount} semplici iscrizioni gratuite!
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="text-sm text-green-100">💡 Bonus Disponibili</div>
                    <div className="text-xl font-bold">{potentialEarnings.availableCount} App</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center lg:text-left">
                <p className="text-green-100">
                  🚀 Registrati subito alle app qui sotto e inizia a guadagnare denaro vero!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-purple-100"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bg} mb-3 shadow-md`}>
                <SafeIcon icon={stat.icon} className="text-xl text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* 🔥 SEZIONE PROGRESSO BONUS (solo bonus visibili) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <UserBonusProgress 
            userBonuses={userBonuses.filter(ub => visibleBonuses.some(b => b.id === ub.bonusId))} 
            bonuses={visibleBonuses} 
          />
        </motion.div>

        {/* Bonus Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              🎁 I Tuoi Bonus
            </h2>
            <Link
              to="/"
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
            >
              <span>👀 Vedi tutti</span>
              <SafeIcon icon={FiArrowRight} className="text-sm" />
            </Link>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setBonusFilter(option.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                  bonusFilter === option.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200 hover:shadow-md'
                }`}
              >
                <span className="text-lg">{option.emoji}</span>
                <span>{option.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  bonusFilter === option.key
                    ? 'bg-white bg-opacity-20'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Available Bonuses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {filteredBonuses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBonuses.map((bonus, index) => {
                const userBonus = userBonuses.find(ub => ub.bonusId === bonus.id);
                return (
                  <motion.div
                    key={bonus.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <BonusCard 
                      bonus={bonus} 
                      showDetails={true}
                      userBonusState={userBonus?.state}
                      onStateChange={(newState) => handleBonusStateChange(bonus.id, newState)}
                      showDeclineOption={bonusFilter === 'available'} // Mostra opzione rifiuto solo nei disponibili
                    />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-purple-100 shadow-lg">
              <SafeIcon icon={FiGift} className="text-6xl text-purple-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-4">
                {bonusFilter === 'available' && '🎯 Nessun bonus disponibile'}
                {bonusFilter === 'completed' && '✅ Nessun bonus completato'}
                {bonusFilter === 'declined' && '🙅 Nessun bonus rifiutato'}
                {bonusFilter === 'expired' && '⏰ Nessun bonus scaduto'}
              </h3>
              <p className="text-gray-400 mb-6">
                {bonusFilter === 'available' && '🔄 Torna presto per nuove opportunità'}
                {bonusFilter === 'completed' && '🚀 Inizia a completare alcuni bonus'}
                {bonusFilter === 'declined' && '💭 I bonus che rifiuterai appariranno qui con la possibilità di cambiare idea'}
                {bonusFilter === 'expired' && '✨ Non hai perso nessuna opportunità'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;