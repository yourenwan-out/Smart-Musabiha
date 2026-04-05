import { useState, useCallback, useEffect } from 'react';
import { RecognitionMode } from '../types';

export const useEngineManager = () => {
  const [activeEngine, setActiveEngine] = useState<'google' | 'vosk' | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [recognitionMode, setRecognitionMode] = useState<RecognitionMode>(() => {
    const saved = localStorage.getItem('recognitionMode');
    return (saved as RecognitionMode) || 'auto';
  });

  useEffect(() => {
    localStorage.setItem('recognitionMode', recognitionMode);
  }, [recognitionMode]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const determineTargetEngine = useCallback(() => {
    if (recognitionMode === 'google') return 'google';
    if (recognitionMode === 'vosk') return 'vosk';
    return isOnline ? 'google' : 'vosk';
  }, [recognitionMode, isOnline]);

  return {
    activeEngine,
    setActiveEngine,
    isOnline,
    setIsOnline,
    recognitionMode,
    setRecognitionMode,
    determineTargetEngine
  };
};
