import { motion } from 'motion/react';
import { X, Sun, Moon, Monitor, Zap, Wifi, WifiOff, Check, Volume2, Eye } from 'lucide-react';
import { RecognitionMode } from '../../types';

interface SettingsModalProps {
  onClose: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  recognitionMode: RecognitionMode;
  setRecognitionMode: (m: RecognitionMode) => void;
  developerMode: boolean;
  setDeveloperMode: (d: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (v: boolean) => void;
  setShowDebug: (s: boolean) => void;
}

export const SettingsModal = ({
  onClose,
  theme,
  setTheme,
  recognitionMode,
  setRecognitionMode,
  developerMode,
  setDeveloperMode,
  vibrationEnabled,
  setVibrationEnabled,
  setShowDebug
}: SettingsModalProps) => {
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-app-bg/60 backdrop-blur-sm z-40"
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="fixed bottom-0 left-0 right-0 bg-app-card rounded-t-[40px] z-50 p-8 max-h-[80vh] overflow-y-auto border-t border-app-border"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">الإعدادات العامة</h2>
          <button onClick={onClose} className="p-2 bg-app-card/40 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-app-card/40 p-4 rounded-2xl border border-app-border space-y-4">
            <h3 className="text-app-text font-medium flex items-center gap-2">
              <Sun size={18} className="text-gold" />
              مظهر التطبيق
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'فاتح', icon: Sun },
                { id: 'dark', label: 'داكن', icon: Moon },
                { id: 'system', label: 'تلقائي', icon: Monitor },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    theme === t.id 
                      ? 'bg-gold/10 border-gold text-gold' 
                      : 'bg-app-card/40 border-transparent text-gray-400 hover:bg-app-card/60'
                  }`}
                >
                  <t.icon size={20} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-app-card/40 p-4 rounded-2xl border border-app-border space-y-4">
            <h3 className="text-app-text font-medium flex items-center gap-2">
              <Zap size={18} className="text-gold" />
              محرك التعرف على الصوت
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'auto', label: 'تلقائي (ذكي)', icon: Zap, desc: 'يستخدم محرك الإنترنت عند توفره، والمحرك المحلي المدمج عند انقطاعه' },
                { id: 'google', label: 'بإنترنت', icon: Wifi, desc: 'دقة عالية جداً، يحتاج إنترنت مستمر' },
                { id: 'vosk', label: 'بدون إنترنت (مدمج)', icon: WifiOff, desc: 'يعمل بدون إنترنت تماماً اعتماداً على الموديل المدمج' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setRecognitionMode(mode.id as RecognitionMode)}
                  disabled={mode.id === 'vosk' && !developerMode}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-right ${
                    (mode.id === 'vosk' && !developerMode)
                      ? 'opacity-50 cursor-not-allowed bg-gray-800 border-transparent text-gray-500'
                      : recognitionMode === mode.id 
                        ? 'bg-gold/10 border-gold text-gold' 
                        : 'bg-app-card/40 border-transparent text-gray-400 hover:bg-app-card/60'
                  }`}
                >
                  <mode.icon size={20} className="mt-1 shrink-0" />
                  <div>
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-xs opacity-60">{mode.desc}</div>
                  </div>
                  {recognitionMode === mode.id && <Check size={16} className="mr-auto mt-1" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-app-card/40 p-4 rounded-2xl border border-app-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                <Volume2 className="text-gold" size={20} />
              </div>
              <div>
                <p className="font-medium">الاهتزاز عند العد</p>
                <p className="text-xs text-gray-500">تفعيل اهتزاز الهاتف عند رصد تسبيحة</p>
              </div>
            </div>
            <button 
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${vibrationEnabled ? 'bg-gold' : 'bg-gray-700'}`}
            >
              <motion.div 
                animate={{ x: vibrationEnabled ? 24 : 4 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          <div className="bg-app-card/40 p-4 rounded-2xl border border-app-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                <Eye className="text-gold" size={20} />
              </div>
              <div>
                <p className="font-medium">وضع المطور</p>
                <p className="text-xs text-gray-500">إظهار أدوات التشخيص وسجل الأحداث</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const newValue = !developerMode;
                setDeveloperMode(newValue);
                if (newValue) {
                  setShowDebug(false);
                  if (recognitionMode === 'vosk') {
                    setRecognitionMode('auto');
                  }
                } else {
                  setShowDebug(true);
                }
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${developerMode ? 'bg-gold' : 'bg-gray-700'}`}
            >
              <motion.div 
                animate={{ x: developerMode ? 24 : 4 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
