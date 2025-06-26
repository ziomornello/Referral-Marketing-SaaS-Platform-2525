import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useAppCustomization } from '../contexts/AppCustomizationContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiGift, FiMessageCircle, 
  FiBarChart3, FiAward, FiKey, FiCheckCircle, FiUsers, FiHome, FiPalette 
} = FiIcons;

const Header = () => {
  const { user, logout } = useAuth();
  const { appConfig } = useData();
  const { customization } = useAppCustomization();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // 🔥 MENU UTENTE DINAMICO - Nasconde premi se disabilitati
  const userMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/profile', label: 'Profilo', icon: FiUser },
    // Mostra premi solo se abilitati
    ...(appConfig.rewardsEnabled && appConfig.pointsSystemEnabled ? 
      [{ path: '/rewards', label: 'Premi', icon: FiAward }] : []
    ),
    // Mostra chat solo se abilitata
    ...(appConfig.chatEnabled ? 
      [{ path: '/chat', label: 'Chat', icon: FiMessageCircle }] : []
    ),
  ];

  // 🔥 ADMIN MENU COMPLETO - Tutte le voci visibili su mobile/tablet
  const adminMenuItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: FiSettings, priority: 1 },
    { path: '/admin/bonuses', label: 'Gestione Bonus', icon: FiGift, priority: 1 },
    { path: '/admin/approvals', label: 'Approvazioni', icon: FiCheckCircle, priority: 1 },
    { path: '/admin/users', label: 'Gestione Utenti', icon: FiUsers, priority: 1 },
    { path: '/admin/customization', label: 'Personalizzazione', icon: FiPalette, priority: 1 },
    // Mostra premi solo se abilitati
    ...(appConfig.rewardsEnabled && appConfig.pointsSystemEnabled ? 
      [{ path: '/admin/rewards', label: 'Gestione Premi', icon: FiAward, priority: 2 }] : []
    ),
    { path: '/admin/proofs', label: 'Prove Approvate', icon: FiCheckCircle, priority: 2 },
    { path: '/admin/settings', label: 'Impostazioni', icon: FiSettings, priority: 2 },
    { path: '/admin/analytics', label: 'Analytics', icon: FiBarChart3, priority: 3 },
    // Mostra chat solo se abilitata
    ...(appConfig.chatEnabled ? 
      [{ path: '/admin/chat', label: 'Moderazione Chat', icon: FiMessageCircle, priority: 3 }] : []
    ),
    // Chat normale per admin (sempre visibile se abilitata)
    ...(appConfig.chatEnabled ? 
      [{ path: '/chat', label: 'Chat Comunità', icon: FiMessageCircle, priority: 2 }] : []
    ),
  ];

  // Desktop: mostra solo le prime 5, Mobile: mostra tutte
  const getDesktopAdminItems = () => adminMenuItems.filter(item => item.priority === 1);
  const getAllAdminItems = () => adminMenuItems;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-purple-100"
      style={{ 
        backgroundColor: customization.showHeaderGradient 
          ? 'transparent'
          : 'rgba(255, 255, 255, 0.9)',
        background: customization.showHeaderGradient 
          ? `linear-gradient(135deg, ${customization.primaryColor}, ${customization.secondaryColor})`
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2 flex-shrink-0">
            {customization.logoUrl ? (
              <img 
                src={customization.logoUrl} 
                alt="Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain" 
              />
            ) : (
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-lg"
                style={{ 
                  background: customization.showHeaderGradient 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : `linear-gradient(135deg, ${customization.primaryColor}, ${customization.secondaryColor})`
                }}
              >
                <span 
                  className="font-bold text-sm sm:text-lg"
                  style={{ 
                    color: customization.showHeaderGradient ? 'white' : 'white'
                  }}
                >
                  {customization.logoText.charAt(0)}
                </span>
              </div>
            )}
            <span 
              className="text-lg sm:text-xl font-bold hidden xs:block"
              style={{ 
                color: customization.showHeaderGradient 
                  ? 'white' 
                  : customization.primaryColor
              }}
            >
              {customization.logoText}
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <div className="hidden xl:flex items-center space-x-6 2xl:space-x-8">
            {!user && (
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? (customization.showHeaderGradient ? 'text-white' : 'text-purple-600')
                    : (customization.showHeaderGradient ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-purple-600')
                }`}
              >
                Bonus Disponibili
              </Link>
            )}

            {user && (
              <>
                {user.role === 'admin' ? (
                  getDesktopAdminItems().map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      className={`text-sm font-medium transition-colors ${
                        isActive(item.path) 
                          ? (customization.showHeaderGradient ? 'text-white' : 'text-purple-600')
                          : (customization.showHeaderGradient ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-purple-600')
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))
                ) : (
                  userMenuItems.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      className={`text-sm font-medium transition-colors ${
                        isActive(item.path) 
                          ? (customization.showHeaderGradient ? 'text-white' : 'text-purple-600')
                          : (customization.showHeaderGradient ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-purple-600')
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    customization.showHeaderGradient 
                      ? 'hover:bg-white/10' 
                      : 'hover:bg-purple-50'
                  }`}
                >
                  <div 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                    style={{ 
                      background: customization.showHeaderGradient 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : `linear-gradient(135deg, ${customization.primaryColor}, ${customization.secondaryColor})`
                    }}
                  >
                    <SafeIcon icon={FiUser} className="text-white text-xs sm:text-sm" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p 
                      className="text-sm font-medium truncate max-w-24"
                      style={{ 
                        color: customization.showHeaderGradient ? 'white' : customization.textColor
                      }}
                    >
                      {user.name}
                    </p>
                    {/* 🔥 NASCONDE PUNTI SE SISTEMA DISABILITATO */}
                    {appConfig.pointsSystemEnabled && (
                      <p 
                        className="text-xs"
                        style={{ 
                          color: customization.showHeaderGradient 
                            ? 'rgba(255, 255, 255, 0.8)' 
                            : customization.primaryColor
                        }}
                      >
                        {user.points} punti
                      </p>
                    )}
                  </div>
                  <div className="block sm:hidden">
                    {/* 🔥 NASCONDE PUNTI SE SISTEMA DISABILITATO */}
                    {appConfig.pointsSystemEnabled && (
                      <p 
                        className="text-xs font-medium"
                        style={{ 
                          color: customization.showHeaderGradient 
                            ? 'rgba(255, 255, 255, 0.8)' 
                            : customization.primaryColor
                        }}
                      >
                        {user.points}
                      </p>
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-purple-100 py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-purple-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {/* 🔥 NASCONDE PUNTI SE SISTEMA DISABILITATO */}
                        {appConfig.pointsSystemEnabled && (
                          <p className="text-xs text-purple-600 font-medium">{user.points} punti</p>
                        )}
                      </div>
                      {/* 🔥 AGGIUNTO LINK AL PROFILO */}
                      <Link 
                        to="/profile" 
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center space-x-2"
                      >
                        <SafeIcon icon={FiUser} className="text-sm" />
                        <span>Il Mio Profilo</span>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center space-x-2"
                      >
                        <SafeIcon icon={FiLogOut} className="text-sm" />
                        <span>Esci dall'Account</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                    customization.showHeaderGradient 
                      ? 'text-white/80 hover:text-white' 
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  Accedi
                </Link>
                <Link 
                  to="/register" 
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-md"
                  style={{
                    backgroundColor: customization.showHeaderGradient 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : customization.primaryColor,
                    color: 'white'
                  }}
                >
                  Registrati
                </Link>
              </div>
            )}

            {/* Mobile/Tablet Menu Button - Sempre visibile sotto XL */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`xl:hidden p-2 rounded-lg transition-colors ${
                customization.showHeaderGradient 
                  ? 'hover:bg-white/10' 
                  : 'hover:bg-purple-50'
              }`}
            >
              <SafeIcon 
                icon={isMenuOpen ? FiX : FiMenu} 
                className={`text-xl ${
                  customization.showHeaderGradient ? 'text-white' : 'text-purple-600'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu - Mostra TUTTE le voci admin */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden border-t border-purple-100 max-h-[calc(100vh-4rem)] overflow-y-auto"
            style={{ 
              backgroundColor: customization.showHeaderGradient 
                ? `${customization.primaryColor}dd`
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="px-4 py-2 space-y-1">
              {!user && (
                <Link 
                  to="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md text-sm font-medium ${
                    isActive('/') 
                      ? (customization.showHeaderGradient ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600')
                      : (customization.showHeaderGradient ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-purple-50')
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiGift} className="text-lg" />
                    <span>Bonus Disponibili</span>
                  </div>
                </Link>
              )}

              {user && (
                <>
                  {user.role === 'admin' ? (
                    <>
                      {/* Sezione Admin Principale */}
                      <div className="py-2">
                        <div 
                          className={`text-xs font-semibold uppercase tracking-wider px-3 py-2 ${
                            customization.showHeaderGradient ? 'text-white/60' : 'text-gray-500'
                          }`}
                        >
                          🔧 Amministrazione
                        </div>
                        {getAllAdminItems().map((item) => (
                          <Link 
                            key={item.path} 
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-3 py-3 rounded-md text-sm font-medium ${
                              isActive(item.path) 
                                ? (customization.showHeaderGradient ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600')
                                : (customization.showHeaderGradient ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-purple-50')
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <SafeIcon icon={item.icon} className="text-lg" />
                              <span>{item.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Sezione Utente */}
                      <div className="py-2">
                        <div 
                          className={`text-xs font-semibold uppercase tracking-wider px-3 py-2 ${
                            customization.showHeaderGradient ? 'text-white/60' : 'text-gray-500'
                          }`}
                        >
                          👤 Area Utente
                        </div>
                        {userMenuItems.map((item) => (
                          <Link 
                            key={item.path} 
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-3 py-3 rounded-md text-sm font-medium ${
                              isActive(item.path) 
                                ? (customization.showHeaderGradient ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600')
                                : (customization.showHeaderGradient ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-purple-50')
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <SafeIcon icon={item.icon} className="text-lg" />
                              <span>{item.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;