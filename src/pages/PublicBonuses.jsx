import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import BonusCard from '../components/BonusCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiGift, FiTrendingUp, FiUsers, FiStar } = FiIcons;

const PublicBonuses = () => {
  const { bonuses } = useData();
  const { user } = useAuth();

  // 🔥 SMART SORTING - Priorità per urgenza di scadenza anche per utenti non loggati
  const sortBonusesByUrgency = (bonusesArray) => {
    return bonusesArray.sort((a, b) => {
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

      // 🔥 PRIORITÀ 4: Non scaduti prima di quelli scaduti
      const isExpiredA = expiryA < today;
      const isExpiredB = expiryB < today;
      if (!isExpiredA && isExpiredB) return -1;
      if (isExpiredA && !isExpiredB) return 1;

      // Ordina per giorni rimasti (crescente)
      return daysA - daysB;
    });
  };

  const activeBonuses = bonuses.filter(bonus => bonus.isActive);
  const sortedBonuses = sortBonusesByUrgency([...activeBonuses]);

  const stats = [
    {
      icon: FiGift,
      label: 'Bonus Disponibili',
      value: activeBonuses.length,
      color: 'text-primary-600'
    },
    {
      icon: FiTrendingUp,
      label: 'Guadagno Medio',
      value: `€${Math.round(
        activeBonuses.reduce((acc, bonus) => acc + bonus.signupBonus, 0) / activeBonuses.length || 0
      )}`,
      color: 'text-success-600'
    },
    {
      icon: FiUsers,
      label: 'Utenti Attivi',
      value: '1,234',
      color: 'text-warning-600'
    },
    {
      icon: FiStar,
      label: 'Rating Medio',
      value: '4.8',
      color: 'text-error-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">
              Guadagna con i Bonus di Iscrizione
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Scopri le migliori opportunità di bonus e referral. Guadagna denaro registrandoti a servizi gratuiti e invitando i tuoi amici.
            </p>
            {!user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-x-4"
              >
                <a
                  href="#bonuses"
                  className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Esplora Bonus
                </a>
                <a
                  href="/register"
                  className="inline-block bg-primary-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-800 transition-colors border border-primary-500"
                >
                  Registrati Gratuitamente
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4 ${stat.color}`}>
                  <SafeIcon icon={stat.icon} className="text-xl" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bonuses Section */}
      <section id="bonuses" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bonus Disponibili
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tutti i bonus attualmente disponibili. {!user && ' Registrati per accedere ai dettagli completi e iniziare a guadagnare.'}
            </p>
          </motion.div>

          {sortedBonuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedBonuses.map((bonus, index) => (
                <motion.div
                  key={bonus.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BonusCard bonus={bonus} showDetails={!!user} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiGift} className="text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">
                Nessun bonus disponibile
              </h3>
              <p className="text-gray-400">
                Torna presto per scoprire nuove opportunità di guadagno
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white"
            >
              <h2 className="text-3xl font-bold mb-4">
                Pronto a Iniziare?
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Registrati gratuitamente e accedi a tutte le opportunità di guadagno, guide dettagliate e al sistema di punti.
              </p>
              <a
                href="/register"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Registrati Gratuitamente
              </a>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PublicBonuses;