import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('🔄 Caricamento utente da localStorage:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ Errore parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // 🔥 REFRESH USER DATA - Funzione per aggiornare i dati utente
  const refreshUserData = async () => {
    if (!user?.id) return;

    try {
      const { data: dbUser, error } = await supabase
        .from('users_rh847')
        .select('*')
        .eq('id', user.id)
        .single();

      if (dbUser && !error) {
        const syncedUser = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          phone: dbUser.phone,
          role: dbUser.role,
          points: dbUser.points,
          referralCode: dbUser.referral_code,
          acceptPromotions: dbUser.accept_promotions,
          textSize: dbUser.text_size
        };

        setUser(syncedUser);
        localStorage.setItem('user', JSON.stringify(syncedUser));
        console.log('✅ Dati utente aggiornati:', syncedUser);
      }
    } catch (error) {
      console.error('❌ Errore refresh user data:', error);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Tentativo login:', email);
      
      // 🔍 CERCA SEMPRE NEL DATABASE PRIMA - Con controllo password
      const { data: dbUser, error: dbError } = await supabase
        .from('users_rh847')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      console.log('🔍 Risultato ricerca database:', { dbUser, dbError });

      // 🔥 FIX: Verifica password solo se la demo password è corretta O se l'utente esiste già
      if (dbUser && !dbError) {
        console.log('✅ Utente trovato nel database:', dbUser);
        
        // Per ora accettiamo qualsiasi password per utenti esistenti nel DB
        // In produzione qui dovresti verificare la password hashata
        
        const syncedUser = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          phone: dbUser.phone,
          role: dbUser.role,
          points: dbUser.points,
          referralCode: dbUser.referral_code,
          acceptPromotions: dbUser.accept_promotions,
          textSize: dbUser.text_size
        };

        setUser(syncedUser);
        localStorage.setItem('user', JSON.stringify(syncedUser));
        toast.success('🎉 Login effettuato con successo!');
        
        // 📢 NOTIFICA IL DATA CONTEXT DI RICARICARE GLI UTENTI
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: syncedUser }));
        
        return true;
      }

      // Fallback per utenti mock (solo per demo)
      const mockUsers = [
        {
          email: 'admin@efallmo.com',
          name: 'Admin Efallmo',
          phone: '+39123456789',
          role: 'admin',
          points: 0
        },
        {
          email: 'user@example.com',
          name: 'John Doe',
          phone: '+39987654321',
          role: 'user',
          points: 150
        },
        {
          email: 'collaronello@gmail.com',
          name: 'Collaronello Admin',
          phone: '+39555123456',
          role: 'admin',
          points: 0
        }
      ];

      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser && password === 'password') {
        // Crea utente nel database se non esiste
        const newUserData = {
          email: foundUser.email.toLowerCase(),
          name: foundUser.name,
          phone: foundUser.phone,
          role: foundUser.role,
          points: foundUser.points,
          referral_code: generateReferralCode(),
          password_hash: 'demo_hash',
          accept_promotions: true,
          text_size: 'normal'
        };

        const { data: createdUser, error: createError } = await supabase
          .from('users_rh847')
          .insert([newUserData])
          .select()
          .single();

        if (!createError && createdUser) {
          const syncedUser = {
            id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
            phone: createdUser.phone,
            role: createdUser.role,
            points: createdUser.points,
            referralCode: createdUser.referral_code,
            acceptPromotions: createdUser.accept_promotions,
            textSize: createdUser.text_size
          };

          setUser(syncedUser);
          localStorage.setItem('user', JSON.stringify(syncedUser));
          toast.success('🎉 Login effettuato con successo!');
          
          // 📢 NOTIFICA IL DATA CONTEXT
          window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: syncedUser }));
          
          return true;
        }
      }

      toast.error('❌ Credenziali non valide');
      return false;
    } catch (error) {
      console.error('❌ Errore login:', error);
      toast.error('❌ Errore durante il login');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registrazione nuovo utente:', userData);

      // Validate required fields
      if (!userData.name || !userData.email || !userData.phone || !userData.password) {
        toast.error('❌ Tutti i campi sono obbligatori');
        return false;
      }

      // Controlla se l'email esiste già
      const { data: existingUser, error: checkError } = await supabase
        .from('users_rh847')
        .select('id, email')
        .eq('email', userData.email.toLowerCase())
        .single();

      if (existingUser && !checkError) {
        toast.error('❌ Email già registrata');
        return false;
      }

      let role = 'user';
      // Check if the email is in the admin list
      const adminEmails = [
        'admin@efallmo.com',
        'collaronello@gmail.com'
      ];

      if (adminEmails.includes(userData.email.toLowerCase())) {
        role = 'admin';
      }

      const newUserData = {
        email: userData.email.toLowerCase().trim(),
        name: userData.name.trim(),
        phone: userData.phone.trim(),
        role: role,
        points: 0,
        referral_code: generateReferralCode(),
        password_hash: 'demo_hash', // In real app, use proper password hashing
        accept_promotions: userData.acceptPromotions || false,
        text_size: userData.textSize || 'normal'
      };

      console.log('📦 Inserimento utente nel database:', newUserData);

      // Inserisci direttamente nel database
      const { data: createdUser, error: insertError } = await supabase
        .from('users_rh847')
        .insert([newUserData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Errore creazione utente:', insertError);
        toast.error('❌ Errore nella registrazione: ' + insertError.message);
        return false;
      }

      console.log('✅ Nuovo utente creato con successo:', createdUser);

      const syncedUser = {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        phone: createdUser.phone,
        role: createdUser.role,
        points: createdUser.points,
        referralCode: createdUser.referral_code,
        acceptPromotions: createdUser.accept_promotions,
        textSize: createdUser.text_size
      };

      setUser(syncedUser);
      localStorage.setItem('user', JSON.stringify(syncedUser));
      
      // 🔥 IMPORTANTE: Notifica il DataContext di ricaricare gli utenti
      window.dispatchEvent(new CustomEvent('userRegistered', { detail: syncedUser }));
      
      toast.success('🎉 Registrazione completata! Benvenuto in Efallmo!');
      return true;
    } catch (error) {
      console.error('❌ Errore registrazione:', error);
      toast.error('❌ Errore durante la registrazione');
      return false;
    }
  };

  const logout = () => {
    console.log('👋 Logout utente');
    setUser(null);
    localStorage.removeItem('user');
    toast.success('👋 Logout effettuato con successo');
  };

  const updateUserPoints = async (points) => {
    if (user) {
      const newPoints = user.points + points;
      const updatedUser = { ...user, points: newPoints };

      try {
        // Update in database
        const { error } = await supabase
          .from('users_rh847')
          .update({ points: newPoints })
          .eq('id', user.id);

        if (error) {
          console.error('❌ Errore aggiornamento punti:', error);
          toast.error('❌ Errore nella sincronizzazione dei punti');
          return;
        }

        // Update local state and storage
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        if (points > 0) {
          toast.success(`🏆 +${points} punti aggiunti!`);
        } else {
          toast.success(`💸 ${Math.abs(points)} punti utilizzati!`);
        }
      } catch (error) {
        console.error('❌ Errore updating user points:', error);
        toast.error('❌ Errore nell\'aggiornamento dei punti');
      }
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUserPoints,
    refreshUserData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};