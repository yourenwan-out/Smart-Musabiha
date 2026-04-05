import { motion } from 'motion/react';
import { X, Edit3, Trash2, Plus, RotateCcw } from 'lucide-react';
import { Dhikr } from '../../types';
import { formatNumber } from '../../utils/numberUtils';

interface CustomizationModalProps {
  onClose: () => void;
  dhikrs: Dhikr[];
  onDelete: (id: string) => void;
  onEdit: (dhikr: Dhikr) => void;
  onAddNew: () => void;
  onResetToDefault: () => void;
}

export const CustomizationModal = ({
  onClose,
  dhikrs,
  onDelete,
  onEdit,
  onAddNew,
  onResetToDefault
}: CustomizationModalProps) => {
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
          <h2 className="text-xl font-bold">تخصيص الأذكار</h2>
          <button onClick={onClose} className="p-2 bg-app-card/40 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 mb-8">
          {dhikrs.map(dhikr => (
            <div key={dhikr.id} className="bg-app-card/40 p-4 rounded-2xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dhikr.color }} />
                <div>
                  <p className="font-medium">{dhikr.text}</p>
                  <p className="text-xs text-gray-500">الهدف: {formatNumber(dhikr.target)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(dhikr)} className="p-2 text-gray-400 hover:text-app-text">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => onDelete(dhikr.id)} className="p-2 text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={onAddNew} className="w-full p-4 border-2 border-dashed border-app-border rounded-2xl flex items-center justify-center gap-2 text-gold hover:bg-gold/5">
            <Plus size={20} />
            <span>إضافة ذكر جديد</span>
          </button>
        </div>
        <button onClick={onResetToDefault} className="w-full flex items-center justify-center gap-2 text-gray-500 text-sm hover:text-app-text">
          <RotateCcw size={16} />
          <span>استعادة الإعدادات الافتراضية</span>
        </button>
      </motion.div>
    </>
  );
};
