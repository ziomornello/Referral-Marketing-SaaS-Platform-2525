import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import { getStateConfig, getStatesForFilter, BONUS_STATES, getSubmissionStatusForState } from '../../utils/bonusStates';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const {
  FiSearch, FiEdit2, FiTrash2, FiSave, FiX, FiUser, FiMail, FiPhone, FiUsers,
  FiCalendar, FiAward, FiDownload, FiFilter, FiTrendingUp, FiRefreshCw,
  FiCamera, FiMousePointer, FiShield, FiUserX
} = FiIcons;

const AdminUserManagement = () => {
  const { users, updateUser, deleteUser, bonuses, submissions, addSubmission, updateSubmissionStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showBulkBlockModal, setShowBulkBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userBonusStates, setUserBonusStates] = useState({});
  const [filters, setFilters] = useState({
    role: 'all',
    bonusState: 'all',
    dateRange: 'all',
    status: 'all' // 🔥 NUOVO FILTRO PER STATO UTENTE
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    points: 0,
    new_password: '',
    profile_image: '',
    is_blocked: false
  });

  // 🔥 FILTRI AVANZATI CON NUOVO FILTRO STATO
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));

    // Role filter
    const matchesRole = filters.role === 'all' || user.role === filters.role;

    // 🔥 NUOVO: Status filter
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'blocked' && user.is_blocked) ||
      (filters.status === 'active' && !user.is_blocked);

    // Bonus state filter
    let matchesBonusState = true;
    if (filters.bonusState !== 'all') {
      const userSubmissions = submissions.filter(sub => sub.userId === user.id);
      const hasState = userSubmissions.some(sub => {
        switch (filters.bonusState) {
          case BONUS_STATES.COMPLETED:
            return sub.status === 'approved';
          case BONUS_STATES.WAITING_PAYMENT:
            return sub.status === 'pending';
          case BONUS_STATES.REJECTED:
            return sub.status === 'rejected';
          default:
            return false;
        }
      });
      matchesBonusState = hasState;
    }

    // Date range filter
    let matchesDate = true;
    if (filters.dateRange !== 'all' && user.created_at) {
      const userDate = new Date(user.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now - userDate) / (1000 * 60 * 60 * 24));

      switch (filters.dateRange) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesRole && matchesStatus && matchesBonusState && matchesDate;
  });

  // 🔥 SORTING
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'points':
        aValue = a.points || 0;
        bValue = b.points || 0;
        break;
      case 'created_at':
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
        break;
      case 'bonus_progress':
        const aStats = getUserBonusStats(a.id);
        const bStats = getUserBonusStats(b.id);
        aValue = aStats.completed;
        bValue = bStats.completed;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 🔥 NUOVO: GESTIONE SELEZIONE MULTIPLA UTENTI
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const allUserIds = sortedUsers.map(u => u.id);
    setSelectedUsers(allUserIds);
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // 🔥 NUOVO: BLOCCO VELOCE MULTIPLO
  const handleQuickBlock = async (block = true) => {
    if (selectedUsers.length === 0) {
      toast.error('❌ Seleziona almeno un utente');
      return;
    }

    const action = block ? 'bloccare' : 'sbloccare';
    const count = selectedUsers.length;
    
    if (window.confirm(`🤔 Sei sicuro di voler ${action} ${count} utenti selezionati?`)) {
      try {
        for (const userId of selectedUsers) {
          await updateUser(userId, { is_blocked: block });
        }
        
        toast.success(`✅ ${count} utenti ${block ? 'bloccati' : 'sbloccati'} con successo!`);
        clearSelection();
      } catch (error) {
        console.error('❌ Errore blocco multiplo:', error);
        toast.error(`❌ Errore nel ${action} gli utenti`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      points: 0,
      new_password: '',
      profile_image: '',
      is_blocked: false
    });
    setEditingUser(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      points: user.points || 0,
      new_password: '',
      profile_image: user.profile_image || '',
      is_blocked: user.is_blocked || false
    });
    setShowModal(true);
  };

  const handleViewBonuses = (user) => {
    setSelectedUser(user);

    // Carica stati bonus per questo utente
    const userStates = {};
    bonuses.forEach(bonus => {
      const submission = submissions.find(sub => 
        sub.userId === user.id && sub.bonusId === bonus.id
      );

      if (submission) {
        switch (submission.status) {
          case 'pending':
            userStates[bonus.id] = BONUS_STATES.WAITING_PAYMENT;
            break;
          case 'approved':
            userStates[bonus.id] = BONUS_STATES.COMPLETED;
            break;
          case 'rejected':
            userStates[bonus.id] = BONUS_STATES.REJECTED;
            break;
          case 'user_declined':
            userStates[bonus.id] = BONUS_STATES.USER_DECLINED;
            break;
          case 'hidden':
            userStates[bonus.id] = BONUS_STATES.HIDDEN;
            break;
          default:
            userStates[bonus.id] = BONUS_STATES.NOT_STARTED;
        }
      } else {
        userStates[bonus.id] = BONUS_STATES.NOT_STARTED;
      }
    });

    setUserBonusStates(userStates);
    setShowBonusModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      points: parseInt(formData.points),
      profile_image: formData.profile_image,
      is_blocked: formData.is_blocked
    };

    // Only update password if provided
    if (formData.new_password.trim()) {
      updateData.password_hash = `updated_${formData.new_password}`;
    }

    try {
      await updateUser(editingUser, updateData);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`🗑️ Sei sicuro di voler eliminare l'utente "${userName}"?`)) {
      await deleteUser(userId);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // 🔥 GESTIONE STATI CON CLICK SINGOLO
  const handleQuickStateChange = (bonusId, newState) => {
    handleBonusStateChange(bonusId, newState);
  };

  // 🔥 GESTIONE STATI BONUS
  const handleBonusStateChange = async (bonusId, newState) => {
    try {
      console.log('🔄 Inizio aggiornamento stato bonus:', {
        userId: selectedUser.id,
        bonusId,
        newState,
        selectedUser
      });

      if (!selectedUser || !selectedUser.id) {
        throw new Error('Utente non selezionato');
      }

      if (!bonusId) {
        throw new Error('ID bonus non valido');
      }

      if (!newState) {
        throw new Error('Nuovo stato non valido');
      }

      // Aggiorna stato locale immediatamente per feedback UI
      setUserBonusStates(prev => ({ ...prev, [bonusId]: newState }));

      const bonus = bonuses.find(b => b.id === bonusId);
      if (!bonus) {
        throw new Error(`Bonus con ID ${bonusId} non trovato`);
      }

      const existingSubmission = submissions.find(sub => 
        sub.userId === selectedUser.id && sub.bonusId === bonusId
      );

      // Reset a NOT_STARTED
      if (newState === BONUS_STATES.NOT_STARTED) {
        console.log('⚪ Reset a NOT_STARTED');
        if (existingSubmission) {
          await updateSubmissionStatus(
            existingSubmission.id,
            'cancelled',
            `Reset dall'admin: torna a non iniziato (${new Date().toLocaleString('it-IT')})`,
            true
          );
        }

        toast.success(`✅ ${bonus.name}: ⚪ Reimpostato a Non Iniziato`, {
          style: {
            zIndex: 9998,
            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(107, 114, 128, 0.3)'
          },
          duration: 3000
        });
        return;
      }

      const getToastForState = (state, bonusName) => {
        switch (state) {
          case BONUS_STATES.USER_DECLINED:
            return {
              message: `🙅 ${bonusName}: Utente non interessato`,
              style: {
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#fff'
              }
            };
          case BONUS_STATES.HIDDEN:
            return {
              message: `👁️‍🗨️ ${bonusName}: Nascosto per questo utente`,
              style: {
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: '#fff'
              }
            };
          case BONUS_STATES.REJECTED:
            return {
              message: `❌ ${bonusName}: Rifiutato`,
              style: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff'
              }
            };
          default:
            const stateConfig = getStateConfig(state);
            return {
              message: `✅ ${bonusName}: ${stateConfig.emoji} ${stateConfig.label}`,
              style: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff'
              }
            };
        }
      };

      const submissionStatus = getSubmissionStatusForState(newState);

      console.log('📦 Dati per aggiornamento:', {
        existingSubmission,
        submissionStatus,
        bonusName: bonus.name
      });

      if (existingSubmission) {
        console.log('🔄 Aggiornamento submission esistente...');
        await updateSubmissionStatus(
          existingSubmission.id,
          submissionStatus,
          `Stato aggiornato dall'admin: ${newState} (${new Date().toLocaleString('it-IT')})`,
          true
        );
      } else {
        console.log('➕ Creazione nuova submission...');
        const newSubmission = {
          userId: parseInt(selectedUser.id),
          userName: selectedUser.name || 'Utente sconosciuto',
          bonusId: parseInt(bonusId),
          bonusName: bonus.name || 'Bonus sconosciuto',
          type: 'admin_update',
          files: [],
          notes: `Stato impostato dall'admin: ${newState} (${new Date().toLocaleString('it-IT')})`,
          status: submissionStatus
        };

        console.log('📤 Dati submission da creare:', newSubmission);
        await addSubmission(newSubmission, true);
      }

      const toastData = getToastForState(newState, bonus.name);
      toast.success(toastData.message, {
        style: {
          zIndex: 9998,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
          ...toastData.style
        },
        duration: 3000
      });

      console.log('✅ Aggiornamento stato completato con successo');
    } catch (error) {
      console.error('❌ Errore aggiornamento stato bonus:', error);

      setUserBonusStates(prev => ({
        ...prev,
        [bonusId]: userBonusStates[bonusId] || BONUS_STATES.NOT_STARTED
      }));

      toast.error(`❌ Errore aggiornamento: ${error.message}`, {
        style: {
          zIndex: 9998,
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
        },
        duration: 5000
      });
    }
  };

  const getUserBonusStats = (userId) => {
    const userSubmissions = submissions.filter(sub => sub.userId === userId);
    const completed = userSubmissions.filter(sub => sub.status === 'approved').length;
    const pending = userSubmissions.filter(sub => sub.status === 'pending').length;
    const rejected = userSubmissions.filter(sub => sub.status === 'rejected').length;
    const declined = userSubmissions.filter(sub => sub.status === 'user_declined').length;

    return { completed, pending, rejected, declined, total: userSubmissions.length };
  };

  const exportToCSV = () => {
    const csvData = sortedUsers.map(user => {
      const bonusStats = getUserBonusStats(user.id);
      return {
        'ID': user.id,
        'Nome': user.name,
        'Email': user.email,
        'Telefono': user.phone || '',
        'Ruolo': user.role === 'admin' ? 'Amministratore' : 'Utente',
        'Punti': user.points || 0,
        'Stato': user.is_blocked ? 'Bloccato' : 'Attivo',
        'Bonus Completati': bonusStats.completed,
        'Bonus in Attesa': bonusStats.pending,
        'Bonus Rifiutati': bonusStats.rejected,
        'Bonus Non Interessato': bonusStats.declined,
        'Data Registrazione': user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: it }) : 'N/A'
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `utenti_efallmo_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('📊 File CSV esportato con successo!', { style: { zIndex: 9998 } });
  };

  const statesForFilter = getStatesForFilter().filter(state =>
    [BONUS_STATES.COMPLETED, BONUS_STATES.WAITING_PAYMENT, BONUS_STATES.REJECTED].includes(state.value)
  );

  const stats = [
    {
      icon: FiUsers,
      label: 'Utenti Totali',
      value: users.length,
      color: 'text-primary-600',
      bg: 'bg-primary-100'
    },
    {
      icon: FiUser,
      label: 'Amministratori',
      value: users.filter(u => u.role === 'admin').length,
      color: 'text-warning-600',
      bg: 'bg-warning-100'
    },
    {
      icon: FiShield,
      label: 'Utenti Bloccati',
      value: users.filter(u => u.is_blocked).length,
      color: 'text-red-600',
      bg: 'bg-red-100'
    },
    {
      icon: FiAward,
      label: 'Punti Totali',
      value: users.reduce((acc, user) => acc + (user.points || 0), 0),
      color: 'text-success-600',
      bg: 'bg-success-100'
    }
  ];

  const quickStates = [
    { state: BONUS_STATES.NOT_STARTED, emoji: '⚪', label: 'Non Iniziato' },
    { state: BONUS_STATES.IN_PROGRESS, emoji: '🔄', label: 'In Corso' },
    { state: BONUS_STATES.WAITING_PAYMENT, emoji: '⏳', label: 'In Attesa' },
    { state: BONUS_STATES.COMPLETED, emoji: '✅', label: 'Completato' },
    { state: BONUS_STATES.USER_DECLINED, emoji: '🙅', label: 'Non Interessato' },
    { state: BONUS_STATES.HIDDEN, emoji: '👁️‍🗨️', label: 'Nascondi Bonus' }
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                👥 Gestione Utenti Avanzata
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 mt-1">
                🔍 Gestisci utenti, filtra, esporta e controlla i bonus per utente
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              {/* 🔥 NUOVO: PULSANTI BLOCCO VELOCE */}
              {selectedUsers.length > 0 && (
                <>
                  <button
                    onClick={() => handleQuickBlock(true)}
                    className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <SafeIcon icon={FiUserX} className="text-lg" />
                    <span>Blocca ({selectedUsers.length})</span>
                  </button>
                  <button
                    onClick={() => handleQuickBlock(false)}
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <SafeIcon icon={FiUsers} className="text-lg" />
                    <span>Sblocca ({selectedUsers.length})</span>
                  </button>
                  <button
                    onClick={clearSelection}
                    className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <SafeIcon icon={FiX} className="text-lg" />
                    <span>Annulla</span>
                  </button>
                </>
              )}
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SafeIcon icon={FiDownload} className="text-lg" />
                <span>Esporta CSV</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-4 lg:p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-lg ${stat.bg} flex items-center justify-center mx-auto lg:mx-0`}>
                  <SafeIcon icon={stat.icon} className={`text-xl lg:text-2xl ${stat.color}`} />
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm lg:text-base text-gray-600">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filtri e ricerca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-8"
        >
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SafeIcon icon={FiSearch} className="text-xl text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-base lg:text-lg"
                placeholder="🔍 Cerca per nome, email o telefono..."
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👤 Ruolo
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tutti i Ruoli</option>
                <option value="user">👤 Utenti</option>
                <option value="admin">👑 Amministratori</option>
              </select>
            </div>

            {/* 🔥 NUOVO FILTRO STATO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🚫 Stato
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tutti</option>
                <option value="active">✅ Attivi</option>
                <option value="blocked">🚫 Bloccati</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Stato Bonus
              </label>
              <select
                value={filters.bonusState}
                onChange={(e) => handleFilterChange('bonusState', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tutti gli Stati</option>
                {statesForFilter.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.emoji} {state.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Registrazione
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tutte le Date</option>
                <option value="today">Oggi</option>
                <option value="week">Ultima Settimana</option>
                <option value="month">Ultimo Mese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Ordinamento
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="name">Nome</option>
                <option value="email">Email</option>
                <option value="points">Punti</option>
                <option value="bonus_progress">Progresso Bonus</option>
                <option value="created_at">Data Registrazione</option>
              </select>
            </div>
          </div>

          {/* Filter Results e Selection */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between text-sm text-gray-600 space-y-2 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <span>
                Mostrando <strong>{filteredUsers.length}</strong> di <strong>{users.length}</strong> utenti
              </span>
              {/* 🔥 NUOVO: CONTROLLI SELEZIONE */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={selectAllUsers}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Seleziona tutti
                </button>
                {selectedUsers.length > 0 && (
                  <>
                    <span>|</span>
                    <span className="text-primary-600 font-medium">
                      {selectedUsers.length} selezionati
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span>Ordine:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
              >
                <span>{sortOrder === 'asc' ? '⬆️ Crescente' : '⬇️ Decrescente'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Lista utenti */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {sortedUsers.length > 0 ? (
            sortedUsers.map((user, index) => {
              const bonusStats = getUserBonusStats(user.id);
              const isSelected = selectedUsers.includes(user.id);

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow ${
                    user.is_blocked ? 'border-l-4 border-red-500 bg-red-50' : ''
                  } ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}
                >
                  <div className="space-y-4">
                    {/* Header con Avatar e Info Base */}
                    <div className="flex items-center space-x-4">
                      {/* 🔥 NUOVO: CHECKBOX SELEZIONE */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />

                      <div className="relative">
                        {user.profile_image ? (
                          <img
                            src={user.profile_image}
                            alt={user.name}
                            className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover border-4 border-purple-200"
                          />
                        ) : (
                          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg border-4 border-purple-200">
                            <SafeIcon icon={FiUser} className="text-white text-xl lg:text-2xl" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                          <SafeIcon icon={FiCamera} className={`text-xs ${user.profile_image ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                        {user.is_blocked && (
                          <div className="absolute -top-1 -left-1 bg-red-600 text-white rounded-full p-1 shadow-md">
                            <SafeIcon icon={FiShield} className="text-xs" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate">{user.name}</h3>
                          {user.is_blocked && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                              🚫 Bloccato
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center space-x-1">
                          <SafeIcon icon={FiMail} className="text-xs flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                        {user.phone && (
                          <p className="text-sm text-gray-600 flex items-center space-x-1">
                            <SafeIcon icon={FiPhone} className="text-xs flex-shrink-0" />
                            <span>{user.phone}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-center space-y-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-warning-100 text-warning-800' 
                            : 'bg-primary-100 text-primary-800'
                        }`}>
                          {user.role === 'admin' ? '👑 Admin' : '👤 Utente'}
                        </span>
                        <div className="text-center">
                          <div className="text-lg font-bold text-success-600 flex items-center space-x-1">
                            <SafeIcon icon={FiAward} className="text-sm" />
                            <span>{user.points || 0}</span>
                          </div>
                          <div className="text-xs text-gray-500">punti</div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-success-600">✅ {bonusStats.completed}</div>
                        <div className="text-xs text-gray-600">Completati</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">⏳ {bonusStats.pending}</div>
                        <div className="text-xs text-gray-600">In Attesa</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">❌ {bonusStats.rejected}</div>
                        <div className="text-xs text-gray-600">Rifiutati</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">🙅 {bonusStats.declined}</div>
                        <div className="text-xs text-gray-600">Non Interessato</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          📅 {user.created_at ? format(new Date(user.created_at), 'dd/MM/yy', { locale: it }) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600">Registrato</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={() => handleViewBonuses(user)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <span>Gestisci Bonus</span>
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <SafeIcon icon={FiEdit2} className="text-sm" />
                        <span>Modifica</span>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-red-100 text-red-700 px-4 py-3 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} className="text-sm" />
                        <span className="sm:hidden">Elimina</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <SafeIcon icon={FiUsers} className="text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl lg:text-2xl font-medium text-gray-500 mb-4">
                {searchTerm || filters.role !== 'all' || filters.bonusState !== 'all' || filters.dateRange !== 'all'
                  ? '🔍 Nessun utente trovato'
                  : '👥 Nessun utente ancora'
                }
              </h3>
              <p className="text-base lg:text-lg text-gray-400">
                {searchTerm || filters.role !== 'all' || filters.bonusState !== 'all' || filters.dateRange !== 'all'
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Gli utenti registrati appariranno qui'
                }
              </p>
            </div>
          )}
        </motion.div>

        {/* Edit User Modal */}
        {showModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
            >
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-[10001] rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    Modifica Utente
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-lg"
                  >
                    <SafeIcon icon={FiX} className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    👤 Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    📞 Telefono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                    placeholder="+39 123 456 7890"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    🎭 Ruolo
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                  >
                    <option value="user">👤 Utente</option>
                    <option value="admin">👑 Amministratore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    🏆 Punti
                  </label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                  />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="is_blocked"
                      checked={formData.is_blocked}
                      onChange={handleChange}
                      className="mt-1 mr-3 w-4 h-4 text-red-600"
                    />
                    <div>
                      <label className="block text-base font-medium text-red-700 mb-1">
                        🚫 Blocca Utente
                      </label>
                      <p className="text-sm text-red-600">
                        ⚠️ <strong>Attenzione:</strong> Quando attivato, l'utente non potrà più accedere alla piattaforma.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-base"
                  >
                    <SafeIcon icon={FiSave} className="text-lg" />
                    <span>Salva Modifiche</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Bonus States Management Modal */}
        {showBonusModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <div className="sticky top-0 bg-white p-4 lg:p-6 border-b border-gray-200 z-[10001] rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Gestione Stati Bonus - {selectedUser.name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Controlla la visibilità e lo stato dei bonus per questo utente
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBonusModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-lg"
                  >
                    <SafeIcon icon={FiX} className="text-xl" />
                  </button>
                </div>
              </div>

              <div className="p-4 lg:p-6">
                {/* User Progress Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 lg:p-6 mb-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    📈 Riepilogo Progresso
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {Object.values(BONUS_STATES)
                      .filter(state => state !== BONUS_STATES.BLOCKED)
                      .map((state) => {
                        const stateConfig = getStateConfig(state);
                        const count = Object.values(userBonusStates).filter(s => s === state).length;
                        if (count === 0) return null;

                        return (
                          <div key={state} className="text-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl mb-1">{stateConfig.emoji}</div>
                            <div className="text-lg font-bold text-gray-900">{count}</div>
                            <div className="text-xs text-gray-600">{stateConfig.shortLabel}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Bonus List */}
                <div className="space-y-4">
                  {bonuses.map((bonus) => {
                    const currentState = userBonusStates[bonus.id] || BONUS_STATES.NOT_STARTED;
                    const stateConfig = getStateConfig(currentState);
                    const isExpired = new Date(bonus.expiryDate) < new Date();

                    return (
                      <div
                        key={bonus.id}
                        className={`border border-gray-200 rounded-xl p-4 lg:p-6 hover:bg-gray-50 transition-colors ${
                          currentState === BONUS_STATES.HIDDEN ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={bonus.image}
                              alt={bonus.name}
                              className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-2">
                                <h4 className="text-base lg:text-lg font-semibold text-gray-900">{bonus.name}</h4>
                                {isExpired && (
                                  <span className="inline-flex px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full mt-1 lg:mt-0">
                                    ⏰ Scaduto
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 text-sm text-gray-600 space-y-1 lg:space-y-0">
                                <span>💰 €{bonus.signupBonus} bonus</span>
                                <span>📅 Scade: {new Date(bonus.expiryDate).toLocaleDateString('it-IT')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Stato Attuale:</span>
                              <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${stateConfig.color}`}>
                                <span>{stateConfig.emoji}</span>
                                <span>{stateConfig.label}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                  <SafeIcon icon={FiMousePointer} className="text-gray-500" />
                                  <span>Modifica Stato:</span>
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {quickStates.map((quickState) => (
                                  <button
                                    key={quickState.state}
                                    onClick={() => handleQuickStateChange(bonus.id, quickState.state)}
                                    className={`inline-flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      currentState === quickState.state
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    <span>{quickState.emoji}</span>
                                    <span>{quickState.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {bonuses.length === 0 && (
                  <div className="text-center py-12">
                    <SafeIcon icon={FiRefreshCw} className="text-6xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-500 mb-2">
                      Nessun bonus disponibile
                    </h3>
                    <p className="text-gray-400">
                      Crea alcuni bonus per iniziare a tracciare il progresso degli utenti
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;