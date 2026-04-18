import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Clock, Target } from "lucide-react";

const metrics = [
  { key: 'attention_span', label: 'Attention Span', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'memory_retention', label: 'Memory Retention', icon: Brain, color: 'text-violet-500', bg: 'bg-violet-50' },
  { key: 'learning_speed', label: 'Learning Speed', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { key: 'cognitive_load_threshold', label: 'Cognitive Capacity', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
];

export default function CognitiveMetricsCard({ profile }) {
  if (!profile) return null;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-600" />
          Cognitive Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{profile[key] || 50}%</span>
            </div>
            <Progress value={profile[key] || 50} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}