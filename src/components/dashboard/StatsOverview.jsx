import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, Trophy, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsOverview({ sessions, progress, streak }) {
  const totalMinutes = sessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;
  const completedContent = progress?.filter(p => p.status === 'completed' || p.status === 'mastered').length || 0;
  const quizAttempts = progress?.filter((item) => Number(item.best_quiz_score || 0) > 0) || [];
  const avgScore = quizAttempts.length > 0 
    ? Math.round(quizAttempts.reduce((acc, p) => acc + (p.best_quiz_score || 0), 0) / quizAttempts.length)
    : 0;

  const stats = [
    { 
      label: 'Learning Streak', 
      value: streak || 0, 
      suffix: 'days',
      icon: Flame, 
      color: 'text-orange-500', 
      bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      border: 'border-orange-100'
    },
    { 
      label: 'Time Invested', 
      value: Math.round(totalMinutes / 60), 
      suffix: 'hours',
      icon: Clock, 
      color: 'text-blue-500', 
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      border: 'border-blue-100'
    },
    { 
      label: 'Content Mastered', 
      value: completedContent, 
      suffix: 'items',
      icon: BookOpen, 
      color: 'text-emerald-500', 
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      border: 'border-emerald-100'
    },
    { 
      label: 'Average Score', 
      value: avgScore, 
      suffix: '%',
      icon: Trophy, 
      color: 'text-violet-500', 
      bg: 'bg-gradient-to-br from-violet-50 to-purple-50',
      border: 'border-violet-100'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`border ${stat.border} ${stat.bg} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/80 shadow-sm">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}<span className="text-sm font-normal text-slate-500 ml-1">{stat.suffix}</span>
                  </p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
