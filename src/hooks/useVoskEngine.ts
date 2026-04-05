import { useRef, useCallback, useState, useEffect } from 'react';
import { createModel } from 'vosk-browser';
import { Dhikr } from '../types';

interface UseVoskEngineProps {
  isListening: boolean;
  activeEngine: 'google' | 'vosk' | null;
  setActiveEngine: (engine: 'google' | 'vosk') => void;
  dhikrs: Dhikr[];
  processTranscript: (text: string, source: string) => void;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  setInterimTranscript: React.Dispatch<React.SetStateAction<string>>;
  addToLog: (msg: string) => void;
  setDebugInfo: React.Dispatch<React.SetStateAction<any>>;
  stopListening: (immediate?: boolean) => void;
}

export const useVoskEngine = ({
  isListening,
  activeEngine,
  setActiveEngine,
  dhikrs,
  processTranscript,
  setTranscript,
  setInterimTranscript,
  addToLog,
  setDebugInfo,
  stopListening,
}: UseVoskEngineProps) => {
  const [modelLoading, setModelLoading] = useState(false);
  const [modelProgress, setModelProgress] = useState(0); // Optional, kept for compatibility
  const [modelReady, setModelReady] = useState(false);
  
  const modelRef = useRef<any>(null);
  const recognizerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const initVoskModel = useCallback(async () => {
    if (modelReady || modelLoading) return;
    
    try {
      setModelLoading(true);
      addToLog('🔄 جاري بدء محرك "بدون إنترنت"...');
      
      // We pass the URL string directly, which avoids fetching into RAM array buffers manually.
      // vosk-browser will fetch it internally and pass it to WASM.
      const modelUrl = '/vosk-model-small-ar-0.3.tar.gz';
      
      // Simulate generic progress to keep UI happy if needed
      setModelProgress(50);
      
      const model = await createModel(modelUrl);
      
      modelRef.current = model;
      setModelReady(true);
      setModelLoading(false);
      setModelProgress(100);
      addToLog('✅ محرك "بدون إنترنت" جاهز');
      
      if (isListening) {
        setActiveEngine('vosk');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        addToLog('⏹️ تم إلغاء تحميل المحرك');
      } else {
        addToLog(`❌ خطأ في محرك "بدون إنترنت": ${err.message}`);
      }
      setModelLoading(false);
      setModelProgress(0);
      stopListening(true);
    }
  }, [modelReady, modelLoading, isListening, addToLog, setActiveEngine, stopListening]);

  useEffect(() => {
    const startVosk = async () => {
      if (!modelRef.current || activeEngine !== 'vosk' || recognizerRef.current) return;
      try {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        // Resume audio context if suspended (crucial for iOS/Safari)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const source = audioContextRef.current.createMediaStreamSource(stream);
        
        const allKeywords = dhikrs.flatMap(d => [d.text, ...d.keywords]);
        const uniqueWords = Array.from(new Set(allKeywords.flatMap(k => k.split(/\s+/))));
        const grammar = JSON.stringify([...allKeywords, ...uniqueWords, "[unk]"]);
        
        const recognizer = new modelRef.current.KaldiRecognizer(audioContextRef.current.sampleRate, grammar);
        recognizerRef.current = recognizer;
        
        recognizer.on('result', (message: any) => {
          if (message.result?.text) {
            setTranscript(prev => {
              const newFull = (prev + ' ' + message.result.text).trim();
              processTranscript(newFull, 'بدون إنترنت');
              return newFull;
            });
            setInterimTranscript('');
          }
        });
        
        recognizer.on('partialresult', (message: any) => {
          if (message.result?.partial) {
            setInterimTranscript(message.result.partial);
            setTranscript(prev => {
              const newFull = (prev + ' ' + message.result.partial).trim();
              processTranscript(newFull, 'بدون إنترنت (P)');
              return prev;
            });
          }
        });

        // Use standard buffer size depending on device capability
        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        processor.onaudioprocess = (event) => {
          if (activeEngine === 'vosk' && recognizerRef.current) {
            recognizerRef.current.acceptWaveform(event.inputBuffer.getChannelData(0));
          }
        };
        source.connect(processor);
        processor.connect(audioContextRef.current.destination);
        setDebugInfo((prev: any) => ({ ...prev, status: 'نشط (بدون إنترنت)', lastEvent: 'vosk_started' }));
        addToLog('✅ محرك "بدون إنترنت" بدأ العمل');
      } catch (err: any) {
        addToLog(`❌ خطأ تشغيل محرك "بدون إنترنت": ${err.message}`);
        stopListening(true);
      }
    };

    if (isListening && activeEngine === 'vosk' && modelReady) {
      startVosk();
    }

    return () => {
      // Cleanup effect for vosk when it should stop running (on unmount or engine change)
      if (activeEngine === 'vosk') {
        if (processorRef.current) {
          processorRef.current.disconnect();
          processorRef.current = null;
        }
        if (recognizerRef.current) {
          try { recognizerRef.current.remove(); } catch (e) {}
          recognizerRef.current = null;
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    };
  }, [isListening, activeEngine, modelReady, processTranscript, setTranscript, setInterimTranscript, dhikrs, addToLog, setDebugInfo, stopListening]);

  return {
    modelLoading,
    modelReady,
    modelProgress,
    initVoskModel,
    audioContextRef,
    processorRef,
    recognizerRef,
    streamRef,
  };
};
