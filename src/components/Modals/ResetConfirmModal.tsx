import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';

interface ResetConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetConfirmModal = ({ onConfirm, onCancel }: ResetConfirmModalProps) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-app-bg/80 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-card p-8 rounded-[32px] w-full max-w-sm relative z-10 border border-app-border text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><RotateCcw className="text-red-500" size={32} /></div>
        <h3 className="text-xl font-bold mb-2">تصفير العدادات؟</h3>
        <p className="text-gray-400 mb-8">هل أنت متأكد من رغبتك في تصفير جميع العدادات الحالية؟</p>
        <div className="flex gap-4">
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-bold py-4 rounded-2xl">نعم، تصفير</button>
          <button onClick={onCancel} className="flex-1 bg-app-card/40 font-bold py-4 rounded-2xl">إلغاء</button>
        </div>
      </motion.div>
    </div>
  );
};
