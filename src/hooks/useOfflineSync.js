import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);
  const { refreshData } = useData();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      
      if (pendingActions.length > 0) {
        toast.loading('Sincronizzazione dati offline...', { id: 'offline-sync' });
        
        try {
          // Process pending actions when coming back online
          for (const action of pendingActions) {
            // Execute the pending action
            await action.execute();
          }
          
          // Clear pending actions
          setPendingActions([]);
          localStorage.removeItem('pendingActions');
          
          // Refresh all data
          await refreshData();
          
          toast.success('Dati sincronizzati con successo!', { id: 'offline-sync' });
        } catch (error) {
          console.error('Error syncing offline data:', error);
          toast.error('Errore nella sincronizzazione offline', { id: 'offline-sync' });
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast('Modalità offline attiva. Le modifiche saranno sincronizzate quando tornerai online.', {
        icon: '📡',
        duration: 3000
      });
    };

    // Load pending actions from localStorage
    const savedActions = localStorage.getItem('pendingActions');
    if (savedActions) {
      setPendingActions(JSON.parse(savedActions));
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActions, refreshData]);

  const addPendingAction = (action) => {
    if (!isOnline) {
      const newPendingActions = [...pendingActions, action];
      setPendingActions(newPendingActions);
      localStorage.setItem('pendingActions', JSON.stringify(newPendingActions));
      
      toast('Azione salvata per sincronizzazione offline', {
        icon: '💾',
        duration: 2000
      });
    }
  };

  return {
    isOnline,
    pendingActions: pendingActions.length,
    addPendingAction
  };
};