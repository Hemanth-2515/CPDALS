import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

export default function XPToast({ xpGained, badge, visible, onHide }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 3000);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
        >
          {xpGained > 0 && (
            <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-3 rounded-2xl shadow-xl font-bold text-lg">
              <Star className="w-5 h-5" />
              +{xpGained} XP!
            </div>
          )}
          {badge && (() => {
            const BadgeIcon = badge.icon || Star;
            return (
            <div className="flex items-center gap-2 bg-violet-600 text-white px-4 py-3 rounded-2xl shadow-xl font-bold">
              <span className="rounded-xl bg-white/15 p-2">
                <BadgeIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs opacity-80">Badge Unlocked!</p>
                <p>{badge.name}</p>
              </div>
            </div>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
