import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AppCustomizationContext = createContext();

export const useAppCustomization = () => {
  const context = useContext(AppCustomizationContext);
  if (!context) {
    throw new Error('useAppCustomization must be used within an AppCustomizationProvider');
  }
  return context;
};

export const AppCustomizationProvider = ({ children }) => {
  const [customization, setCustomization] = useState({
    // Logo settings
    logoUrl: '',
    logoText: 'Efallmo',
    faviconUrl: '',
    
    // Color scheme
    primaryColor: '#7c3aed', // purple-600
    secondaryColor: '#ec4899', // pink-500
    accentColor: '#f59e0b', // amber-500
    backgroundColor: '#f9fafb', // gray-50
    textColor: '#111827', // gray-900
    
    // Typography
    fontFamily: 'Inter',
    fontSize: 'normal',
    
    // Header customization
    headerTitle: 'Efallmo - Bonus e Referral',
    headerSubtitle: 'Guadagna con i migliori bonus',
    showHeaderGradient: true,
    
    // Dashboard customization
    welcomeMessage: 'Benvenuto nel mondo dei bonus!',
    showStats: true,
    showProgress: true,
    
    // Footer customization
    footerText: 'Powered by Efallmo',
    showFooter: true,
    
    // Advanced settings
    enableAnimations: true,
    compactMode: false,
    darkMode: false
  });

  // Load customization from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('app-customization');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomization(prev => ({ ...prev, ...parsed }));
        applyCustomization(parsed);
      } catch (error) {
        console.error('Error loading customization:', error);
      }
    }
  }, []);

  // Apply customization to document
  const applyCustomization = (config) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', config.primaryColor || customization.primaryColor);
    root.style.setProperty('--secondary-color', config.secondaryColor || customization.secondaryColor);
    root.style.setProperty('--accent-color', config.accentColor || customization.accentColor);
    root.style.setProperty('--background-color', config.backgroundColor || customization.backgroundColor);
    root.style.setProperty('--text-color', config.textColor || customization.textColor);
    
    // Apply font family
    if (config.fontFamily) {
      root.style.setProperty('--font-family', config.fontFamily);
    }
    
    // Apply dark mode
    if (config.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    // Update favicon if provided
    if (config.faviconUrl) {
      const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
      favicon.type = 'image/x-icon';
      favicon.rel = 'shortcut icon';
      favicon.href = config.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(favicon);
    }
    
    // Update page title
    if (config.headerTitle) {
      document.title = config.headerTitle;
    }
  };

  // Save customization
  const updateCustomization = (newConfig) => {
    const updatedConfig = { ...customization, ...newConfig };
    setCustomization(updatedConfig);
    localStorage.setItem('app-customization', JSON.stringify(updatedConfig));
    applyCustomization(updatedConfig);
    toast.success('✅ Personalizzazione salvata!');
  };

  // File upload handler for local files
  const handleFileUpload = (file, type) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Nessun file selezionato'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        
        // Store in localStorage with a key based on type and filename
        const storageKey = `uploaded-${type}-${Date.now()}`;
        localStorage.setItem(storageKey, dataUrl);
        
        resolve(dataUrl);
        toast.success(`📁 ${file.name} caricato con successo!`);
      };
      
      reader.onerror = () => {
        reject(new Error('Errore nel caricamento del file'));
        toast.error('❌ Errore nel caricamento del file');
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Reset to defaults
  const resetCustomization = () => {
    const defaultConfig = {
      logoUrl: '',
      logoText: 'Efallmo',
      faviconUrl: '',
      primaryColor: '#7c3aed',
      secondaryColor: '#ec4899',
      accentColor: '#f59e0b',
      backgroundColor: '#f9fafb',
      textColor: '#111827',
      fontFamily: 'Inter',
      fontSize: 'normal',
      headerTitle: 'Efallmo - Bonus e Referral',
      headerSubtitle: 'Guadagna con i migliori bonus',
      showHeaderGradient: true,
      welcomeMessage: 'Benvenuto nel mondo dei bonus!',
      showStats: true,
      showProgress: true,
      footerText: 'Powered by Efallmo',
      showFooter: true,
      enableAnimations: true,
      compactMode: false,
      darkMode: false
    };
    
    updateCustomization(defaultConfig);
    toast.success('🔄 Impostazioni ripristinate ai valori predefiniti');
  };

  const value = {
    customization,
    updateCustomization,
    handleFileUpload,
    resetCustomization,
    applyCustomization
  };

  return (
    <AppCustomizationContext.Provider value={value}>
      {children}
    </AppCustomizationContext.Provider>
  );
};