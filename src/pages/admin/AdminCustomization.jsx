import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppCustomization } from '../../contexts/AppCustomizationContext';
import SafeIcon from '../../common/SafeIcon';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { 
  FiSettings, FiUpload, FiImage, FiType, FiPalette, FiMonitor, 
  FiSave, FiRotateCcw, FiEye, FiEyeOff, FiDownload, FiCamera 
} = FiIcons;

const AdminCustomization = () => {
  const { customization, updateCustomization, handleFileUpload, resetCustomization } = useAppCustomization();
  const [activeTab, setActiveTab] = useState('branding');
  const [previewMode, setPreviewMode] = useState(false);
  const [uploading, setUploading] = useState({});

  const tabs = [
    { id: 'branding', label: '🎨 Branding', icon: FiPalette },
    { id: 'colors', label: '🌈 Colori', icon: FiPalette },
    { id: 'typography', label: '📝 Tipografia', icon: FiType },
    { id: 'layout', label: '📐 Layout', icon: FiMonitor },
    { id: 'advanced', label: '⚙️ Avanzate', icon: FiSettings }
  ];

  const handleInputChange = (key, value) => {
    updateCustomization({ [key]: value });
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('❌ Seleziona solo file immagine');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('❌ File troppo grande (max 5MB)');
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const dataUrl = await handleFileUpload(file, type);
      updateCustomization({ [type]: dataUrl });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const colorPresets = [
    { name: 'Efallmo Classic', primary: '#7c3aed', secondary: '#ec4899', accent: '#f59e0b' },
    { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#06b6d4', accent: '#10b981' },
    { name: 'Forest Green', primary: '#059669', secondary: '#10b981', accent: '#f59e0b' },
    { name: 'Sunset Orange', primary: '#ea580c', secondary: '#dc2626', accent: '#f59e0b' },
    { name: 'Purple Dream', primary: '#9333ea', secondary: '#c026d3', accent: '#06b6d4' },
    { name: 'Minimalist Gray', primary: '#374151', secondary: '#6b7280', accent: '#3b82f6' }
  ];

  const fontOptions = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Nunito', value: 'Nunito, sans-serif' }
  ];

  const exportSettings = () => {
    const dataStr = JSON.stringify(customization, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'efallmo-customization.json';
    link.click();
    toast.success('📁 Impostazioni esportate!');
  };

  const importSettings = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        updateCustomization(imported);
        toast.success('📥 Impostazioni importate!');
      } catch (error) {
        toast.error('❌ File non valido');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎨 Personalizzazione Interfaccia
              </h1>
              <p className="text-gray-600">
                Personalizza completamente l'aspetto della tua piattaforma
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  previewMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SafeIcon icon={previewMode ? FiEyeOff : FiEye} className="text-sm" />
                <span>{previewMode ? 'Nascondi' : 'Anteprima'}</span>
              </button>
              <button
                onClick={exportSettings}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <SafeIcon icon={FiDownload} className="text-sm" />
                <span>Esporta</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <SafeIcon icon={tab.icon} className="text-lg" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={resetCustomization}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <SafeIcon icon={FiRotateCcw} className="text-sm" />
                  <span>Reset</span>
                </button>
                
                <label className="w-full flex items-center justify-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer">
                  <SafeIcon icon={FiUpload} className="text-sm" />
                  <span>Importa</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              
              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">🎨 Branding e Logo</h2>
                    
                    {/* Logo Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          📷 Logo Principale
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                          {customization.logoUrl ? (
                            <div className="space-y-3">
                              <img
                                src={customization.logoUrl}
                                alt="Logo"
                                className="w-24 h-24 object-contain mx-auto"
                              />
                              <p className="text-sm text-green-600">✅ Logo caricato</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <SafeIcon icon={FiImage} className="text-4xl text-gray-400 mx-auto" />
                              <p className="text-gray-500">Carica il tuo logo</p>
                            </div>
                          )}
                          <label className="mt-4 inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                            <SafeIcon icon={uploading.logoUrl ? FiSettings : FiUpload} 
                              className={`text-sm ${uploading.logoUrl ? 'animate-spin' : ''}`} />
                            <span>{uploading.logoUrl ? 'Caricamento...' : 'Seleziona File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'logoUrl')}
                              className="hidden"
                              disabled={uploading.logoUrl}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          🌟 Favicon
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                          {customization.faviconUrl ? (
                            <div className="space-y-3">
                              <img
                                src={customization.faviconUrl}
                                alt="Favicon"
                                className="w-12 h-12 object-contain mx-auto"
                              />
                              <p className="text-sm text-green-600">✅ Favicon caricato</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <SafeIcon icon={FiImage} className="text-4xl text-gray-400 mx-auto" />
                              <p className="text-gray-500">Carica favicon (32x32)</p>
                            </div>
                          )}
                          <label className="mt-4 inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                            <SafeIcon icon={uploading.faviconUrl ? FiSettings : FiUpload} 
                              className={`text-sm ${uploading.faviconUrl ? 'animate-spin' : ''}`} />
                            <span>{uploading.faviconUrl ? 'Caricamento...' : 'Seleziona File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'faviconUrl')}
                              className="hidden"
                              disabled={uploading.faviconUrl}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Text Settings */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📝 Testo Logo (se non hai logo)
                        </label>
                        <input
                          type="text"
                          value={customization.logoText}
                          onChange={(e) => handleInputChange('logoText', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Efallmo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🏷️ Titolo Header
                        </label>
                        <input
                          type="text"
                          value={customization.headerTitle}
                          onChange={(e) => handleInputChange('headerTitle', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Efallmo - Bonus e Referral"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📖 Sottotitolo Header
                        </label>
                        <input
                          type="text"
                          value={customization.headerSubtitle}
                          onChange={(e) => handleInputChange('headerSubtitle', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Guadagna con i migliori bonus"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">🌈 Schema Colori</h2>
                    
                    {/* Color Presets */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">🎨 Preset Colori</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {colorPresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => updateCustomization({
                              primaryColor: preset.primary,
                              secondaryColor: preset.secondary,
                              accentColor: preset.accent
                            })}
                            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors text-left"
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex space-x-1">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }}></div>
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }}></div>
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.accent }}></div>
                              </div>
                              <span className="font-medium text-gray-900">{preset.name}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {preset.primary} • {preset.secondary} • {preset.accent}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          🎯 Colore Primario
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={customization.primaryColor}
                            onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customization.primaryColor}
                            onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="#7c3aed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          🌸 Colore Secondario
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={customization.secondaryColor}
                            onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customization.secondaryColor}
                            onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="#ec4899"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          ⚡ Colore Accento
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={customization.accentColor}
                            onChange={(e) => handleInputChange('accentColor', e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customization.accentColor}
                            onChange={(e) => handleInputChange('accentColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="#f59e0b"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          🎨 Sfondo Principale
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={customization.backgroundColor}
                            onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customization.backgroundColor}
                            onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="#f9fafb"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Typography Tab */}
              {activeTab === 'typography' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">📝 Tipografia</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          🔤 Font Family
                        </label>
                        <select
                          value={customization.fontFamily}
                          onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          {fontOptions.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          📏 Dimensione Testo
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['small', 'normal', 'large'].map((size) => (
                            <button
                              key={size}
                              onClick={() => handleInputChange('fontSize', size)}
                              className={`p-3 border rounded-lg font-medium transition-colors ${
                                customization.fontSize === size
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-300 hover:border-purple-300'
                              }`}
                            >
                              {size === 'small' && '📝 Piccolo'}
                              {size === 'normal' && '📄 Normale'}
                              {size === 'large' && '📰 Grande'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Preview */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">👀 Anteprima Font</h3>
                        <div style={{ fontFamily: customization.fontFamily }}>
                          <h1 className="text-2xl font-bold mb-2">Titolo Principale</h1>
                          <h2 className="text-xl font-semibold mb-2">Sottotitolo</h2>
                          <p className="text-base mb-2">
                            Questo è un paragrafo di esempio per mostrare come apparirà il testo normale con il font selezionato.
                          </p>
                          <p className="text-sm text-gray-600">
                            Testo piccolo e descrizioni in questo stile.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Layout Tab */}
              {activeTab === 'layout' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">📐 Layout e Struttura</h2>
                    
                    <div className="space-y-6">
                      {/* Header Settings */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">🔝 Impostazioni Header</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showHeaderGradient"
                              checked={customization.showHeaderGradient}
                              onChange={(e) => handleInputChange('showHeaderGradient', e.target.checked)}
                              className="mr-3 w-4 h-4"
                            />
                            <label htmlFor="showHeaderGradient" className="text-sm font-medium text-gray-700">
                              🌈 Mostra sfumatura nell'header
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Dashboard Settings */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Dashboard</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              👋 Messaggio di Benvenuto
                            </label>
                            <input
                              type="text"
                              value={customization.welcomeMessage}
                              onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Benvenuto nel mondo dei bonus!"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showStats"
                              checked={customization.showStats}
                              onChange={(e) => handleInputChange('showStats', e.target.checked)}
                              className="mr-3 w-4 h-4"
                            />
                            <label htmlFor="showStats" className="text-sm font-medium text-gray-700">
                              📈 Mostra statistiche
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showProgress"
                              checked={customization.showProgress}
                              onChange={(e) => handleInputChange('showProgress', e.target.checked)}
                              className="mr-3 w-4 h-4"
                            />
                            <label htmlFor="showProgress" className="text-sm font-medium text-gray-700">
                              🎯 Mostra barra progresso
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Footer Settings */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">🔻 Footer</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showFooter"
                              checked={customization.showFooter}
                              onChange={(e) => handleInputChange('showFooter', e.target.checked)}
                              className="mr-3 w-4 h-4"
                            />
                            <label htmlFor="showFooter" className="text-sm font-medium text-gray-700">
                              👁️ Mostra footer
                            </label>
                          </div>

                          {customization.showFooter && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                📝 Testo Footer
                              </label>
                              <input
                                type="text"
                                value={customization.footerText}
                                onChange={(e) => handleInputChange('footerText', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                placeholder="Powered by Efallmo"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">⚙️ Impostazioni Avanzate</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">🎨 Comportamento UI</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="enableAnimations"
                              checked={customization.enableAnimations}
                              onChange={(e) => handleInputChange('enableAnimations', e.target.checked)}
                              className="mr-3 w-4 h-4"
                            />
                            <label htmlFor="enableAnimations" className="text-sm font-medium text-gray-700">
                              ✨ Abilita animazioni
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="compactMode"
                              checked={customization.compactMode}
                              onChange={(e) => handleInputChange('compactMode', e.target.checked)}
                              className="mr-3 w-4 h-4"
                            />
                            <label htmlFor="compactMode" className="text-sm font-medium text-gray-700">
                              📱 Modalità compatta
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="darkMode"
                              checked={customization.darkMode}
                              onChange={(e) => handleInputChange('darkMode', e.target.checked)}
                              className="mr-3 w-4 h-4"
                            />
                            <label htmlFor="darkMode" className="text-sm font-medium text-gray-700">
                              🌙 Modalità scura
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* CSS Custom Properties */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">🎨 CSS Variables</h3>
                        <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm">
                          <div>:root {`{`}</div>
                          <div>  --primary-color: {customization.primaryColor};</div>
                          <div>  --secondary-color: {customization.secondaryColor};</div>
                          <div>  --accent-color: {customization.accentColor};</div>
                          <div>  --background-color: {customization.backgroundColor};</div>
                          <div>  --font-family: {customization.fontFamily};</div>
                          <div>{`}`}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {previewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">👀 Anteprima Live</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div 
                className="min-h-[300px] rounded-lg p-6"
                style={{ 
                  backgroundColor: customization.backgroundColor,
                  fontFamily: customization.fontFamily,
                  color: customization.textColor
                }}
              >
                {/* Mock Header */}
                <div 
                  className={`p-4 rounded-lg mb-4 ${
                    customization.showHeaderGradient 
                      ? 'bg-gradient-to-r' 
                      : 'bg-gray-100'
                  }`}
                  style={{
                    background: customization.showHeaderGradient 
                      ? `linear-gradient(135deg, ${customization.primaryColor}, ${customization.secondaryColor})`
                      : customization.backgroundColor
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {customization.logoUrl ? (
                      <img src={customization.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: customization.primaryColor }}
                      >
                        E
                      </div>
                    )}
                    <div>
                      <h1 
                        className="text-lg font-bold"
                        style={{ 
                          color: customization.showHeaderGradient ? 'white' : customization.textColor 
                        }}
                      >
                        {customization.headerTitle}
                      </h1>
                      <p 
                        className="text-sm"
                        style={{ 
                          color: customization.showHeaderGradient ? 'rgba(255,255,255,0.8)' : customization.textColor 
                        }}
                      >
                        {customization.headerSubtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">{customization.welcomeMessage}</h2>
                  
                  {customization.showStats && (
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Punti', value: '150' },
                        { label: 'Completati', value: '3' },
                        { label: 'Disponibili', value: '7' }
                      ].map((stat, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <div 
                            className="text-2xl font-bold mb-1"
                            style={{ color: customization.primaryColor }}
                          >
                            {stat.value}
                          </div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {customization.showProgress && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progresso Generale</span>
                        <span>43%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            background: `linear-gradient(90deg, ${customization.primaryColor}, ${customization.secondaryColor})`,
                            width: '43%'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Mock Button */}
                  <button 
                    className="px-6 py-3 rounded-lg font-medium text-white"
                    style={{ backgroundColor: customization.primaryColor }}
                  >
                    Pulsante Esempio
                  </button>
                </div>

                {/* Mock Footer */}
                {customization.showFooter && (
                  <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">{customization.footerText}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomization;