import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import BonusStateSelector from './BonusStateSelector';
import { getStateConfig, getStateProgress, BONUS_STATES } from '../utils/bonusStates';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiClock, FiDollarSign, FiTarget, FiBookOpen, FiPlay } = FiIcons;

const UserBonusProgress = ({ userBonuses, bonuses, compact = false }) => {
  const getProgressStats = () => {
    const total = bonuses.length;
    const completed = userBonuses.filter(ub => ub.state === BONUS_STATES.COMPLETED).length;
    const inProgress = userBonuses.filter(ub => [
      BONUS_STATES.IN_PROGRESS,
      BONUS_STATES.WAITING_DEPOSIT,
      BONUS_STATES.WAITING_PAYMENT,
      BONUS_STATES.STEP_1,
      BONUS_STATES.STEP_2,
      BONUS_STATES.STEP_3,
      BONUS_STATES.STEP_4,
      BONUS_STATES.STEP_5
    ].includes(ub.state)).length;
    
    const notStarted = bonuses.length - userBonuses.filter(ub => ub.state !== BONUS_STATES.HIDDEN).length;

    return { total, completed, inProgress, notStarted };
  };

  const stats = getProgressStats();

  if (compact) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-600">✅ Completati</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-xs text-gray-600">🔄 In Corso</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-600">{stats.notStarted}</div>
            <div className="text-xs text-gray-600">⚪ Non Iniziati</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{stats.total}</div>
            <div className="text-xs text-gray-600">📊 Totali</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <SafeIcon icon={FiTrendingUp} className="text-blue-600" />
          <span>📊 Il Tuo Progresso</span>
        </h3>

        {/* 🔥 MOBILE-FIRST STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
            <div className="text-xs sm:text-sm text-gray-600">✅ Completati</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">{stats.inProgress}</div>
            <div className="text-xs sm:text-sm text-gray-600">🔄 In Corso</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-gray-600 mb-1">{stats.notStarted}</div>
            <div className="text-xs sm:text-sm text-gray-600">⚪ Non Iniziati</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">📊 Totali</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>Progresso Complessivo</span>
            <span>{Math.round((stats.completed / stats.total) * 100)}% completato</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 sm:h-3 rounded-full transition-all duration-500"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bonus List */}
      <div className="space-y-3 sm:space-y-4">
        {bonuses.map((bonus) => {
          const userBonus = userBonuses.find(ub => ub.bonusId === bonus.id);
          const currentState = userBonus?.state || BONUS_STATES.NOT_STARTED;
          const stateConfig = getStateConfig(currentState);

          // Non mostrare bonus nascosti
          if (currentState === BONUS_STATES.HIDDEN) {
            return null;
          }

          const progress = getStateProgress(currentState);
          const isExpired = new Date(bonus.expiryDate) < new Date();

          return (
            <motion.div
              key={bonus.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
                isExpired ? 'opacity-75' : ''
              }`}
            >
              {/* 🔥 MOBILE-FIRST LAYOUT */}
              <div className="space-y-4">
                {/* Header con immagine e titolo */}
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <img
                    src={bonus.image}
                    alt={bonus.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      {bonus.name}
                    </h4>
                    {/* Info mobile-friendly */}
                    <div className="flex flex-col space-y-1 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiDollarSign} className="text-green-600 text-xs" />
                        <span>€{bonus.signupBonus}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiClock} className="text-gray-500 text-xs" />
                        <span>Scade: {new Date(bonus.expiryDate).toLocaleDateString('it-IT')}</span>
                      </div>
                    </div>
                  </div>
                  {/* State Badge - Mobile friendly */}
                  <div className="flex-shrink-0">
                    <BonusStateSelector
                      currentState={currentState}
                      onStateChange={() => {}} // Read-only per utenti
                      disabled={true}
                      userMode={true}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        progress === 100
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : progress > 50
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Section */}
                {stateConfig.userVisible && currentState !== BONUS_STATES.COMPLETED && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="text-xs sm:text-sm text-gray-600">
                      {stateConfig.userDescription}
                    </div>
                    {/* 🔥 BOTTONE INIZIA CHE PORTA ALLA GUIDA */}
                    <Link
                      to={`/bonus/${bonus.id}`}
                      className={`inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                        currentState === BONUS_STATES.NOT_STARTED
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : currentState === BONUS_STATES.WAITING_PAYMENT
                          ? 'bg-yellow-100 text-yellow-800 cursor-default'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {currentState === BONUS_STATES.NOT_STARTED && (
                        <>
                          <SafeIcon icon={bonus.guideCode ? FiBookOpen : FiPlay} className="text-sm" />
                          <span>🚀 {bonus.guideCode ? 'Inizia con Guida' : 'Inizia'}</span>
                        </>
                      )}
                      {currentState === BONUS_STATES.INTERESTED && (
                        <>
                          <SafeIcon icon={FiPlay} className="text-sm" />
                          <span>💡 Continua</span>
                        </>
                      )}
                      {currentState === BONUS_STATES.IN_PROGRESS && (
                        <>
                          <SafeIcon icon={FiPlay} className="text-sm" />
                          <span>⚡ In Corso</span>
                        </>
                      )}
                      {[BONUS_STATES.STEP_1, BONUS_STATES.STEP_2, BONUS_STATES.STEP_3].includes(currentState) && (
                        <>
                          <SafeIcon icon={FiPlay} className="text-sm" />
                          <span>🔄 Continua</span>
                        </>
                      )}
                      {currentState === BONUS_STATES.WAITING_DEPOSIT && (
                        <>
                          <SafeIcon icon={FiDollarSign} className="text-sm" />
                          <span>💳 Deposita</span>
                        </>
                      )}
                      {currentState === BONUS_STATES.WAITING_PAYMENT && (
                        <>
                          <SafeIcon icon={FiClock} className="text-sm" />
                          <span>⏳ In Attesa</span>
                        </>
                      )}
                    </Link>
                  </div>
                )}

                {/* Completion Badge */}
                {currentState === BONUS_STATES.COMPLETED && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <SafeIcon icon={FiTarget} className="text-green-600 flex-shrink-0" />
                    <span className="text-green-800 font-medium text-sm">
                      🎉 Bonus completato con successo!
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UserBonusProgress;