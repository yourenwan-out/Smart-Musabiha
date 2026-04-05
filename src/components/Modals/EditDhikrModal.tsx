import { motion, AnimatePresence } from 'motion/react';
import { Dhikr } from '../../types';
import { parseArabicNumbers } from '../../utils/numberUtils';

interface EditDhikrModalProps {
  editingDhikr: Dhikr | null;
  isAddingNew: boolean;
  colors: string[];
  setEditingDhikr: (d: Dhikr | null) => void;
  onSave: () => void;
  onClose: () => void;
}

export const EditDhikrModal = ({
  editingDhikr,
  isAddingNew,
  colors,
  setEditingDhikr,
  onSave,
  onClose
}: EditDhikrModalProps) => {
  if (!editingDhikr) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-app-bg/80 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-card p-8 rounded-[32px] w-full max-w-md relative z-10 border border-app-border">
        <h3 className="text-xl font-bold mb-6 text-center">{isAddingNew ? 'إضافة ذكر جديد' : 'تعديل الذكر'}</h3>
        <div className="space-y-6">
          <div>
            <label className="text-xs text-gray-500 block mb-2">النص (مثال: سبحان الله)</label>
            <input type="text" placeholder="اكتب الذكر هنا..." value={editingDhikr.text} onChange={(e) => setEditingDhikr({...editingDhikr, text: e.target.value})} className="w-full bg-app-card/40 border border-app-border rounded-xl p-4 text-center text-lg focus:outline-none focus:border-gold text-app-text" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-2">الهدف</label>
            <input type="tel" dir="ltr" value={editingDhikr.target || ''} onChange={(e) => setEditingDhikr({...editingDhikr, target: Math.min(99999999, parseArabicNumbers(e.target.value))})} className="w-full bg-app-card/40 border border-app-border rounded-xl p-4 text-center text-lg focus:outline-none focus:border-gold font-sans text-app-text" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-2">اختر لوناً</label>
            <div className="flex flex-wrap justify-center gap-3">
              {colors.map(color => (
                <button key={color} onClick={() => setEditingDhikr({...editingDhikr, color})} className={`w-8 h-8 rounded-full border-2 transition-all ${editingDhikr.color === color ? 'border-app-text scale-125' : 'border-transparent'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={onSave} disabled={!editingDhikr.text.trim()} className={`flex-1 font-bold py-4 rounded-2xl transition-colors ${editingDhikr.text.trim() ? 'bg-gold text-dark-bg' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>حفظ</button>
            <button onClick={onClose} className="flex-1 bg-app-card/40 font-bold py-4 rounded-2xl">إلغاء</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
