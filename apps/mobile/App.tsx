import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppContent from './src/App';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
