import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, PlayCircle, FileText, HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const contentTypeIcons = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
  interactive: Sparkles,
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function LearningRecommendations({ recommendations, onStartContent }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No recommendations yet. Complete some content to get personalized suggestions!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.slice(0, 4).map((content, index) => {
          const Icon = contentTypeIcons[content.type] || FileText;
          return (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
              onClick={() => onStartContent(content)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 truncate">{content.title}</h4>
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{content.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className={difficultyColors[content.difficulty_level]}>
                      {content.difficulty_level}
                    </Badge>
                    <span className="text-xs text-slate-400">{content.estimated_duration} min</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}