import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

export const ALL_BADGES = [
  { id: 'first_step', name: 'First Step', emoji: '👣', description: 'Complete your first content', color: 'from-green-400 to-emerald-500' },
  { id: 'quiz_ace', name: 'Quiz Ace', emoji: '🎯', description: 'Score 100% on a quiz', color: 'from-blue-400 to-indigo-500' },
  { id: 'streak_3', name: 'On Fire', emoji: '🔥', description: '3-day learning streak', color: 'from-orange-400 to-red-500' },
  { id: 'streak_7', name: 'Week Warrior', emoji: '⚡', description: '7-day learning streak', color: 'from-yellow-400 to-amber-500' },
  { id: 'content_5', name: 'Knowledge Seeker', emoji: '📚', description: 'Complete 5 content pieces', color: 'from-violet-400 to-purple-500' },
  { id: 'content_10', name: 'Scholar', emoji: '🎓', description: 'Complete 10 content pieces', color: 'from-indigo-400 to-blue-600' },
  { id: 'level_3', name: 'Rising Star', emoji: '⭐', description: 'Reach Level 3', color: 'from-pink-400 to-rose-500' },
  { id: 'level_5', name: 'Elite Learner', emoji: '🏆', description: 'Reach Level 5', color: 'from-amber-400 to-orange-500' },
  { id: 'daily_5', name: 'Daily Grind', emoji: '📅', description: 'Complete 5 daily challenges', color: 'from-teal-400 to-cyan-500' },
  { id: 'speed_demon', name: 'Speed Demon', emoji: '💨', description: 'Complete content in under 5 min', color: 'from-slate-400 to-zinc-600' },
];

export default function BadgeGrid({ earnedBadges = [] }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="w-5 h-5 text-amber-500" />
          Badges
          <span className="ml-auto text-sm font-normal text-slate-400">{earnedBadges.length}/{ALL_BADGES.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3">
          {ALL_BADGES.map((badge, i) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                title={`${badge.name}: ${badge.description}`}
                className="flex flex-col items-center gap-1 group cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow transition-transform group-hover:scale-110 ${
                  earned
                    ? `bg-gradient-to-br ${badge.color} shadow-md`
                    : 'bg-slate-100 grayscale opacity-40'
                }`}>
                  {badge.emoji}
                </div>
                <span className={`text-xs text-center leading-tight ${earned ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                  {badge.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}