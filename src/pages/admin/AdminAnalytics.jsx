import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiTrendingUp, FiTarget, FiDollarSign, FiActivity, FiCalendar } = FiIcons;

const AdminAnalytics = () => {
  const { bonuses, submissions, chatMessages, rewards } = useData();

  // Mock analytics data
  const analyticsData = {
    totalUsers: 1234,
    activeUsers: 892,
    totalRevenue: 15650,
    conversionRate: 23.5,
    avgTimeOnSite: '4m 32s',
    totalBonuses: bonuses.length,
    completedBonuses: submissions.filter(s => s.status === 'approved').length,
    pendingApprovals: submissions.filter(s => s.status === 'pending').length,
    chatMessages: chatMessages.filter(m => !m.isDeleted).length,
    rewardsRedeemed: 156
  };

  const stats = [
    {
      icon: FiUsers,
      label: 'Utenti Totali',
      value: analyticsData.totalUsers.toLocaleString(),
      change: '+12%',
      color: 'text-primary-600',
      bg: 'bg-primary-100'
    },
    {
      icon: FiActivity,
      label: 'Utenti Attivi',
      value: analyticsData.activeUsers.toLocaleString(),
      change: '+8%',
      color: 'text-success-600',
      bg: 'bg-success-100'
    },
    {
      icon: FiDollarSign,
      label: 'Revenue Totale',
      value: `€${analyticsData.totalRevenue.toLocaleString()}`,
      change: '+15%',
      color: 'text-warning-600',
      bg: 'bg-warning-100'
    },
    {
      icon: FiTrendingUp,
      label: 'Tasso Conversione',
      value: `${analyticsData.conversionRate}%`,
      change: '+3%',
      color: 'text-error-600',
      bg: 'bg-error-100'
    }
  ];

  const platformMetrics = [
    {
      icon: FiTarget,
      label: 'Bonus Completati',
      value: analyticsData.completedBonuses,
      total: analyticsData.totalBonuses,
      color: 'text-success-600'
    },
    {
      icon: FiCalendar,
      label: 'Approvazioni Pending',
      value: analyticsData.pendingApprovals,
      color: 'text-warning-600'
    },
    {
      icon: FiUsers,
      label: 'Messaggi Chat',
      value: analyticsData.chatMessages,
      color: 'text-primary-600'
    },
    {
      icon: FiTarget,
      label: 'Premi Riscattati',
      value: analyticsData.rewardsRedeemed,
      color: 'text-error-600'
    }
  ];

  const topBonuses = bonuses.slice(0, 5).map((bonus, index) => ({
    ...bonus,
    completions: Math.floor(Math.random() * 100) + 10,
    revenue: Math.floor(Math.random() * 5000) + 500
  }));

  const recentActivity = [
    { type: 'user_signup', message: 'Nuovo utente registrato', time: '2 minuti fa', count: 3 },
    { type: 'bonus_completion', message: 'Bonus Revolut completato', time: '5 minuti fa', count: 1 },
    { type: 'reward_redeemed', message: 'Buono Amazon riscattato', time: '12 minuti fa', count: 2 },
    { type: 'chat_message', message: 'Nuovo messaggio in chat', time: '18 minuti fa', count: 5 },
    { type: 'submission_pending', message: 'Nuova prova in attesa', time: '25 minuti fa', count: 1 }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Panoramica completa delle performance e metriche della piattaforma
          </p>
        </motion.div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-xs text-success-600 font-medium mt-1">{stat.change}</div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <SafeIcon icon={stat.icon} className={`text-xl ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Metriche Piattaforma</h2>
            <div className="space-y-4">
              {platformMetrics.map((metric, index) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={metric.icon} className={`text-lg ${metric.color}`} />
                    <span className="text-gray-700">{metric.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {metric.value}
                      {metric.total && <span className="text-gray-500">/{metric.total}</span>}
                    </div>
                  </div>
                </div>
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
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <div className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                    {activity.count}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Performing Bonuses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Bonus Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Bonus</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Completamenti</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Revenue</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topBonuses.map((bonus) => (
                  <tr key={bonus.id} className="hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={bonus.image}
                          alt={bonus.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <span className="font-medium text-gray-900">{bonus.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-900">{bonus.completions}</td>
                    <td className="py-4 text-gray-900">€{bonus.revenue.toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.floor(Math.random() * 40 + 10)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Growth Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Growth Rate</h3>
            <div className="text-3xl font-bold mb-1">+24%</div>
            <p className="text-primary-100 text-sm">Crescita utenti mensile</p>
          </div>

          <div className="bg-gradient-to-r from-success-500 to-success-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Retention</h3>
            <div className="text-3xl font-bold mb-1">78%</div>
            <p className="text-success-100 text-sm">Utenti attivi dopo 30 giorni</p>
          </div>

          <div className="bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Avg. Revenue</h3>
            <div className="text-3xl font-bold mb-1">€127</div>
            <p className="text-warning-100 text-sm">Per utente al mese</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;