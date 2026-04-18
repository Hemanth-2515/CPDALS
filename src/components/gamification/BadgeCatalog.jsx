import React from "react";
import { Award, BookOpen, Flame, Rocket, ShieldCheck, Star, Trophy, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export const ALL_BADGES = [
  { id: "first_step", name: "First Step", description: "Complete your first content", color: "from-green-400 to-emerald-500", icon: BookOpen },
  { id: "quiz_ace", name: "Quiz Ace", description: "Score 100% on a quiz", color: "from-blue-400 to-indigo-500", icon: ShieldCheck },
  { id: "streak_3", name: "On Fire", description: "3-day learning streak", color: "from-orange-400 to-red-500", icon: Flame },
  { id: "streak_7", name: "Week Warrior", description: "7-day learning streak", color: "from-yellow-400 to-amber-500", icon: Zap },
  { id: "content_5", name: "Knowledge Seeker", description: "Complete 5 content pieces", color: "from-violet-400 to-purple-500", icon: BookOpen },
  { id: "content_10", name: "Scholar", description: "Complete 10 content pieces", color: "from-indigo-400 to-blue-600", icon: Award },
  { id: "level_3", name: "Rising Star", description: "Reach Level 3", color: "from-pink-400 to-rose-500", icon: Star },
  { id: "level_5", name: "Elite Learner", description: "Reach Level 5", color: "from-amber-400 to-orange-500", icon: Trophy },
  { id: "daily_5", name: "Daily Grind", description: "Complete 5 daily challenges", color: "from-teal-400 to-cyan-500", icon: Rocket },
  { id: "speed_demon", name: "Speed Demon", description: "Complete content in under 5 min", color: "from-slate-400 to-zinc-600", icon: Zap }
];

export default function BadgeCatalog({ earnedBadges = [] }) {
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ALL_BADGES.map((badge, index) => {
            const earned = earnedBadges.includes(badge.id);
            const Icon = badge.icon;

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                title={`${badge.name}: ${badge.description}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 p-3 text-center"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl shadow transition-transform ${
                    earned ? `bg-gradient-to-br ${badge.color} text-white shadow-md` : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${earned ? "text-slate-700" : "text-slate-400"}`}>{badge.name}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{badge.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
