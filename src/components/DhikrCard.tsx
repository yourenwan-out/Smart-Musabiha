import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { Dhikr } from '../types';
import { formatNumber } from '../utils/numberUtils';

interface DhikrCardProps {
  dhikr: Dhikr;
  onIncrement: (id: string) => void;
  onReset: (id: string) => void;
  onContextMenu: (dhikr: Dhikr) => void;
}

export const DhikrCard = ({ dhikr, onIncrement, onReset, onContextMenu }: DhikrCardProps) => {
  const isRecentlyIncremented = dhikr.lastIncrement && (Date.now() - dhikr.lastIncrement < 300);

  return (
    <motion.div
      animate={{ scale: isRecentlyIncremented ? [1, 1.1, 1] : 1 }}
      transition={{ duration: 0.3 }}
      whileTap={{ scale: 0.95 }}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(dhikr);
      }}
      onClick={() => onIncrement(dhikr.id)}
      className="bg-app-card rounded-3xl p-6 flex flex-col items-center justify-center border border-app-border relative group h-48 cursor-pointer"
    >
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ backgroundColor: dhikr.color }} />
      <div className="h-14 flex items-end justify-center pb-2">
        <p className="text-4xl font-bold leading-none" style={{ color: dhikr.color }}>
          {formatNumber(dhikr.count)}
        </p>
      </div>
      <div className="h-16 flex items-start justify-center w-full pt-2">
        <p className={`font-bold text-gray-300 text-center px-2 leading-snug line-clamp-3 ${
          dhikr.text.length <= 15 ? 'text-xs' : 
          dhikr.text.length <= 30 ? 'text-[11px]' : 
          dhikr.text.length <= 50 ? 'text-[9px]' : 'text-[7px]'
        }`}>
          {dhikr.text}
        </p>
      </div>
      <div className="absolute bottom-4 right-0 w-full text-center text-[10px] text-gray-500">
        {formatNumber(dhikr.count)} / {formatNumber(dhikr.target)}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReset(dhikr.id);
        }}
        className="absolute bottom-3 left-3 p-2 text-gray-500 hover:text-red-400 bg-app-card/40 hover:bg-red-500/10 rounded-xl transition-all"
        title="تصفير هذا الذكر"
      >
        <RotateCcw size={14} />
      </button>
    </motion.div>
  );
};
