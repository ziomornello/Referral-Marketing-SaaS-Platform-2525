import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('normal');
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('ui-theme') || 'light';
    const savedFontSize = localStorage.getItem('ui-font-size') || 'normal';
    const savedCompactMode = localStorage.getItem('ui-compact-mode') === 'true';

    console.log('Loading UI settings:', { savedTheme, savedFontSize, savedCompactMode });

    setTheme(savedTheme);
    setFontSize(savedFontSize);
    setCompactMode(savedCompactMode);

    // Apply theme to document
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const updateTheme = (newTheme) => {
    console.log('Updating theme to:', newTheme);
    setTheme(newTheme);
    localStorage.setItem('ui-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const updateFontSize = (newSize) => {
    console.log('Updating font size to:', newSize);
    setFontSize(newSize);
    localStorage.setItem('ui-font-size', newSize);
  };

  const updateCompactMode = (isCompact) => {
    console.log('Updating compact mode to:', isCompact);
    setCompactMode(isCompact);
    localStorage.setItem('ui-compact-mode', isCompact.toString());
  };

  const getFontSizeClasses = () => {
    const classes = {
      small: {
        text: 'text-xs',
        title: 'text-sm',
        heading: 'text-lg',
        display: 'text-xl'
      },
      normal: {
        text: 'text-sm',
        title: 'text-base',
        heading: 'text-xl',
        display: 'text-2xl'
      },
      large: {
        text: 'text-base',
        title: 'text-lg',
        heading: 'text-2xl',
        display: 'text-3xl'
      }
    };
    return classes[fontSize] || classes.normal;
  };

  const value = {
    theme,
    fontSize,
    compactMode,
    updateTheme,
    updateFontSize,
    updateCompactMode,
    getFontSizeClasses
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};