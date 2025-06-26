import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX } = FiIcons;

const FullScreenGuide = ({ isOpen, onClose, title, content }) => {
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 🔥 FIX: Function to generate embed code from URL
  const generateEmbedCode = (input) => {
    if (!input) return '';

    // Check if input is a URL
    const urlPattern = /^https?:\/\//;
    if (urlPattern.test(input.trim())) {
      // Convert share URL to embed URL if needed
      let embedUrl = input.trim();
      
      // 🔥 FIX: Converti /share/ in /e/ per URL guide.efallmo.it
      if (embedUrl.includes('/share/')) {
        embedUrl = embedUrl.replace('/share/', '/e/');
      }
      
      // 🔥 FIX: Aggiungi /tour se non presente
      if (!embedUrl.includes('/tour')) {
        embedUrl = embedUrl.endsWith('/') ? embedUrl + 'tour' : embedUrl + '/tour';
      }

      // Generate FULL SCREEN responsive embed code
      return `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          background: #f8f9fa;
        ">
          <iframe 
            style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border: 0;
              margin: 0;
              padding: 0;
            " 
            src="${embedUrl}" 
            allowfullscreen 
            webkitallowfullscreen 
            mozallowfullscreen 
            allowtransparency 
            title="Guida Interattiva"
          ></iframe>
        </div>
      `;
    }

    // If it's already HTML/embed code, wrap it for fullscreen
    return `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        background: #f8f9fa;
        overflow: hidden;
      ">
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${input}
        </div>
      </div>
    `;
  };

  // Process content to make it TRULY fullscreen
  useEffect(() => {
    if (content) {
      const processContent = (htmlContent) => {
        // First, check if we need to generate embed code from URL
        const embedCode = generateEmbedCode(htmlContent);

        // Create a wrapper with ABSOLUTE fullscreen styles
        const fullscreenContent = `
          <!DOCTYPE html>
          <html style="margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                * {
                  margin: 0 !important;
                  padding: 0 !important;
                  box-sizing: border-box !important;
                }
                
                html, body {
                  width: 100% !important;
                  height: 100% !important;
                  overflow: hidden !important;
                  background: #f8f9fa !important;
                }
                
                /* Force fullscreen for any iframe container */
                div[style*="position: relative"][style*="padding-bottom"],
                .responsive-iframe-container {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  background: #f8f9fa !important;
                }
                
                /* Force fullscreen for iframes */
                iframe {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  border: 0 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  z-index: 1 !important;
                }
                
                /* Hide any UI elements that might interfere */
                .grid.grid-cols-3.justify-between.w-full.pl-2,
                .flex.flex-col.flex-wrap.w-full.justify-center.rounded-t-md.p-1,
                .browser-mockup,
                .device-frame {
                  display: none !important;
                }
                
                /* Ensure content containers are fullscreen */
                .flex.justify-center.items-center.relative,
                .flex.flex-col.flex-wrap.w-full.justify-center.place-content-center {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  transform: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                
                /* Remove any overlays or decorative elements */
                .flex.flex-col.select-none.object-cover.absolute.inset-0.z-50,
                .flex.flex-col.select-none.absolute.inset-0.z-50,
                .flex.flex-col.select-none.absolute.inset-0.z-40.opacity-70,
                .flex.flex-col.select-none.absolute.inset-0.z-40 {
                  display: none !important;
                }
                
                /* Mobile specific overrides */
                @media (max-width: 768px) {
                  /* Force mobile fullscreen */
                  div, iframe {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    transform: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  
                  /* Hide mobile UI chrome */
                  .jsx-883991502,
                  .jsx-172219232,
                  .jsx-1278013085,
                  button,
                  .phone-frame,
                  .mobile-chrome {
                    display: none !important;
                  }
                }
                
                /* Tablet overrides */
                @media (min-width: 769px) and (max-width: 1024px) {
                  div, iframe {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                  }
                }
                
                /* Desktop overrides */
                @media (min-width: 1025px) {
                  div, iframe {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                  }
                }
                
                /* Remove any blur or filter effects */
                .blur-\\[5px\\],
                [style*="blur"],
                [style*="filter"] {
                  filter: none !important;
                }
                
                /* Force visibility for main content */
                .flex.flex-col.w-full.h-full.justify-center.items-center {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  display: flex !important;
                  justify-content: center !important;
                  align-items: center !important;
                }
              </style>
            </head>
            <body style="margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;">
              ${embedCode}
            </body>
          </html>
        `;

        return fullscreenContent;
      };

      setProcessedContent(processContent(content));
    }
  }, [content]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
        style={{ zIndex: 9999 }}
      >
        <div className="relative w-full h-full">
          {/* Header - Fixed at top */}
          <div className="absolute top-0 left-0 right-0 bg-white shadow-lg z-[10000]">
            <div className="flex items-center justify-between p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate pr-4">
                {title}
              </h2>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Chiudi"
                >
                  <SafeIcon icon={FiX} className="text-lg" />
                </button>
              </div>
            </div>
          </div>

          {/* Content - TRULY fullscreen */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute inset-0"
            style={{
              top: '64px', // 64px = header height
              left: 0,
              right: 0,
              bottom: 0
            }}
          >
            <div className="w-full h-full">
              {/* FULLSCREEN iframe container */}
              <iframe
                srcDoc={processedContent}
                className="w-full h-full border-0"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  overflow: 'hidden',
                  background: '#f8f9fa'
                }}
                title={title}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullScreenGuide;