import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import toast from 'react-hot-toast';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [bonuses, setBonuses] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [appConfig, setAppConfig] = useState({
    pointsSystemEnabled: true,
    rewardsEnabled: true,
    chatEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    initializeData();

    // 🔥 ASCOLTA EVENTI DI REGISTRAZIONE/LOGIN PER RICARICARE UTENTI
    const handleUserRegistered = (event) => {
      console.log('🆕 Nuovo utente registrato, ricarico lista utenti:', event.detail);
      fetchUsers();
    };

    const handleUserLoggedIn = (event) => {
      console.log('🔐 Utente loggato, ricarico lista utenti:', event.detail);
      fetchUsers();
    };

    window.addEventListener('userRegistered', handleUserRegistered);
    window.addEventListener('userLoggedIn', handleUserLoggedIn);

    // Set up real-time subscriptions with error handling
    let bonusSubscription, rewardsSubscription, messagesSubscription, configSubscription, usersSubscription, submissionsSubscription, notificationsSubscription;

    try {
      bonusSubscription = supabase
        .channel('bonuses_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bonuses_rh847' }, () => {
          console.log('🔄 Bonus changed, refreshing...');
          fetchBonuses();
        })
        .subscribe();

      rewardsSubscription = supabase
        .channel('rewards_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rewards_rh847' }, () => {
          console.log('🔄 Rewards changed, refreshing...');
          fetchRewards();
        })
        .subscribe();

      messagesSubscription = supabase
        .channel('messages_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages_rh847' }, () => {
          console.log('🔄 Messages changed, refreshing...');
          fetchChatMessages();
        })
        .subscribe();

      configSubscription = supabase
        .channel('config_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config_rh847' }, () => {
          console.log('🔄 Config changed, refreshing...');
          fetchAppConfig();
        })
        .subscribe();

      usersSubscription = supabase
        .channel('users_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users_rh847' }, () => {
          console.log('🔄 Users changed, refreshing...');
          fetchUsers();
        })
        .subscribe();

      // 🔥 AGGIUNTA SUBSCRIPTION PER SUBMISSIONS
      submissionsSubscription = supabase
        .channel('submissions_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions_rh847' }, () => {
          console.log('🔄 Submissions changed, refreshing...');
          fetchSubmissions();
        })
        .subscribe();

      // 🔥 SUBSCRIPTION PER NOTIFICHE
      notificationsSubscription = supabase
        .channel('notifications_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_notifications_rh847' }, () => {
          console.log('🔄 Notifications changed, refreshing...');
          fetchNotifications();
        })
        .subscribe();

    } catch (error) {
      console.error('❌ Errore setup subscriptions:', error);
      setConnectionError(true);
    }

    return () => {
      try {
        if (bonusSubscription) bonusSubscription.unsubscribe();
        if (rewardsSubscription) rewardsSubscription.unsubscribe();
        if (messagesSubscription) messagesSubscription.unsubscribe();
        if (configSubscription) configSubscription.unsubscribe();
        if (usersSubscription) usersSubscription.unsubscribe();
        if (submissionsSubscription) submissionsSubscription.unsubscribe();
        if (notificationsSubscription) notificationsSubscription.unsubscribe();

        window.removeEventListener('userRegistered', handleUserRegistered);
        window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      } catch (error) {
        console.error('❌ Errore cleanup subscriptions:', error);
      }
    };
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      console.log('🚀 Inizializzazione dati...');

      // Test connessione prima di procedere
      const { error: testError } = await supabase
        .from('bonuses_rh847')
        .select('count', { count: 'exact', head: true });

      if (testError) {
        throw new Error('Connessione database fallita: ' + testError.message);
      }

      console.log('✅ Connessione database OK');

      await Promise.all([
        fetchBonuses(),
        fetchRewards(),
        fetchSubmissions(),
        fetchChatMessages(),
        fetchUsers(),
        fetchAppConfig(),
        fetchNotifications()
      ]);

      console.log('✅ Tutti i dati caricati con successo');
    } catch (error) {
      console.error('❌ Errore inizializzazione:', error);
      setConnectionError(true);
      toast.error('❌ Errore di connessione al database', { style: { zIndex: 9998 } });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('👥 Caricamento utenti...');
      const { data, error } = await supabase
        .from('users_rh847')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Errore fetch users:', error);
        throw error;
      }

      console.log('✅ Utenti caricati:', data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error('❌ Errore fetching users:', error);
    }
  };

  // 🔥 FETCH NOTIFICHE
  const fetchNotifications = async () => {
    try {
      console.log('🔔 Caricamento notifiche...');
      const { data, error } = await supabase
        .from('user_notifications_rh847')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Errore fetch notifications:', error);
        throw error;
      }

      console.log('✅ Notifiche caricate:', data?.length || 0);
      setNotifications(data || []);
    } catch (error) {
      console.error('❌ Errore fetching notifications:', error);
    }
  };

  const fetchAppConfig = async () => {
    try {
      console.log('📱 Caricamento configurazione app...');
      const { data, error } = await supabase
        .from('app_config_rh847')
        .select('*');

      if (error) {
        console.error('❌ Errore fetch app config:', error);
        throw error;
      }

      const config = {};
      data?.forEach(item => {
        config[item.config_key] = item.config_value;
      });

      setAppConfig({
        pointsSystemEnabled: config.points_system_enabled ?? true,
        rewardsEnabled: config.rewards_enabled ?? true,
        chatEnabled: config.chat_enabled ?? true
      });

      console.log('✅ Configurazione app caricata');
    } catch (error) {
      console.error('❌ Errore fetching app config:', error);
    }
  };

  const updateAppConfig = async (key, value) => {
    try {
      console.log('🔄 Aggiornamento configurazione:', key, value);

      const configKeyMap = {
        pointsSystemEnabled: 'points_system_enabled',
        rewardsEnabled: 'rewards_enabled',
        chatEnabled: 'chat_enabled'
      };

      const dbKey = configKeyMap[key] || key;

      const { error } = await supabase
        .from('app_config_rh847')
        .upsert({ config_key: dbKey, config_value: value });

      if (error) {
        console.error('❌ Errore update config:', error);
        throw error;
      }

      setAppConfig(prev => ({ ...prev, [key]: value }));
      toast.success(`✅ Configurazione aggiornata!`, { style: { zIndex: 9998 } });
    } catch (error) {
      console.error('❌ Errore updating app config:', error);
      toast.error('❌ Errore aggiornamento configurazione', { style: { zIndex: 9998 } });
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      console.log('🔄 Aggiornamento utente:', userId, userData);

      const { error } = await supabase
        .from('users_rh847')
        .update(userData)
        .eq('id', userId);

      if (error) {
        console.error('❌ Errore update user:', error);
        throw error;
      }

      await fetchUsers();
      toast.success('✅ Utente aggiornato!', { style: { zIndex: 9998 } });
    } catch (error) {
      console.error('❌ Errore updating user:', error);
      toast.error('❌ Errore aggiornamento utente', { style: { zIndex: 9998 } });
    }
  };

  const deleteUser = async (userId) => {
    try {
      console.log('🗑️ Eliminazione utente:', userId);

      const { error } = await supabase
        .from('users_rh847')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Errore delete user:', error);
        throw error;
      }

      await fetchUsers();
      toast.success('🗑️ Utente eliminato!', { style: { zIndex: 9998 } });
    } catch (error) {
      console.error('❌ Errore deleting user:', error);
      toast.error('❌ Errore eliminazione utente', { style: { zIndex: 9998 } });
    }
  };

  const fetchBonuses = async () => {
    try {
      console.log('🎁 Caricamento bonus...');
      const { data, error } = await supabase
        .from('bonuses_rh847')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Errore fetch bonuses:', error);
        throw error;
      }

      console.log('✅ Bonus caricati:', data?.length || 0);

      const formattedBonuses = (data || []).map(bonus => ({
        id: bonus.id,
        name: bonus.name,
        image: bonus.image,
        description: bonus.description,
        signupBonus: bonus.signup_bonus,
        referralBonus: bonus.referral_bonus,
        expiryDate: bonus.expiry_date,
        guideCode: bonus.guide_code,
        closureCode: bonus.closure_code,
        referralTemplate: bonus.referral_template,
        isActive: bonus.is_active,
        guideFirst: bonus.guide_first ?? false,
        // 🔥 CAMPI EXTRA - Con controllo sicuro
        notes: bonus.notes || '',
        extraTitle: bonus.extra_title || '',
        extraDescription: bonus.extra_description || '',
        extraGuideCode: bonus.extra_guide_code || '',
        extraGuideLink: bonus.extra_guide_link || '',
        workflowStates: bonus.workflow_states || 'not_started,completed'
      }));

      console.log('✅ Bonus formattati:', formattedBonuses);
      setBonuses(formattedBonuses);
    } catch (error) {
      console.error('❌ Errore fetching bonuses:', error);
      toast.error('❌ Errore caricamento bonus', { style: { zIndex: 9998 } });
      throw error;
    }
  };

  const fetchRewards = async () => {
    try {
      console.log('🏆 Caricamento premi...');
      const { data, error } = await supabase
        .from('rewards_rh847')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Errore fetch rewards:', error);
        throw error;
      }

      console.log('✅ Premi caricati:', data?.length || 0);
      setRewards(data || []);
    } catch (error) {
      console.error('❌ Errore fetching rewards:', error);
      toast.error('❌ Errore caricamento premi', { style: { zIndex: 9998 } });
    }
  };

  const fetchSubmissions = async () => {
    try {
      console.log('📤 Caricamento submissions...');
      const { data, error } = await supabase
        .from('submissions_rh847')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('❌ Errore fetch submissions:', error);
        throw error;
      }

      console.log('✅ Submissions caricate:', data?.length || 0);

      const formattedSubmissions = (data || []).map(submission => ({
        id: submission.id,
        userId: submission.user_id,
        userName: submission.user_name,
        bonusId: submission.bonus_id,
        bonusName: submission.bonus_name,
        type: submission.type,
        files: submission.files,
        notes: submission.notes,
        status: submission.status,
        adminNotes: submission.admin_notes,
        submittedAt: submission.submitted_at,
        reviewedAt: submission.reviewed_at,
        adminCreated: submission.admin_created || false // 🔥 Flag per distinguere se creata dall'admin
      }));

      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error('❌ Errore fetching submissions:', error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      console.log('💬 Caricamento messaggi chat...');
      const { data, error } = await supabase
        .from('chat_messages_rh847')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Errore fetch messages:', error);
        throw error;
      }

      console.log('✅ Messaggi caricati:', data?.length || 0);

      const formattedMessages = (data || []).map(msg => ({
        id: msg.id,
        userId: msg.user_id,
        userName: msg.user_name,
        message: msg.message,
        timestamp: msg.created_at,
        isDeleted: msg.is_deleted
      }));

      setChatMessages(formattedMessages);
    } catch (error) {
      console.error('❌ Errore fetching chat messages:', error);
    }
  };

  // 🔥 FUNZIONE ADD BONUS COMPLETAMENTE AGGIORNATA
  const addBonus = async (bonus) => {
    try {
      console.log('➕ Creazione nuovo bonus:', bonus);

      // 🔥 PREPARA TUTTI I DATI IN UNA VOLTA
      const completeBonusData = {
        // Campi obbligatori
        name: bonus.name,
        image: bonus.image,
        description: bonus.description,
        signup_bonus: Number(bonus.signupBonus),
        referral_bonus: Number(bonus.referralBonus),
        expiry_date: bonus.expiryDate,
        // Campi opzionali con fallback
        guide_code: bonus.guideCode || '',
        closure_code: bonus.closureCode || '',
        referral_template: bonus.referralTemplate || '',
        is_active: Boolean(bonus.isActive),
        guide_first: Boolean(bonus.guideFirst),
        // 🔥 WORKFLOW STATES - Ora incluso
        workflow_states: bonus.workflowStates || 'not_started,completed',
        // 🔥 CAMPI EXTRA - Tutti inclusi
        notes: String(bonus.notes || ''),
        extra_title: String(bonus.extraTitle || ''),
        extra_description: String(bonus.extraDescription || ''),
        extra_guide_code: String(bonus.extraGuideCode || ''),
        extra_guide_link: String(bonus.extraGuideLink || '')
      };

      console.log('📦 Dati completi bonus da inserire:', completeBonusData);

      // 🔥 INSERIMENTO DIRETTO CON TUTTI I CAMPI
      const { data, error } = await supabase
        .from('bonuses_rh847')
        .insert([completeBonusData])
        .select()
        .single();

      if (error) {
        console.error('❌ Errore insert bonus:', error);
        throw error;
      }

      console.log('✅ Bonus creato con successo:', data);
      await fetchBonuses();
      toast.success('🎉 Bonus creato con successo!', { style: { zIndex: 9998 } });
    } catch (error) {
      console.error('❌ Errore adding bonus:', error);
      toast.error('❌ Errore creazione bonus: ' + (error.message || 'Errore sconosciuto'), { style: { zIndex: 9998 } });
      throw error;
    }
  };

  // 🔥 FUNZIONE UPDATE BONUS AGGIORNATA
  const updateBonus = async (id, updatedBonus) => {
    try {
      console.log('🔄 Aggiornamento bonus ID:', id);

      // 🔥 PREPARA TUTTI I DATI COMPLETI
      const allBonusData = {
        // Campi obbligatori
        name: updatedBonus.name,
        image: updatedBonus.image,
        description: updatedBonus.description,
        signup_bonus: Number(updatedBonus.signupBonus),
        referral_bonus: Number(updatedBonus.referralBonus),
        expiry_date: updatedBonus.expiryDate,
        // Campi opzionali
        guide_code: updatedBonus.guideCode || '',
        closure_code: updatedBonus.closureCode || '',
        referral_template: updatedBonus.referralTemplate || '',
        is_active: Boolean(updatedBonus.isActive),
        guide_first: Boolean(updatedBonus.guideFirst),
        // 🔥 WORKFLOW STATES
        workflow_states: updatedBonus.workflowStates || 'not_started,completed',
        // 🔥 CAMPI EXTRA
        notes: String(updatedBonus.notes || ''),
        extra_title: String(updatedBonus.extraTitle || ''),
        extra_description: String(updatedBonus.extraDescription || ''),
        extra_guide_code: String(updatedBonus.extraGuideCode || ''),
        extra_guide_link: String(updatedBonus.extraGuideLink || '')
      };

      console.log('📦 Dati completi da aggiornare:', allBonusData);

      const { data, error } = await supabase
        .from('bonuses_rh847')
        .update(allBonusData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Errore update bonus:', error);
        throw error;
      }

      console.log('✅ Bonus aggiornato con successo:', data);
      await fetchBonuses();
      toast.success('✅ Bonus aggiornato con successo!', { style: { zIndex: 9998 } });
    } catch (error) {
      console.error('❌ Errore updating bonus:', error);
      toast.error('❌ Errore aggiornamento bonus: ' + (error.message || 'Errore sconosciuto'), { style: { zIndex: 9998 } });
      throw error;
    }
  };

  const deleteBonus = async (id) => {
    try {
      console.log('🗑️ Eliminazione bonus ID:', id);

      const { error } = await supabase
        .from('bonuses_rh847')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Errore delete bonus:', error);
        throw error;
      }

      console.log('✅ Bonus eliminato con successo');
      await fetchBonuses();
      toast.success('🗑️ Bonus eliminato con successo!', { style: { zIndex: 9998 } });
    } catch (error) {
      console.error('❌ Errore deleting bonus:', error);
      toast.error('❌ Errore eliminazione bonus', { style: { zIndex: 9998 } });
      throw error;
    }
  };

  const addReward = async (reward) => {
    try {
      console.log('➕ Creazione nuovo premio:', reward);

      const { data, error } = await supabase
        .from('rewards_rh847')
        .insert([reward])
        .select()
        .single();

      if (error) {
        console.error('❌ Errore insert reward:', error);
        throw error;
      }

      console.log('✅ Premio creato:', data);
      await fetchRewards();
      toast.success('🎁 Premio creato con successo!', { style: { zIndex: 9998 } });
    } catch (error) {
      console.error('❌ Errore adding reward:', error);
      toast.error('❌ Errore creazione premio', { style: { zIndex: 9998 } });
      throw error;
    }
  };

  const updateReward = async (id, updatedReward) => {
    try {
      console.log('🔄 Aggiornamento premio ID:', id, updatedReward);

      const { error } = await supabase
        .from('rewards_rh847')
        .update(updatedReward)
        .eq('id', id);

      if (error) {
        console.error('❌ Errore update reward:', error);
        throw error;
      }

      console.log('✅ Premio aggiornato');
      await fetchRewards();
      toast.success('✅ Premio aggiornato!', { style: { zIndex: 9998 } });
    } catch (error) {
      console.error('❌ Errore updating reward:', error);
      toast.error('❌ Errore aggiornamento premio', { style: { zIndex: 9998 } });
      throw error;
    }
  };

  const deleteReward = async (id) => {
    try {
      console.log('🗑️ Eliminazione premio ID:', id);

      const { error } = await supabase
        .from('rewards_rh847')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Errore delete reward:', error);
        throw error;
      }

      console.log('✅ Premio eliminato');
      await fetchRewards();
      toast.success('🗑️ Premio eliminato!', { style: { zIndex: 9998 } });
    } catch (error) {
      console.error('❌ Errore deleting reward:', error);
      toast.error('❌ Errore eliminazione premio', { style: { zIndex: 9998 } });
      throw error;
    }
  };

  // 🔥 FIX: ADD SUBMISSION - GESTIONE ESPLICITA DELLA COLONNA admin_created
  const addSubmission = async (submission, isAdminCreated = false) => {
    try {
      console.log('📤 Invio nuova submission:', submission, 'Admin created:', isAdminCreated);

      // 🔥 FIX: Prepara i dati con controllo esplicito della colonna admin_created
      const submissionData = {
        user_id: submission.userId,
        user_name: submission.userName,
        bonus_id: submission.bonusId,
        bonus_name: submission.bonusName,
        type: submission.type,
        files: submission.files,
        notes: submission.notes,
        status: submission.status || 'pending'
      };

      // 🔥 FIX: Aggiungi admin_created solo se la colonna esiste
      try {
        // Test se la colonna admin_created esiste facendo una query di test
        const { error: testError } = await supabase
          .from('submissions_rh847')
          .select('admin_created')
          .limit(1);

        if (!testError) {
          // La colonna esiste, aggiungila ai dati
          submissionData.admin_created = Boolean(isAdminCreated);
          console.log('✅ Colonna admin_created trovata, aggiunta ai dati');
        } else {
          console.log('⚠️ Colonna admin_created non trovata, skippo');
        }
      } catch (columnError) {
        console.log('⚠️ Errore nel check colonna admin_created:', columnError.message);
      }

      console.log('📦 Dati submission finali da inserire:', submissionData);

      const { data, error } = await supabase
        .from('submissions_rh847')
        .insert([submissionData])
        .select()
        .single();

      if (error) {
        console.error('❌ Errore insert submission:', error);
        throw error;
      }

      console.log('✅ Submission inviata:', data);

      // 🔥 CREA NOTIFICA SOLO SE NON È ADMIN-CREATED
      if (!isAdminCreated) {
        await createNotification(
          submission.userId,
          'submission_created',
          `🎯 Prova inviata per ${submission.bonusName}`,
          `La tua prova per il bonus ${submission.bonusName} è stata inviata e verrà revisionata dagli amministratori.`,
          { bonusId: submission.bonusId, submissionId: data.id }
        );

        toast.success('📤 Prova inviata con successo!', { style: { zIndex: 9998 } });
      }

      await fetchSubmissions();
    } catch (error) {
      console.error('❌ Errore adding submission:', error);
      if (!isAdminCreated) {
        toast.error('❌ Errore invio prova', { style: { zIndex: 9998 } });
      }
      throw error;
    }
  };

  // 🔥 CREA NOTIFICA UTENTE
  const createNotification = async (userId, type, title, message, metadata = {}) => {
    try {
      const notificationData = {
        user_id: userId,
        type: type,
        title: title,
        message: message,
        metadata: metadata,
        is_read: false
      };

      const { error } = await supabase
        .from('user_notifications_rh847')
        .insert([notificationData]);

      if (error) {
        console.error('❌ Errore creazione notifica:', error);
        throw error;
      }

      console.log('✅ Notifica creata:', notificationData);
      await fetchNotifications();
    } catch (error) {
      console.error('❌ Errore creating notification:', error);
    }
  };

  const updateSubmissionStatus = async (id, status, adminNotes = '', notifyUser = true) => {
    try {
      console.log('🔄 Aggiornamento status submission:', id, status);

      const updateData = {
        status,
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('submissions_rh847')
        .update(updateData)
        .eq('id', id)
        .select('*,user_id,bonus_name')
        .single();

      if (error) {
        console.error('❌ Errore update submission:', error);
        throw error;
      }

      console.log('✅ Status submission aggiornato');

      // 🔥 CREA NOTIFICA PER L'UTENTE
      if (notifyUser && data) {
        let notificationTitle, notificationMessage;

        switch (status) {
          case 'approved':
            notificationTitle = `🎉 Bonus ${data.bonus_name} Approvato!`;
            notificationMessage = `La tua prova per ${data.bonus_name} è stata approvata! Congratulazioni! 🎊`;
            break;
          case 'rejected':
            notificationTitle = `❌ Prova ${data.bonus_name} Rifiutata`;
            notificationMessage = `La tua prova per ${data.bonus_name} è stata rifiutata. ${adminNotes ? `Motivo: ${adminNotes}` : 'Controlla i dettagli e riprova.'}`;
            break;
          case 'pending':
            notificationTitle = `⏳ Stato ${data.bonus_name} Aggiornato`;
            notificationMessage = `Lo stato del tuo bonus ${data.bonus_name} è stato aggiornato dall'amministratore.`;
            break;
          case 'cancelled':
            notificationTitle = `🔄 Bonus ${data.bonus_name} Reimpostato`;
            notificationMessage = `Il tuo bonus ${data.bonus_name} è stato reimpostato. Puoi ricominciare quando vuoi!`;
            break;
          default:
            notificationTitle = `📊 Aggiornamento ${data.bonus_name}`;
            notificationMessage = `Lo stato del tuo bonus ${data.bonus_name} è stato modificato.`;
        }

        await createNotification(
          data.user_id,
          'bonus_status_update',
          notificationTitle,
          notificationMessage,
          { bonusName: data.bonus_name, status: status, adminNotes }
        );
      }

      await fetchSubmissions();

      if (!notifyUser) {
        // Solo toast per admin, non per notifiche automatiche
        toast.success('✅ Status aggiornato!', { style: { zIndex: 9998 } });
      }

    } catch (error) {
      console.error('❌ Errore updating submission status:', error);
      toast.error('❌ Errore aggiornamento status', { style: { zIndex: 9998 } });
      throw error;
    }
  };

  const addChatMessage = async (message) => {
    try {
      console.log('💬 Invio nuovo messaggio:', message);

      const messageData = {
        user_id: message.userId,
        user_name: message.userName,
        message: message.message
      };

      const { data, error } = await supabase
        .from('chat_messages_rh847')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('❌ Errore insert message:', error);
        throw error;
      }

      console.log('✅ Messaggio inviato:', data);
      await fetchChatMessages();
    } catch (error) {
      console.error('❌ Errore adding chat message:', error);
      toast.error('❌ Errore invio messaggio', { style: { zIndex: 9998 } });
      throw error;
    }
  };

  const deleteChatMessage = async (id) => {
    try {
      console.log('🗑️ Eliminazione messaggio ID:', id);

      const { error } = await supabase
        .from('chat_messages_rh847')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) {
        console.error('❌ Errore delete message:', error);
        throw error;
      }

      console.log('✅ Messaggio eliminato');
      await fetchChatMessages();
      toast.success('🗑️ Messaggio eliminato!', { style: { zIndex: 9998 } });
    } catch (error) {
      console.error('❌ Errore deleting chat message:', error);
      toast.error('❌ Errore eliminazione messaggio', { style: { zIndex: 9998 } });
      throw error;
    }
  };

  // 🔥 SEGNA NOTIFICA COME LETTA
  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('user_notifications_rh847')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Errore marking notification as read:', error);
        throw error;
      }

      await fetchNotifications();
    } catch (error) {
      console.error('❌ Errore marking notification as read:', error);
    }
  };

  const value = {
    bonuses,
    rewards,
    submissions,
    chatMessages,
    users,
    notifications,
    appConfig,
    loading,
    connectionError,
    addBonus,
    updateBonus,
    deleteBonus,
    addReward,
    updateReward,
    deleteReward,
    addSubmission,
    updateSubmissionStatus,
    addChatMessage,
    deleteChatMessage,
    updateUser,
    deleteUser,
    updateAppConfig,
    createNotification,
    markNotificationAsRead,
    refreshData: initializeData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};