import { motion } from 'motion/react';
import { VolumeX } from 'lucide-react';

interface PermissionErrorModalProps {
  onClose: () => void;
}

export const PermissionErrorModal = ({ onClose }: PermissionErrorModalProps) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-app-bg/90 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-card p-8 rounded-[32px] w-full max-w-md relative z-10 border border-app-border">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><VolumeX className="text-red-500" size={40} /></div>
        <h3 className="text-xl font-bold mb-4 text-center text-red-500">مشكلة في الوصول للميكروفون</h3>
        <div className="space-y-4 text-right text-gray-300">
          <p>يرجى اتباع الآتي:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>اضغط على أيقونة القفل (🔒) بجانب الرابط.</li>
            <li>تأكد من تفعيل "الميكروفون".</li>
            <li>قم بتحديث الصفحة.</li>
          </ol>
          <button onClick={onClose} className="w-full bg-gold text-dark-bg font-bold py-4 rounded-2xl mt-4">حسناً</button>
        </div>
      </motion.div>
    </div>
  );
};
