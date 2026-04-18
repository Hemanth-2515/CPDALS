import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdaptiveStrategyBanner({ cognitiveProfile, sessions, progress }) {
  const [strategy, setStrategy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateStrategy = async () => {
    if (!cognitiveProfile) return;
    setIsLoading(true);

    const completedCount = progress?.filter(p => p.status === 'completed').length || 0;
    const totalSessions = sessions?.filter(s => s.status === 'completed').length || 0;
    const avgSessionTime = totalSessions > 0
      ? Math.round(sessions.filter(s => s.status === 'completed').reduce((a, s) => a + (s.duration_minutes || 0), 0) / totalSessions)
      : 0;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Adaptive Decision Engine in CPDALS (Cognitive Process Driven Adaptive Learning System).
      
      Analyze this student's cognitive profile and generate a personalized learning strategy:
      
      Cognitive Profile:
      - Attention Span: ${cognitiveProfile.attention_span}% (${cognitiveProfile.attention_span < 40 ? 'low' : cognitiveProfile.attention_span < 70 ? 'moderate' : 'high'})
      - Memory Retention: ${cognitiveProfile.memory_retention}%
      - Learning Speed: ${cognitiveProfile.learning_speed}%
      - Preferred Content Type: ${cognitiveProfile.preferred_content_type}
      - Optimal Session Duration: ${cognitiveProfile.optimal_session_duration} minutes
      - Cognitive Load Threshold: ${cognitiveProfile.cognitive_load_threshold}%
      
      Activity Summary:
      - Content completed: ${completedCount} items
      - Sessions completed: ${totalSessions}
      - Average session duration: ${avgSessionTime} minutes
      
      Based on CPDALS principles, provide:
      1. A recommended learning strategy (intensive, spaced repetition, review, or exploratory)
      2. Specific content type recommendations
      3. Session duration advice
      4. One actionable tip to improve learning effectiveness
      
      Keep it concise (3-4 sentences max). Be specific and personalized.`,
      response_json_schema: {
        type: "object",
        properties: {
          strategy_name: { type: "string" },
          strategy_description: { type: "string" },
          recommended_content_type: { type: "string" },
          session_advice: { type: "string" },
          actionable_tip: { type: "string" }
        }
      }
    });

    setStrategy(result);
    setIsLoading(false);
    setGenerated(true);
    setExpanded(true);
  };

  useEffect(() => {
    if (cognitiveProfile && !generated) {
      generateStrategy();
    }
  }, [cognitiveProfile]);

  if (!cognitiveProfile) return null;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-xl bg-white/20 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">AI Adaptive Strategy</h3>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white/70" />}
              </div>

              {isLoading && (
                <p className="text-sm text-white/70 mt-1">Analyzing your cognitive profile...</p>
              )}

              {strategy && !isLoading && (
                <>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {strategy.strategy_name}
                    </span>
                    <span className="text-sm text-white/80">→ {strategy.recommended_content_type}</span>
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        <p className="text-sm text-white/90">{strategy.strategy_description}</p>
                        <div className="bg-white/10 rounded-xl p-3 mt-2">
                          <p className="text-xs font-semibold text-white/70 uppercase mb-1">💡 Tip for you</p>
                          <p className="text-sm text-white">{strategy.actionable_tip}</p>
                        </div>
                        <p className="text-xs text-white/70">{strategy.session_advice}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>

          {strategy && !isLoading && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-white/70 hover:text-white transition-colors flex-shrink-0"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>

        {generated && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={generateStrategy}
            className="mt-3 text-white/70 hover:text-white hover:bg-white/10 h-7 text-xs"
          >
            Regenerate Strategy
          </Button>
        )}
      </CardContent>
    </Card>
  );
}