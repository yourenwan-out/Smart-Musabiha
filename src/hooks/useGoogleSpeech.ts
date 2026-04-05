import { useEffect, useRef } from 'react';

interface UseGoogleSpeechProps {
  isListening: boolean;
  activeEngine: 'google' | 'vosk' | null;
  setActiveEngine: (engine: 'google' | 'vosk') => void;
  setTranscript: (t: string) => void;
  setInterimTranscript: (t: string) => void;
  processTranscript: (text: string, source: string) => void;
  addToLog: (msg: string) => void;
  setDebugInfo: React.Dispatch<React.SetStateAction<any>>;
  lastResultsLengthRef: React.MutableRefObject<number>;
  sessionCountsRef: React.MutableRefObject<Record<string, number>>;
  lastProcessedTextRef: React.MutableRefObject<string>;
}

export const useGoogleSpeech = ({
  isListening,
  activeEngine,
  setActiveEngine,
  setTranscript,
  setInterimTranscript,
  processTranscript,
  addToLog,
  setDebugInfo,
  lastResultsLengthRef,
  sessionCountsRef,
  lastProcessedTextRef
}: UseGoogleSpeechProps) => {

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening && activeEngine === 'google') {
      if (recognitionRef.current) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';
      
      recognition.onstart = () => {
        setDebugInfo((prev: any) => ({ ...prev, status: 'نشط (بإنترنت)', lastEvent: 'google_start' }));
        addToLog('✅ محرك "بإنترنت" بدأ العمل');
        setActiveEngine('google');
      };

      recognition.onend = () => {
        if (isListening && activeEngine === 'google' && recognitionRef.current === recognition) {
          addToLog('🔄 إعادة تشغيل محرك "بإنترنت"...');
          try { 
            recognition.start(); 
          } catch (e) {
            setTimeout(() => {
              if (isListening && activeEngine === 'google' && recognitionRef.current === recognition) {
                try { recognition.start(); } catch (err) {}
              }
            }, 1000);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'aborted') return;
        addToLog(`❌ خطأ في محرك "بإنترنت": ${event.error}`);
        if (event.error === 'network') {
          addToLog('📡 فشل الاتصال.. جاري التحويل لمحرك "بدون إنترنت"');
        }
      };

      recognition.onresult = (event: any) => {
        if (event.results.length < lastResultsLengthRef.current) {
          sessionCountsRef.current = {};
          lastProcessedTextRef.current = '';
        }
        lastResultsLengthRef.current = event.results.length;

        let fullTranscript = '';
        let currentInterim = '';
        for (let i = 0; i < event.results.length; ++i) {
          const part = event.results[i][0].transcript;
          fullTranscript += (i > 0 ? ' ' : '') + part;
          if (!event.results[i].isFinal) currentInterim += (currentInterim ? ' ' : '') + part;
        }
        setTranscript(fullTranscript);
        setInterimTranscript(currentInterim);
        processTranscript(fullTranscript, 'بإنترنت');
      };

      recognitionRef.current = recognition;
      
      const startTimeout = setTimeout(() => {
        if (isListening && activeEngine === 'google' && recognitionRef.current === recognition) {
          try { 
            recognition.start(); 
          } catch (e: any) {
            addToLog(`❌ فشل تشغيل محرك "بإنترنت": ${e.message}`);
          }
        }
      }, 100);

      return () => clearTimeout(startTimeout);
    }

    return () => {
      if (recognitionRef.current) {
        try { 
          recognitionRef.current.onend = null;
          recognitionRef.current.stop(); 
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, [isListening, activeEngine, processTranscript, setActiveEngine, setTranscript, setInterimTranscript, addToLog, setDebugInfo, lastResultsLengthRef, sessionCountsRef, lastProcessedTextRef]);

  return { recognitionRef };
};
