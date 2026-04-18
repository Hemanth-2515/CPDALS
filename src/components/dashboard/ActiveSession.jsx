import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, Clock, Brain, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function ActiveSession({ session, onPause, onEnd, cognitiveLoad }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!session || session.status !== 'active') return;
    
    const startTime = new Date(session.start_time).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [session]);

  if (!session || session.status !== 'active') return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Active Learning Session</h3>
                <p className="text-sm text-white/70">{session.strategy_used} mode</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={onPause}
              >
                <Pause className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={onEnd}
              >
                <Square className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">Duration</span>
              </div>
              <p className="text-2xl font-mono font-bold">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">Cognitive Load</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={cognitiveLoad || 45} className="h-2 flex-1 bg-white/20" />
                <span className="text-sm font-medium">{cognitiveLoad || 45}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}