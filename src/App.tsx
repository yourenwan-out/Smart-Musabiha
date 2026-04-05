import { useState, useEffect, useCallback, useRef } from 'react';
import 'regenerator-runtime/runtime';
import { Settings, Edit3, RotateCcw } from 'lucide-react';

import { Dhikr, RecognitionMode } from './types';
import { normalizeArabic } from './utils/arabicUtils';
import { muteAudio, unmuteAudio, isNativePlatform, forceUnmuteAudio } from './utils/capacitorUtils';

// Hooks
import { useDhikrState } from './hooks/useDhikrState';
import { useWakeLock } from './hooks/useWakeLock';
import { useEngineManager } from './hooks/useEngineManager';
import { useVoskEngine } from './hooks/useVoskEngine';
import { useGoogleSpeech } from './hooks/useGoogleSpeech';

// Components
import { DhikrCard } from './components/DhikrCard';
import { TotalCountCard } from './components/TotalCountCard';
import { VoiceController } from './components/VoiceController';
import { SettingsModal } from './components/Modals/SettingsModal';
import { CustomizationModal } from './components/Modals/CustomizationModal';
import { EditDhikrModal } from './components/Modals/EditDhikrModal';
import { ResetConfirmModal } from './components/Modals/ResetConfirmModal';
import { PermissionErrorModal } from './components/Modals/PermissionErrorModal';
import { AnimatePresence } from 'motion/react';

