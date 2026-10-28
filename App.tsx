import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'HisabPro — Your Money, In Control.';

      // Enforce mobile-responsive viewport meta tag
      let metaViewport = document.querySelector('meta[name="viewport"]');
      if (!metaViewport) {
        metaViewport = document.createElement('meta');
        metaViewport.setAttribute('name', 'viewport');
        document.head.appendChild(metaViewport);
      }
      metaViewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );

      const styleId = 'hisabpro-web-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          html, body {
            width: 100%;
            max-width: 100vw;
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #0B0F11;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden !important;
            overscroll-behavior-x: none !important;
            touch-action: pan-y !important;
            -webkit-text-size-adjust: 100%;
          }
          #root {
            width: 100%;
            max-width: 100vw;
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow-x: hidden !important;
            overscroll-behavior-x: none !important;
            touch-action: pan-y !important;
          }
          * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.15);
          }
          ::-webkit-scrollbar-thumb {
            background: #2E3545;
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #FF7A00;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
