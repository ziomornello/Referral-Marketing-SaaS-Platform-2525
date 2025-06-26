import React from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Header from './Header';

const Layout = ({ children }) => {
  const location = useLocation();
  const { connectionError } = useData();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-600 text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span>❌</span>
            <span>Errore di connessione al database. Alcune funzioni potrebbero non essere disponibili.</span>
            <button 
              onClick={() => window.location.reload()} 
              className="underline hover:no-underline ml-4"
            >
              Ricarica Pagina
            </button>
          </div>
        </div>
      )}
      
      <main className={`${isAdminRoute ? 'pt-14 sm:pt-16' : 'pt-16 sm:pt-20'} ${connectionError ? 'pt-20 sm:pt-24' : ''} pb-safe`}>
        <div className="px-safe">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;