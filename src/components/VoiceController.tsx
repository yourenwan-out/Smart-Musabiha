import { motion } from 'motion/react';
import { Loader2, Mic, Zap, Wifi, WifiOff } from 'lucide-react';
import { formatNumber } from '../utils/numberUtils';

interface VoiceControllerProps {
  isListening: boolean;
  modelLoading: boolean;
  modelProgress: number;
  recognitionMode: string;
  activeEngine: string | null;
  toggleListening: () => void;
}

export const VoiceController = ({
  isListening,
  modelLoading,
  modelProgress,
  recognitionMode,
  activeEngine,
  toggleListening
}: VoiceControllerProps) => {
  return (
    <div className="relative">
      <motion.button
        animate={isListening ? { 
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 0 0px rgba(250, 204, 21, 0.4)",
            "0 0 0 15px rgba(250, 204, 21, 0)",
            "0 0 0 0px rgba(250, 204, 21, 0)"
          ]
        } : {}}
        transition={isListening ? { 
          scale: { repeat: Infinity, duration: 2 },
          boxShadow: { repeat: Infinity, duration: 1.5 }
        } : {}}
        onClick={toggleListening}
        disabled={modelLoading}
        className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all relative overflow-hidden ${modelLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gold shadow-gold/20'}`}
      >
        {modelLoading ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <Loader2 className="text-white animate-spin mb-1" size={24} />
            <span className="text-[10px] font-bold text-white">{formatNumber(modelProgress)}%</span>
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" style={{ width: `${modelProgress}%` }} />
          </div>
        ) : isListening ? (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div 
                key={i}
                animate={{ height: ["10px", "30px", "10px"] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                className="w-1 bg-app-bg rounded-full"
              />
            ))}
          </div>
        ) : (
          <Mic className="text-dark-bg" size={32} />
        )}
      </motion.button>
      <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-400 flex items-center gap-2">
        {isListening ? (
          <>
            <span>جاري الاستماع</span>
            {recognitionMode === 'auto' ? (
              <Zap size={14} className="text-gold" />
            ) : activeEngine === 'google' ? (
              <Wifi size={14} className="text-gold" />
            ) : (
              <WifiOff size={14} className="text-gold" />
            )}
          </>
        ) : modelLoading ? (
          <span className="text-gold animate-pulse">جاري التحميل...</span>
        ) : (
          'اضغط للتسبيح بالصوت'
        )}
      </p>
    </div>
  );
};
