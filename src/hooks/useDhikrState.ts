import { useState, useCallback, useRef } from 'react';
import { Dhikr, INITIAL_DHIKRS } from '../types';

export const useDhikrState = (vibrationEnabled: boolean) => {
  const [dhikrs, setDhikrs] = useState<Dhikr[]>(() => {
    const saved = localStorage.getItem('dhikrs');
    return saved ? JSON.parse(saved) : INITIAL_DHIKRS;
  });

  const handleIncrement = useCallback((id: string) => {
    setDhikrs(prev => prev.map(d => {
      if (d.id === id) {
        if (d.count >= 99999999) return d;
        if (vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
        return { ...d, count: d.count + 1, lastIncrement: Date.now() };
      }
      return d;
    }));
  }, [vibrationEnabled]);

  const handleReset = useCallback(() => {
    setDhikrs(prev => prev.map(d => ({ ...d, count: 0 })));
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  }, []);

  const handleResetSingle = useCallback((id: string) => {
    setDhikrs(prev => prev.map(d => d.id === id ? { ...d, count: 0 } : d));
    if (navigator.vibrate) navigator.vibrate(50);
  }, []);

  const deleteDhikr = useCallback((id: string) => {
    setDhikrs(prev => prev.filter(d => d.id !== id));
  }, []);

  const saveDhikr = useCallback((dhikr: Dhikr, isNew: boolean) => {
    if (isNew) {
      setDhikrs(prev => [...prev, dhikr]);
    } else {
      setDhikrs(prev => prev.map(d => d.id === dhikr.id ? dhikr : d));
    }
  }, []);

  const resetToDefault = useCallback(() => {
    setDhikrs(INITIAL_DHIKRS);
  }, []);

  const totalCount = dhikrs.reduce((acc, d) => acc + d.count, 0);

  return {
    dhikrs,
    setDhikrs,
    handleIncrement,
    handleReset,
    handleResetSingle,
    deleteDhikr,
    saveDhikr,
    resetToDefault,
    totalCount
  };
};
