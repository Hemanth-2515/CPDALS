import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Flame, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const DAILY_CHALLENGES = [
  { task: 'Complete any content item', xpReward: 30, icon: '📖' },
  { task: 'Score 80%+ on a quiz', xpReward: 50, icon: '🎯' },
  { task: 'Study for at least 15 minutes', xpReward: 25, icon: '⏱️' },
  { task: 'Complete 2 content items', xpReward: 60, icon: '🚀' },
  { task: 'Start a new learning session', xpReward: 20, icon: '▶️' },
];

const DISPLAY_CHALLENGES = [
  { task: 'Complete any content item', xpReward: 30, icon: '📘' },
  { task: 'Score 80%+ on a quiz', xpReward: 50, icon: '🎯' },
  { task: 'Study for at least 15 minutes', xpReward: 25, icon: '⏱️' },
  { task: 'Complete 2 content items', xpReward: 60, icon: '🚀' },
  { task: 'Start a new learning session', xpReward: 20, icon: '▶️' },
];

function getTodayChallenge() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DISPLAY_CHALLENGES[dayOfYear % DISPLAY_CHALLENGES.length];
}

export default function DailyChallenge({ gamification, streak = 0 }) {
  const challenge = getTodayChallenge();
  const today = new Date().toISOString().split('T')[0];
  const challengeDate = gamification?.daily_challenge_date
    ? new Date(gamification.daily_challenge_date).toISOString().split('T')[0]
    : null;
  const completed = challengeDate === today && gamification?.daily_challenge_completed;

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className={`p-5 ${completed ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-semibold uppercase tracking-wide opacity-90">Daily Challenge</span>
                <span className="ml-auto flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                  <Star className="w-3 h-3" />
                  +{challenge.xpReward} XP
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{challenge.icon}</span>
                <p className="text-base font-bold leading-snug">{challenge.task}</p>
              </div>
            </div>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-1.5 mt-3 bg-white/20 rounded-xl px-3 py-2 w-fit">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">{streak} day streak!</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {completed ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 text-emerald-600"
            >
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <p className="font-semibold">Challenge Completed!</p>
                <p className="text-sm text-slate-500">Come back tomorrow for a new challenge</p>
              </div>
            </motion.div>
          ) : (
            <Link to={createPageUrl('ContentLibrary')}>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                Start Challenge →
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
