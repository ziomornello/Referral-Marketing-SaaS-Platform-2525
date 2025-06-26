import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import { BONUS_STATE_CONFIG, parseWorkflowStates, stringifyWorkflowStates, getWorkflowInfo } from '../../utils/bonusStates';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

// 🔥 FIX: Aggiunto FiTrendingUp all'import
const { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiArrowUp, FiFileText, FiZap, FiSettings, FiCheck, FiInfo, FiTrendingUp, FiHelpCircle } = FiIcons;

const AdminBonuses = () => {
  const { bonuses, addBonus, updateBonus, deleteBonus } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingBonus, setEditingBonus] = useState(null);
  const [selectedWorkflowStates, setSelectedWorkflowStates] = useState([]);
  const [quickQuestions, setQuickQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    signupBonus: '',
    referralBonus: '',
    expiryDate: '',
    guideCode: '',
    closureCode: '',
    referralTemplate: '',
    isActive: true,
    guideFirst: false,
    // 🔥 CAMPI EXTRA - TUTTI OPZIONALI
    notes: '',
    extraTitle: '',
    extraDescription: '',
    extraGuideCode: '',
    extraGuideLink: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      description: '',
      signupBonus: '',
      referralBonus: '',
      expiryDate: '',
      guideCode: '',
      closureCode: '',
      referralTemplate: '',
      isActive: true,
      guideFirst: false,
      // 🔥 CAMPI EXTRA - RESET
      notes: '',
      extraTitle: '',
      extraDescription: '',
      extraGuideCode: '',
      extraGuideLink: ''
    });
    setSelectedWorkflowStates([]);
    setQuickQuestions([]);
    setNewQuestion('');
    setEditingBonus(null);
  };

  const handleCreate = () => {
    setShowModal(true);
    resetForm();
    // 🔥 STATI DI DEFAULT: NOT_STARTED → COMPLETED
    setSelectedWorkflowStates(['not_started', 'completed']);
  };

  const handleEdit = (bonus) => {
    setEditingBonus(bonus.id);
    setFormData({
      name: bonus.name,
      image: bonus.image,
      description: bonus.description,
      signupBonus: bonus.signupBonus.toString(),
      referralBonus: bonus.referralBonus.toString(),
      expiryDate: bonus.expiryDate,
      guideCode: bonus.guideCode || '',
      closureCode: bonus.closureCode || '',
      referralTemplate: bonus.referralTemplate || '',
      isActive: bonus.isActive,
      guideFirst: bonus.guideFirst || false,
      // 🔥 CAMPI EXTRA - CARICA VALORI ESISTENTI
      notes: bonus.notes || '',
      extraTitle: bonus.extraTitle || '',
      extraDescription: bonus.extraDescription || '',
      extraGuideCode: bonus.extraGuideCode || '',
      extraGuideLink: bonus.extraGuideLink || ''
    });

    // Parse existing workflow states
    const existingStates = parseWorkflowStates(bonus.workflowStates || '');
    setSelectedWorkflowStates(existingStates);

    // 🔥 CARICA DOMANDE RAPIDE ESISTENTI (se salvate come JSON nel campo extra)
    try {
      const savedQuestions = bonus.quickQuestions ? JSON.parse(bonus.quickQuestions) : [];
      setQuickQuestions(savedQuestions);
    } catch (error) {
      console.log('Nessuna domanda rapida salvata');
      setQuickQuestions([]);
    }

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 VALIDAZIONE SOLO CAMPI OBBLIGATORI
    if (!formData.name.trim() || !formData.image.trim() || !formData.description.trim() || 
        !formData.signupBonus || !formData.referralBonus || !formData.expiryDate) {
      toast.error('❌ Compila tutti i campi obbligatori (Nome, Immagine, Descrizione, Importi, Scadenza)');
      return;
    }

    // 🔥 VALIDAZIONE WORKFLOW STATES
    if (selectedWorkflowStates.length === 0) {
      toast.error('❌ Seleziona almeno uno stato per il workflow');
      return;
    }

    const bonusData = {
      ...formData,
      signupBonus: parseFloat(formData.signupBonus),
      referralBonus: parseFloat(formData.referralBonus),
      workflowStates: stringifyWorkflowStates(selectedWorkflowStates),
      // 🔥 SALVA DOMANDE RAPIDE COME JSON
      quickQuestions: JSON.stringify(quickQuestions),
      // 🔥 ASSICURATI CHE I CAMPI EXTRA SIANO STRINGHE VUOTE SE NON COMPILATI
      notes: formData.notes?.trim() || '',
      extraTitle: formData.extraTitle?.trim() || '',
      extraDescription: formData.extraDescription?.trim() || '',
      extraGuideCode: formData.extraGuideCode?.trim() || '',
      extraGuideLink: formData.extraGuideLink?.trim() || ''
    };

    console.log('🚀 Saving bonus with data:', bonusData);

    try {
      if (editingBonus) {
        await updateBonus(editingBonus, bonusData);
      } else {
        await addBonus(bonusData);
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('❌ Errore durante il salvataggio:', error);
      // L'errore viene già gestito nel DataContext
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('🗑️ Sei sicuro di voler eliminare questo bonus?')) {
      deleteBonus(id);
    }
  };

  const toggleStatus = (bonus) => {
    updateBonus(bonus.id, { ...bonus, isActive: !bonus.isActive });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 🔥 GESTIONE STATI WORKFLOW CON SELEZIONE MULTIPLA
  const toggleWorkflowState = (state) => {
    setSelectedWorkflowStates(prev => {
      if (prev.includes(state)) {
        // Non permettere di rimuovere NOT_STARTED
        if (state === 'not_started') {
          toast.warning('⚠️ Non puoi rimuovere "Non Iniziato" - è sempre necessario');
          return prev;
        }
        return prev.filter(s => s !== state);
      } else {
        const newStates = [...prev, state];
        // Ordina gli stati in base al loro order
        return newStates.sort((a, b) => {
          const configA = BONUS_STATE_CONFIG[a];
          const configB = BONUS_STATE_CONFIG[b];
          return (configA?.order || 0) - (configB?.order || 0);
        });
      }
    });
  };

  // 🔥 GESTIONE DOMANDE RAPIDE
  const addQuickQuestion = () => {
    if (newQuestion.trim()) {
      const question = {
        id: Date.now(),
        text: newQuestion.trim()
      };
      setQuickQuestions(prev => [...prev, question]);
      setNewQuestion('');
      toast.success('✅ Domanda aggiunta!');
    }
  };

  const removeQuickQuestion = (questionId) => {
    setQuickQuestions(prev => prev.filter(q => q.id !== questionId));
    toast.success('🗑️ Domanda rimossa!');
  };

  const getWorkflowDisplayName = (workflowStates) => {
    if (!workflowStates) return 'Workflow base';
    const info = getWorkflowInfo(workflowStates);
    return `${info.totalStates} passaggi (${info.totalSteps} steps)`;
  };

  // 🔥 CALCOLO PERCENTUALI DINAMICHE
  const calculatePercentages = (states) => {
    if (states.length <= 1) return [];

    const percentages = [];
    for (let i = 0; i < states.length; i++) {
      const percentage = Math.round((i / (states.length - 1)) * 100);
      percentages.push({
        state: states[i],
        percentage: percentage,
        config: BONUS_STATE_CONFIG[states[i]]
      });
    }
    return percentages;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎁 Gestione Bonus</h1>
            <p className="text-gray-600 mt-1">⚙️ Crea, modifica e gestisci tutti i bonus con passaggi personalizzati</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            <SafeIcon icon={FiPlus} className="text-sm" />
            <span>➕ Nuovo Bonus</span>
          </button>
        </motion.div>

        {/* Bonuses List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    🎯 Bonus
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    💰 Importi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    ⏰ Scadenza
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    📊 Passaggi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    ⚡ Extra
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    👁️ Stato
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    ⚙️ Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bonuses.map((bonus) => (
                  <tr key={bonus.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={bonus.image}
                          alt={bonus.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{bonus.name}</div>
                          <div className="text-gray-500 line-clamp-1">{bonus.description}</div>
                          {bonus.notes && (
                            <div className="flex items-center space-x-1 mt-1">
                              <SafeIcon icon={FiFileText} className="text-xs text-blue-500" />
                              <span className="text-xs text-blue-600">Note disponibili</span>
                            </div>
                          )}
                          {/* 🔥 INDICATORE DOMANDE RAPIDE */}
                          {bonus.quickQuestions && (
                            <div className="flex items-center space-x-1 mt-1">
                              <SafeIcon icon={FiHelpCircle} className="text-xs text-green-500" />
                              <span className="text-xs text-green-600">
                                {JSON.parse(bonus.quickQuestions || '[]').length} domande rapide
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-900">
                        <div>💰 €{bonus.signupBonus}</div>
                        <div>👥 €{bonus.referralBonus}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-900">
                        {format(new Date(bonus.expiryDate), 'dd/MM/yyyy', { locale: it })}
                      </div>
                      <div className={`text-sm ${
                        new Date(bonus.expiryDate) < new Date() 
                          ? 'text-error-600' 
                          : 'text-success-600'
                      }`}>
                        {new Date(bonus.expiryDate) < new Date() ? '⏰ Scaduto' : '✅ Attivo'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <SafeIcon icon={FiSettings} className="text-xs" />
                        <span>{getWorkflowDisplayName(bonus.workflowStates)}</span>
                      </span>
                      {bonus.guideFirst && (
                        <div className="mt-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <SafeIcon icon={FiArrowUp} className="text-xs" />
                            <span>📖 Guida Prima</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {(bonus.extraTitle || bonus.extraDescription || bonus.extraGuideCode || bonus.extraGuideLink) ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <SafeIcon icon={FiZap} className="text-xs" />
                          <span>⚡ Bonus Extra</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Nessun extra</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleStatus(bonus)}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full font-medium ${
                          bonus.isActive 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <SafeIcon icon={bonus.isActive ? FiEye : FiEyeOff} className="text-xs" />
                        <span>{bonus.isActive ? '👁️ Attivo' : '🙈 Nascosto'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(bonus)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="✏️ Modifica"
                        >
                          <SafeIcon icon={FiEdit2} className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(bonus.id)}
                          className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                          title="🗑️ Elimina"
                        >
                          <SafeIcon icon={FiTrash2} className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bonuses.length === 0 && (
            <div className="text-center py-12">
              <SafeIcon icon={FiPlus} className="text-5xl text-gray-400 mb-4" />
              <h3 className="font-medium text-gray-500 mb-4">
                🎁 Nessun bonus ancora
              </h3>
              <p className="text-gray-400 mb-6">
                Inizia creando il primo bonus per la tua piattaforma
              </p>
              <button
                onClick={handleCreate}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                🚀 Crea Primo Bonus
              </button>
            </div>
          )}
        </motion.div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingBonus ? '✏️ Modifica Bonus' : '➕ Nuovo Bonus'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <SafeIcon icon={FiX} className="text-lg" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* 🔥 SEZIONE PASSAGGI PERSONALIZZATI */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <SafeIcon icon={FiSettings} className="text-purple-600" />
                    <span>📊 Configura Passaggi del Bonus</span>
                  </h3>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <SafeIcon icon={FiInfo} className="text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-2">
                          💡 Come funziona:
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Seleziona i passaggi che l'utente deve completare</li>
                          <li>• Le percentuali si distribuiscono automaticamente (es: 3 passaggi = 0%, 50%, 100%)</li>
                          <li>• "Non Iniziato" è sempre al 0% e "Completato" sempre al 100%</li>
                          <li>• Puoi aggiungere fino a 10 passaggi intermedi</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 🔥 SELEZIONE PASSAGGI CON GRID MIGLIORATA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {Object.entries(BONUS_STATE_CONFIG)
                      .filter(([state]) => state !== 'hidden')
                      .sort(([, a], [, b]) => a.order - b.order)
                      .map(([state, config]) => {
                        const isSelected = selectedWorkflowStates.includes(state);
                        const isRequired = state === 'not_started';

                        return (
                          <button
                            key={state}
                            type="button"
                            onClick={() => !isRequired && toggleWorkflowState(state)}
                            disabled={isRequired}
                            className={`p-4 border-2 rounded-xl text-left transition-all ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50 text-purple-800'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            } ${isRequired ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{config.emoji}</span>
                                <span className="text-sm font-medium">{config.shortLabel}</span>
                              </div>
                              {isSelected && (
                                <SafeIcon icon={FiCheck} className="text-purple-600" />
                              )}
                              {isRequired && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                  Obbligatorio
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              {config.description}
                            </div>
                          </button>
                        );
                      })}
                  </div>

                  {/* 🔥 PREVIEW PERCENTUALI */}
                  {selectedWorkflowStates.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                        <SafeIcon icon={FiTrendingUp} className="text-green-600" />
                        <span>📈 Anteprima Percentuali ({selectedWorkflowStates.length} passaggi)</span>
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {calculatePercentages(selectedWorkflowStates).map(({ state, percentage, config }, index) => (
                          <div key={state} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg mb-1">{config.emoji}</div>
                            <div className="text-sm font-medium text-gray-900">
                              {index + 1}. {config.shortLabel}
                            </div>
                            <div className="text-lg font-bold text-purple-600">
                              {percentage}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 🔥 SEZIONE DOMANDE RAPIDE CHAT */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <SafeIcon icon={FiHelpCircle} className="text-green-600" />
                    <span>❓ Domande Rapide per la Chat</span>
                  </h3>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-800">
                      💡 <strong>Info:</strong> Aggiungi domande frequenti che gli utenti possono inviare rapidamente nella chat quando discutono di questo bonus.
                    </p>
                  </div>

                  {/* Add new question */}
                  <div className="flex space-x-3 mb-4">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Es: Come faccio ad aprire il conto Revolut?"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={addQuickQuestion}
                      disabled={!newQuestion.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      ➕ Aggiungi
                    </button>
                  </div>

                  {/* Questions list */}
                  {quickQuestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-900">Domande salvate:</h4>
                      {quickQuestions.map((question) => (
                        <div key={question.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200">
                          <span className="text-sm text-gray-700">❓ {question.text}</span>
                          <button
                            type="button"
                            onClick={() => removeQuickQuestion(question.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <SafeIcon icon={FiX} className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🔥 CAMPI OBBLIGATORI */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-red-900 mb-2">📋 Campi Obbligatori</h3>
                  <p className="text-sm text-red-800">
                    I campi contrassegnati con <strong>*</strong> sono obbligatori per creare il bonus.
                  </p>
                </div>

                {/* Informazioni Base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎯 Nome Applicazione *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="es. Revolut"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🖼️ URL Immagine *
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Descrizione *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Descrizione del bonus..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💰 Bonus Iscrizione (€) *
                    </label>
                    <input
                      type="number"
                      name="signupBonus"
                      value={formData.signupBonus}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="25.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      👥 Bonus Referral (€) *
                    </label>
                    <input
                      type="number"
                      name="referralBonus"
                      value={formData.referralBonus}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="15.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⏰ Data Scadenza *
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                {/* 🔥 SEZIONE CAMPI OPZIONALI */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-bold text-green-900 mb-2">✅ Campi Opzionali</h3>
                    <p className="text-sm text-green-800">
                      <strong>💡 Info:</strong> Tutti i campi di questa sezione sono <strong>completamente opzionali</strong>. Puoi lasciarli vuoti e compilarli successivamente.
                    </p>
                  </div>

                  {/* Note Aggiuntive */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📋 Note Aggiuntive (Opzionale)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Note importanti, suggerimenti, avvertenze per gli utenti..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      💡 Queste note appariranno nella pagina del bonus per fornire informazioni extra agli utenti
                    </p>
                  </div>

                  {/* Link e Template */}
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🔗 Template Link Referral (Opzionale)
                      </label>
                      <input
                        type="text"
                        name="referralTemplate"
                        value={formData.referralTemplate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://app.com/referral/{CODE}"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        💡 Usa {'{CODE}'} come placeholder per il codice referral
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📖 Link Guida Step-by-Step (Opzionale)
                      </label>
                      <input
                        type="url"
                        name="guideCode"
                        value={formData.guideCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://guide.efallmo.it/share/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🔒 Link Procedura Chiusura Conto (Opzionale)
                      </label>
                      <input
                        type="url"
                        name="closureCode"
                        value={formData.closureCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://guide.efallmo.it/share/..."
                      />
                    </div>
                  </div>

                  {/* Ordine Visualizzazione */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      🔄 Ordine di Visualizzazione
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="guideFirst"
                        checked={formData.guideFirst}
                        onChange={handleChange}
                        className="mr-3 w-4 h-4"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        📖 Mostra prima la guida, poi il link
                      </label>
                    </div>
                  </div>

                  {/* 🔥 SEZIONE BONUS EXTRA (TUTTI OPZIONALI) */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <SafeIcon icon={FiZap} className="text-purple-600" />
                      <span>⚡ Bonus Extra (Tutti i campi opzionali)</span>
                    </h3>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-purple-800">
                        <strong>💡 Info:</strong> Tutti i campi di questa sezione sono <strong>opzionali</strong>. Usa questa sezione per quiz, attività aggiuntive o bonus secondari. Se riempi almeno un campo, verrà mostrata la sezione "Bonus Extra" agli utenti.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🎯 Titolo Bonus Extra (Opzionale)
                        </label>
                        <input
                          type="text"
                          name="extraTitle"
                          value={formData.extraTitle}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="es. Quiz Revolut - Guadagna altri €5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📝 Descrizione Bonus Extra (Opzionale)
                        </label>
                        <textarea
                          name="extraDescription"
                          value={formData.extraDescription}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Completa il quiz di Revolut per guadagnare altri €5 in bonus..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📖 Link Guida Extra (Opzionale)
                        </label>
                        <input
                          type="url"
                          name="extraGuideCode"
                          value={formData.extraGuideCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="https://guide.efallmo.it/quiz/revolut"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🔗 Link Diretto Extra (Opzionale)
                        </label>
                        <input
                          type="url"
                          name="extraGuideLink"
                          value={formData.extraGuideLink}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="https://revolut.com/quiz"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mr-3 w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    ✅ Bonus attivo e visibile agli utenti
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ❌ Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                  >
                    <SafeIcon icon={FiSave} className="text-sm" />
                    <span>{editingBonus ? '💾 Aggiorna' : '🚀 Crea'} Bonus</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBonuses;