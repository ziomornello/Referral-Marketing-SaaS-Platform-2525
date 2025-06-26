import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiToggleLeft, FiToggleRight, FiSave, FiAward, FiGift, FiMessageCircle } = FiIcons;

const AdminSettings = () => {
  const { appConfig, updateAppConfig } = useData();
  const [localConfig, setLocalConfig] = useState(appConfig);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key) => {
    const newValue = !localConfig[key];
    setLocalConfig(prev => ({
      ...prev,
      [key]: newValue
    }));

    try {
      await updateAppConfig(key, newValue);
    } catch (error) {
      // Revert on error
      setLocalConfig(prev => ({
        ...prev,
        [key]: !newValue
      }));
    }
  };

  const settings = [
    {
      key: 'pointsSystemEnabled',
      title: '🏆 Sistema Punti',
      description: 'Abilita/disabilita il sistema punti per tutta la piattaforma. Quando disabilitato, gli utenti non vedranno punti, classifiche o premi.',
      icon: FiAward,
      color: 'primary'
    },
    {
      key: 'rewardsEnabled',
      title: '🎁 Catalogo Premi',
      description: 'Mostra/nascondi il catalogo premi. Gli utenti non potranno riscattare premi quando disabilitato.',
      icon: FiGift,
      color: 'success'
    },
    {
      key: 'chatEnabled',
      title: '💬 Chat Comunità',
      description: 'Abilita/disabilita la chat della comunità. Gli utenti non potranno accedere alla chat quando disabilitato.',
      icon: FiMessageCircle,
      color: 'warning'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ⚙️ Impostazioni Piattaforma
          </h1>
          <p className="text-xl text-gray-600">
            🎛️ Controlla le funzionalità visibili agli utenti
          </p>
        </motion.div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {settings.map((setting, index) => (
            <motion.div
              key={setting.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-16 h-16 rounded-lg bg-${setting.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <SafeIcon icon={setting.icon} className={`text-2xl text-${setting.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {setting.title}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {setting.description}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleToggle(setting.key)}
                  className={`ml-6 flex-shrink-0 relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    localConfig[setting.key] 
                      ? 'bg-primary-600' 
                      : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-10 w-10 transform rounded-full bg-white shadow transition-transform ${
                      localConfig[setting.key] ? 'translate-x-12' : 'translate-x-1'
                    }`}
                  />
                  <SafeIcon 
                    icon={localConfig[setting.key] ? FiToggleRight : FiToggleLeft} 
                    className={`absolute text-2xl ${
                      localConfig[setting.key] 
                        ? 'text-white left-2' 
                        : 'text-gray-500 right-2'
                    }`}
                  />
                </button>
              </div>

              {/* Status Indicator */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-base font-medium ${
                  localConfig[setting.key]
                    ? 'bg-success-100 text-success-800'
                    : 'bg-error-100 text-error-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    localConfig[setting.key] ? 'bg-success-500' : 'bg-error-500'
                  }`} />
                  {localConfig[setting.key] 
                    ? '✅ Attivo - Visibile agli utenti' 
                    : '❌ Disattivato - Nascosto agli utenti'
                  }
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-8"
        >
          <h3 className="text-2xl font-semibold text-blue-900 mb-4 flex items-center space-x-3">
            <SafeIcon icon={FiSettings} className="text-blue-600 text-2xl" />
            <span>ℹ️ Informazioni Importanti</span>
          </h3>
          <div className="text-lg text-blue-800 space-y-3">
            <p>🔄 <strong>Aggiornamento Immediato:</strong> Le modifiche vengono applicate istantaneamente a tutti gli utenti collegati.</p>
            <p>📱 <strong>Cross-Device:</strong> Le impostazioni sono sincronizzate su tutti i dispositivi.</p>
            <p>👥 <strong>Esperienza Utente:</strong> Quando una funzione è disabilitata, scompare completamente dall'interfaccia utente.</p>
            <p>🛡️ <strong>Sicurezza:</strong> Solo gli amministratori possono modificare queste impostazioni.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;