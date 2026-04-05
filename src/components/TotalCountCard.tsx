import { motion, AnimatePresence } from 'motion/react';
import { formatNumber } from '../utils/numberUtils';

interface DebugInfo {
  status: string;
  lastEvent: string;
  hasSound: boolean;
  hasSpeech: boolean;
}

interface TotalCountCardProps {
  totalCount: number;
  isListening: boolean;
  showDebug: boolean;
  debugInfo: DebugInfo;
  interimTranscript: string;
  transcript: string;
  debugLog: string[];
  onTestMicrophone: () => void;
  onClearLog: () => void;
  onForceStop: () => void;
}

export const TotalCountCard = ({
  totalCount,
  isListening,
  showDebug,
  debugInfo,
  interimTranscript,
  transcript,
  debugLog,
  onTestMicrophone,
  onClearLog,
  onForceStop
}: TotalCountCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-app-card to-app-bg/40 rounded-3xl p-8 mb-8 text-center border border-app-border dhikr-card-shadow relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gold/30 rounded-full blur-sm" />
      <p className="text-gray-400 text-sm mb-2">مجموع التسبيح</p>
      <motion.p 
        key={totalCount}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-6xl font-bold text-gold"
      >
        {formatNumber(totalCount)}
      </motion.p>
      
      <AnimatePresence>
        {isListening && showDebug && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex flex-col items-center gap-2 overflow-hidden"
          >
            <div className="bg-black/40 p-2 rounded-xl w-full text-[10px] text-white/40 font-mono text-center break-words border border-white/5">
              <p className="text-gold/30 mb-1">حالة المحرك: {debugInfo.status}</p>
              <p className="mb-1">آخر حدث: {debugInfo.lastEvent}</p>
              <p className="mb-1">صوت: {debugInfo.hasSound ? '✅' : '❌'} | كلام: {debugInfo.hasSpeech ? '✅' : '❌'}</p>
              <p className="text-white/60 border-t border-white/5 mt-1 pt-1">
                {interimTranscript || transcript || 'بانتظار صوتك...'}
              </p>
              <div className="mt-2 text-[8px] text-left space-y-1 max-h-24 overflow-y-auto bg-black/20 p-1 rounded">
                {debugLog.map((log, i) => (
                  <div key={i} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : ''}>
                    {log}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onTestMicrophone(); }}
                  className="flex-1 bg-app-card/60 px-2 py-1 rounded text-[8px] hover:bg-app-card/80"
                >
                  اختبار الميكروفون
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onClearLog(); }}
                  className="bg-app-card/60 px-2 py-1 rounded text-[8px] hover:bg-app-card/80"
                >
                  مسح السجل
                </button>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onForceStop(); }}
                className="w-full mt-2 bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded text-[8px] hover:bg-red-500/30"
              >
                إيقاف إجباري للمحرك
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