// Main App Colors Array
const colors = ['#2DD4BF', '#FACC15', '#34D399', '#38BDF8', '#F87171', '#A78BFA', '#FB923C', '#F472B6'];

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as any) || 'system';
  });

  const [developerMode, setDeveloperMode] = useState(() => localStorage.getItem('developerMode') === 'true');
  const [vibrationEnabled, setVibrationEnabled] = useState(() => localStorage.getItem('vibrationEnabled') !== 'false');

  // Modals & UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [editingDhikr, setEditingDhikr] = useState<Dhikr | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Core Hooks
  const { dhikrs, handleIncrement, handleReset, handleResetSingle, deleteDhikr, saveDhikr, resetToDefault, totalCount } = useDhikrState(vibrationEnabled);
  const { activeEngine, setActiveEngine, isOnline, recognitionMode, setRecognitionMode, determineTargetEngine } = useEngineManager();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  // Speech State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState({
    status: 'متوقف',
    lastEvent: 'لا يوجد',
    hasSound: false,
    hasSpeech: false
  });

  // Transcript refs to avoid stale closures in listeners
  const lastProcessedTextRef = useRef('');
  const sessionCountsRef = useRef<Record<string, number>>({});
  const lastResultsLengthRef = useRef(0);
  const lastCountTimeRef = useRef<Record<string, number>>({});
  const unmuteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const dhikrsRef = useRef(dhikrs);
  useEffect(() => {
    dhikrsRef.current = dhikrs;
  }, [dhikrs]);

  const addToLog = useCallback((msg: string) => {
    setDebugLog(prev => [new Date().toLocaleTimeString() + ': ' + msg, ...prev].slice(0, 15));
  }, []);

  const processTranscript = useCallback((text: string, source: string) => {
    const normalized = normalizeArabic(text);
    if (!normalized) return;

    if (normalized === lastProcessedTextRef.current) return;
    lastProcessedTextRef.current = normalized;

    const now = Date.now();
    const COOLDOWN = 800;

    addToLog(`🎤 ${source}: ${text.slice(-20)}...`);
    
    dhikrsRef.current.forEach(dhikr => {
      const keywords = [dhikr.text, ...dhikr.keywords];
      let maxMatchesInCurrent = 0;

      keywords.forEach(kw => {
        const normKw = normalizeArabic(kw);
        if (!normKw || normKw.length < 2) return;
        const flexibleKw = normKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
        const regex = new RegExp(`(^|\\s)${flexibleKw}(\\s|$)`, 'g');
        const matches = (normalized.match(regex) || []).length;
        if (matches > maxMatchesInCurrent) maxMatchesInCurrent = matches;
      });

      const previousMax = sessionCountsRef.current[dhikr.id] || 0;
      
      if (maxMatchesInCurrent > previousMax) {
        const lastTime = lastCountTimeRef.current[dhikr.id] || 0;
        sessionCountsRef.current[dhikr.id] = maxMatchesInCurrent;
        if (now - lastTime > COOLDOWN) {
          handleIncrement(dhikr.id);
          addToLog(`✨ تم عد: ${dhikr.text}`);
          lastCountTimeRef.current[dhikr.id] = now;
        }
      }
    });
  }, [handleIncrement, addToLog]);

  const stopListening = useCallback((immediate = false) => {
    setIsListening(false);
    const shouldMute = isNativePlatform() && (recognitionMode === 'google' || (recognitionMode === 'auto' && isOnline));
    if (shouldMute) {
      if (unmuteTimeoutRef.current) clearTimeout(unmuteTimeoutRef.current);
      if (immediate) {
        forceUnmuteAudio();
      } else {
        unmuteTimeoutRef.current = setTimeout(() => { unmuteAudio(); }, 1500);
      }
    }
    releaseWakeLock();
  }, [recognitionMode, isOnline, releaseWakeLock]);

  const startListening = useCallback(() => {
    setIsListening(true);
    const shouldMute = isNativePlatform() && (recognitionMode === 'google' || (recognitionMode === 'auto' && isOnline));
    if (shouldMute) {
      if (unmuteTimeoutRef.current) clearTimeout(unmuteTimeoutRef.current);
      muteAudio();
    }
    requestWakeLock(addToLog);
  }, [recognitionMode, isOnline, requestWakeLock, addToLog]);

  // Fail-safe cleanup
  useEffect(() => {
    const handleBeforeUnload = () => forceUnmuteAudio();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      if (isNativePlatform() && unmuteTimeoutRef.current) clearTimeout(unmuteTimeoutRef.current);
      forceUnmuteAudio();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Initialize Engines
  const { recognitionRef } = useGoogleSpeech({
    isListening, activeEngine, setActiveEngine, setTranscript, setInterimTranscript, 
    processTranscript, addToLog, setDebugInfo, lastResultsLengthRef, sessionCountsRef, lastProcessedTextRef
  });

  const { modelLoading, modelProgress, modelReady, initVoskModel, audioContextRef, processorRef, recognizerRef, streamRef } = useVoskEngine({
    isListening, activeEngine, setActiveEngine, dhikrs, processTranscript, setTranscript, 
    setInterimTranscript, addToLog, setDebugInfo, stopListening
  });

  // Theme Sync
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: string) => {
      root.classList.remove('light', 'dark');
      if (t === 'system') {
        if (!window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('light');
      } else if (t === 'light') {
        root.classList.add('light');
      }
    };
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Keep-alive/Engine Switching
  useEffect(() => {
    if (!isListening) {
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e){} }
      if (processorRef.current) processorRef.current.disconnect();
      if (recognizerRef.current) { try { recognizerRef.current.remove(); } catch(e){} }
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      setActiveEngine(null);
      setDebugInfo(prev => ({ ...prev, status: 'متوقف', lastEvent: 'stop_all' }));
      return;
    }
    const targetEngine = determineTargetEngine();
    if (targetEngine !== activeEngine) {
      if (targetEngine === 'vosk' && !modelReady && !modelLoading) {
         initVoskModel();
      } else if (targetEngine === 'google') {
         setActiveEngine('google');
      }
    }
  }, [isListening, isOnline, recognitionMode, determineTargetEngine, activeEngine, modelReady, modelLoading, initVoskModel]);

  const testMicrophone = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, lastEvent: 'جاري اختبار الميكروفون...' }));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setDebugInfo(prev => ({ ...prev, lastEvent: '✅ الميكروفون يعمل', hasSound: true }));
      stream.getTracks().forEach(t => t.stop());
    } catch (err: any) {
      setDebugInfo(prev => ({ ...prev, lastEvent: `❌ خطأ: ${err.message}` }));
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
      setInterimTranscript(''); setTranscript('');
      lastProcessedTextRef.current = ''; sessionCountsRef.current = {}; lastResultsLengthRef.current = 0;
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      if (isNativePlatform()) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          setShowPermissionError(true);
          return;
        }
      }
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      
      const willUseVosk = recognitionMode === 'vosk' || (recognitionMode === 'auto' && !isOnline);
      if (willUseVosk && !modelReady) {
        initVoskModel();
      }
      
      startListening();
      setTranscript(''); setInterimTranscript('');
      lastProcessedTextRef.current = ''; sessionCountsRef.current = {}; lastResultsLengthRef.current = 0;
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans flex flex-col p-6 pb-[calc(8rem+env(safe-area-inset-bottom))] dir-rtl" dir="rtl">
      
      <header className="sticky top-0 z-50 bg-app-bg/90 backdrop-blur-md flex items-center justify-between gap-4 py-4 -mx-6 px-6 mb-10">
        <div className="flex-1 flex justify-start">
          <button className="w-10 h-10 bg-app-card/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-app-border text-app-text text-[10px] font-bold hover:bg-app-card/60 transition-all">
            ادعمنا
          </button>
        </div>
        <div className="bg-app-card/40 px-7 py-3.5 rounded-xl border border-app-border backdrop-blur-md shadow-lg">
          <h1 className="text-gold text-xs font-bold tracking-tight text-center leading-tight">المسبحة الصوتية الذكية</h1>
        </div>
        <div className="flex-1 flex justify-end">
          <button onClick={() => setShowSettings(true)} className="w-10 h-10 bg-app-card/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-app-border text-gray-400 hover:bg-app-card/60 hover:text-app-text transition-all">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <TotalCountCard 
        totalCount={totalCount} isListening={isListening} showDebug={showDebug} 
        debugInfo={debugInfo} interimTranscript={interimTranscript} transcript={transcript} 
        debugLog={debugLog} onTestMicrophone={testMicrophone} onClearLog={() => setDebugLog([])} 
        onForceStop={() => { stopListening(true); }} 
      />

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pb-32">
        {dhikrs.map(dhikr => (
          <DhikrCard 
            key={dhikr.id} dhikr={dhikr} 
            onIncrement={handleIncrement} onReset={handleResetSingle} 
            onContextMenu={(d) => { setIsAddingNew(false); setEditingDhikr(d); }} 
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 pb-[calc(4rem+env(safe-area-inset-bottom))] flex justify-between items-center bg-gradient-to-t from-app-bg via-app-bg/90 to-transparent">
        <button onClick={() => setShowCustomization(true)} className="w-14 h-14 bg-app-card rounded-2xl flex items-center justify-center border border-app-border text-gray-400 hover:text-app-text transition-all">
          <Edit3 size={24} />
        </button>
        
        <VoiceController 
          isListening={isListening} modelLoading={modelLoading} modelProgress={modelProgress}
          recognitionMode={recognitionMode} activeEngine={activeEngine} toggleListening={toggleListening}
        />

        <button onClick={() => setShowResetConfirm(true)} className="w-14 h-14 bg-app-card rounded-2xl flex items-center justify-center border border-app-border text-gray-400 hover:text-app-text transition-all">
          <RotateCcw size={24} />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)} theme={theme} setTheme={setTheme}
            recognitionMode={recognitionMode} setRecognitionMode={setRecognitionMode}
            developerMode={developerMode} setDeveloperMode={(val) => {
              setDeveloperMode(val); localStorage.setItem('developerMode', String(val));
            }}
            vibrationEnabled={vibrationEnabled} setVibrationEnabled={(val) => {
              setVibrationEnabled(val); localStorage.setItem('vibrationEnabled', String(val));
            }}
            setShowDebug={setShowDebug}
          />
        )}
        
        {showCustomization && (
          <CustomizationModal 
            onClose={() => setShowCustomization(false)} dhikrs={dhikrs} onDelete={deleteDhikr}
            onEdit={(d) => { setIsAddingNew(false); setEditingDhikr(d); }}
            onAddNew={() => {
              setIsAddingNew(true);
              setEditingDhikr({ id: Date.now().toString(), text: '', count: 0, target: 33, color: colors[0], keywords: [] });
            }}
            onResetToDefault={resetToDefault}
          />
        )}

        {editingDhikr && (
          <EditDhikrModal 
            editingDhikr={editingDhikr} isAddingNew={isAddingNew} colors={colors} setEditingDhikr={setEditingDhikr}
            onClose={() => setEditingDhikr(null)}
            onSave={() => {
              const baseText = editingDhikr.text.trim();
              const words = baseText.split(/\s+/);
              const keywords = Array.from(new Set([
                baseText, ...words, baseText.replace(/\\s+/g, ''), baseText.replace(/ة/g, 'ه'), baseText.replace(/ه/g, 'ة'), baseText.replace(/[أإآ]/g, 'ا')
              ])).filter(k => k.length > 1);
              saveDhikr({ ...editingDhikr, text: baseText, keywords }, isAddingNew);
              setEditingDhikr(null); setIsAddingNew(false);
            }}
          />
        )}

        {showResetConfirm && <ResetConfirmModal onConfirm={() => { handleReset(); setShowResetConfirm(false); }} onCancel={() => setShowResetConfirm(false)} />}
        
        {showPermissionError && <PermissionErrorModal onClose={() => setShowPermissionError(false)} />}
      </AnimatePresence>
    </div>
  );
}
