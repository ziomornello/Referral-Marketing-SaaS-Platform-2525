import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { getStateConfig, getNextStates, canTransitionTo, BONUS_STATES, getStateProgress } from '../utils/bonusStates';
import * as FiIcons from 'react-icons/fi';

const { FiChevronDown, FiCheck, FiX, FiTrendingUp } = FiIcons;

const BonusStateSelector = ({ 
  currentState, 
  onStateChange, 
  disabled = false, 
  showProgress = false, 
  compact = false, 
  userMode = false,
  allowedStates = null 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = getStateConfig(currentState);
  const availableStates = getNextStates(currentState, allowedStates);
  const progress = getStateProgress(currentState, allowedStates);

  const handleStateChange = (newState) => {
    if (canTransitionTo(currentState, newState, allowedStates)) {
      onStateChange(newState);
      setIsOpen(false);
    }
  };

  // Per gli utenti, mostra sempre il componente ma con interazioni limitate
  if (userMode && !currentConfig.userVisible) {
    return null;
  }

  return (
    <div className="relative">
      {/* Current State Display */}
      <button
        onClick={() => !disabled && !userMode && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all
          ${compact ? 'text-sm' : 'text-base'}
          ${currentConfig.color}
          ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md cursor-pointer'}
          ${userMode ? 'cursor-default' : ''}
        `}
      >
        <span className={compact ? 'text-sm' : 'text-lg'}>
          {currentConfig.emoji}
        </span>
        <span className="font-medium">
          {userMode ? currentConfig.userLabel : currentConfig.label}
        </span>
        {!userMode && !disabled && (
          <SafeIcon
            icon={FiChevronDown}
            className={`text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* 🔥 PROGRESS BAR CON PERCENTUALE DINAMICA */}
      {showProgress && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          <div className="text-xs text-gray-600 mt-1 text-center">
            {progress}% completato
          </div>
        </div>
      )}

      {/* User Mode Description */}
      {userMode && currentConfig.userDescription && (
        <p className="mt-1 text-xs text-gray-600">
          {currentConfig.userDescription}
        </p>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !userMode && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1">
                🔄 Cambia Passaggio
              </h3>
              <p className="text-sm text-gray-600">
                Stato attuale: <span className="font-medium">{currentConfig.label}</span>
              </p>
              {allowedStates && (
                <div className="flex items-center space-x-2 mt-2">
                  <SafeIcon icon={FiTrendingUp} className="text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">
                    Progresso: {progress}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {availableStates.map((state) => {
                const stateConfig = getStateConfig(state);
                const stateProgress = getStateProgress(state, allowedStates);
                
                return (
                  <button
                    key={state}
                    onClick={() => handleStateChange(state)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl mt-0.5">
                        {stateConfig.emoji}
                      </span>
                      <div className="flex-1">
                        <div className={`font-medium ${stateConfig.color.split(' ')[0]}`}>
                          {stateConfig.label}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {stateConfig.description}
                        </div>
                        {/* 🔥 MOSTRA PERCENTUALE PER OGNI STATO */}
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          {stateProgress}% del progresso totale
                        </div>
                      </div>
                      <SafeIcon
                        icon={FiCheck}
                        className="text-green-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <SafeIcon icon={FiX} className="text-sm" />
                <span>Annulla</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BonusStateSelector;