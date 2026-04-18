import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

const LEVELS = [
  { level: 1, name: 'Novice', minXP: 0, maxXP: 100, color: 'from-slate-400 to-slate-500' },
  { level: 2, name: 'Apprentice', minXP: 100, maxXP: 300, color: 'from-green-400 to-emerald-500' },
  { level: 3, name: 'Scholar', minXP: 300, maxXP: 600, color: 'from-blue-400 to-indigo-500' },
  { level: 4, name: 'Expert', minXP: 600, maxXP: 1000, color: 'from-violet-400 to-purple-500' },
  { level: 5, name: 'Master', minXP: 1000, maxXP: 1500, color: 'from-amber-400 to-orange-500' },
  { level: 6, name: 'Grandmaster', minXP: 1500, maxXP: 9999, color: 'from-red-400 to-pink-500' },
];

export function getLevelInfo(xp) {
  const level = LEVELS.slice().reverse().find(l => xp >= l.minXP) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const progress = nextLevel
    ? Math.round(((xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100)
    : 100;
  return { ...level, nextLevel, progress, xpToNext: nextLevel ? nextLevel.minXP - xp : 0 };
}

export default function XPLevelBar({ xp = 0, compact = false }) {
  const levelInfo = getLevelInfo(xp);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-white font-bold text-sm shadow`}>
          {levelInfo.level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700">{levelInfo.name}</span>
            <span className="text-xs text-slate-500">{xp} XP</span>
          </div>
          <Progress value={levelInfo.progress} className="h-1.5" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border-0 p-5"
    >
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`}>
          {levelInfo.level}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="text-lg font-bold text-slate-900">{levelInfo.name}</span>
              <span className="ml-2 text-sm text-slate-500">Level {levelInfo.level}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Zap className="w-4 h-4" />
              <span>{xp} XP</span>
            </div>
          </div>
          <Progress value={levelInfo.progress} className="h-3 mb-1" />
          {levelInfo.nextLevel && (
            <p className="text-xs text-slate-400">
              {levelInfo.xpToNext} XP to reach <strong>{levelInfo.nextLevel.name}</strong>
            </p>
          )}
          {!levelInfo.nextLevel && (
            <p className="text-xs text-amber-600 font-semibold">🏆 Max Level Reached!</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}