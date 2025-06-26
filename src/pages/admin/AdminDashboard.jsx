import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiGift, FiCheckCircle, FiClock, FiTrendingUp, FiMessageCircle, FiAward, FiArrowRight } = FiIcons;

const AdminDashboard = () => {
  const { bonuses, submissions, chatMessages, rewards } = useData();

  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
  const totalMessages = chatMessages.filter(m => !m.isDeleted).length;
  const activeBonuses = bonuses.filter(b => b.isActive).length;
  const activeRewards = rewards.filter(r => r.isActive).length;

  const stats = [
    {
      icon: FiGift,
      label: 'Bonus Attivi',
      value: activeBonuses,
      color: 'text-primary-600',
      bg: 'bg-primary-100',
      link: '/admin/bonuses'
    },
    {
      icon: FiClock,
      label: 'Approvazioni Pending',
      value: pendingSubmissions,
      color: 'text-warning-600',
      bg: 'bg-warning-100',
      link: '/admin/approvals'
    },
    {
      icon: FiAward,
      label: 'Premi Disponibili',
      value: activeRewards,
      color: 'text-success-600',
      bg: 'bg-success-100',
      link: '/admin/rewards'
    },
    {
      icon: FiMessageCircle,
      label: 'Messaggi Chat',
      value: totalMessages,
      color: 'text-error-600',
      bg: 'bg-error-100',
      link: '/admin/chat'
    }
  ];

  const quickActions = [
    {
      title: 'Gestione Bonus',
      description: 'Crea, modifica e gestisci tutti i bonus disponibili',
      icon: FiGift,
      color: 'bg-primary-600',
      link: '/admin/bonuses'
    },
    {
      title: 'Approvazioni',
      description: 'Rivedi e approva le prove inviate dagli utenti',
      icon: FiCheckCircle,
      color: 'bg-warning-600',
      link: '/admin/approvals'
    },
    {
      title: 'Analytics',
      description: 'Visualizza statistiche e report dettagliati',
      icon: FiTrendingUp,
      color: 'bg-success-600',
      link: '/admin/analytics'
    },
    {
      title: 'Moderazione Chat',
      description: 'Modera i messaggi e gestisci la comunità',
      icon: FiMessageCircle,
      color: 'bg-error-600',
      link: '/admin/chat'
    }
  ];

  const recentActivity = [
    {
      type: 'submission',
      message: 'Nuova prova inviata per Revolut',
      time: '5 minuti fa',
      user: 'John Doe'
    },
    {
      type: 'message',
      message: 'Nuovo messaggio in chat',
      time: '12 minuti fa',
      user: 'Jane Smith'
    },
    {
      type: 'bonus',
      message: 'Bonus Coinbase aggiornato',
      time: '1 ora fa',
      user: 'Admin'
    },
    {
      type: 'approval',
      message: 'Prova N26 approvata',
      time: '2 ore fa',
      user: 'Admin'
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Amministratore</h1>
          <p className="text-gray-600">Panoramica completa della piattaforma ReferralHub</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={stat.link}
                className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bg} mb-4`}>
                  <SafeIcon icon={stat.icon} className={`text-xl ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Azioni Rapide</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  to={action.link}
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${action.color} text-white mr-4`}>
                    <SafeIcon icon={action.icon} className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <SafeIcon icon={FiArrowRight} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Attività Recente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'submission' ? 'bg-warning-500' :
                    activity.type === 'message' ? 'bg-primary-500' :
                    activity.type === 'bonus' ? 'bg-success-500' :
                    'bg-error-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.user}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link
                to="/admin/analytics"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
              >
                <span>Vedi tutti i report</span>
                <SafeIcon icon={FiArrowRight} className="text-xs" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Stato del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-3 h-3 bg-success-500 rounded-full mx-auto mb-2"></div>
              <div className="text-sm font-medium text-gray-900">Piattaforma</div>
              <div className="text-xs text-success-600">Operativo</div>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-success-500 rounded-full mx-auto mb-2"></div>
              <div className="text-sm font-medium text-gray-900">Database</div>
              <div className="text-xs text-success-600">Operativo</div>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-warning-500 rounded-full mx-auto mb-2"></div>
              <div className="text-sm font-medium text-gray-900">Email Service</div>
              <div className="text-xs text-warning-600">Manutenzione</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;