import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, FileText, HelpCircle, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const contentTypeIcons = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
  interactive: Sparkles,
};

const contentTypeColors = {
  video: 'bg-red-100 text-red-600',
  text: 'bg-blue-100 text-blue-600',
  quiz: 'bg-amber-100 text-amber-600',
  interactive: 'bg-violet-100 text-violet-600',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
};

export default function ContentCard({ content, progress, onClick, index = 0 }) {
  const Icon = contentTypeIcons[content.type] || FileText;
  const isCompleted = progress?.status === 'completed' || progress?.status === 'mastered';
  const completionPercent = progress?.completion_percentage || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        className={`border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden ${
          isCompleted ? 'bg-gradient-to-br from-emerald-50 to-green-50' : 'bg-white'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${contentTypeColors[content.type]} transition-transform group-hover:scale-110`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  <h3 className="font-semibold text-slate-900 truncate">{content.title}</h3>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{content.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={difficultyColors[content.difficulty_level]}>
                    {content.difficulty_level}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                    {content.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {content.estimated_duration} min
                  </div>
                </div>
              </div>
            </div>
          </div>
          {completionPercent > 0 && completionPercent < 100 && (
            <div className="px-5 pb-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}