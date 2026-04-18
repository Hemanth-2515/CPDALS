import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdaptiveStrategyPanel({ cognitiveProfile, sessions, progress }) {
  const [strategy, setStrategy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const generateStrategy = async () => {
    if (!cognitiveProfile) return;

    const completedProgress = progress?.filter(
      (item) => item.status === "completed" || item.status === "mastered"
    ) || [];
    const completedSessions = sessions?.filter((item) => item.status === "completed") || [];
    const averageSessionMinutes = completedSessions.length > 0
      ? Math.round(
        completedSessions.reduce((sum, item) => sum + Number(item.duration_minutes || 0), 0) /
        completedSessions.length
      )
      : 0;
    const averageQuizScore = completedProgress.length > 0
      ? Math.round(
        completedProgress.reduce((sum, item) => sum + Number(item.best_quiz_score || 0), 0) /
        completedProgress.length
      )
      : 0;

    setIsLoading(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Adaptive Decision Engine in CPDALS.

Generate a personalized study strategy from this user data.

Cognitive Profile:
- Attention Span: ${cognitiveProfile.attention_span}%
- Memory Retention: ${cognitiveProfile.memory_retention}%
- Learning Speed: ${cognitiveProfile.learning_speed}%
- Preferred Content Type: ${cognitiveProfile.preferred_content_type}
- Optimal Session Duration: ${cognitiveProfile.optimal_session_duration} minutes
- Cognitive Load Threshold: ${cognitiveProfile.cognitive_load_threshold}%

Usage Summary:
- Completed content count: ${completedProgress.length}
- Completed session count: ${completedSessions.length}
- Average session duration: ${averageSessionMinutes} minutes
- Average quiz score: ${averageQuizScore}%

Return:
1. strategy_name
2. strategy_description
3. recommended_content_type
4. session_advice
5. actionable_tip`,
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
      setExpanded(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cognitiveProfile) {
      generateStrategy();
    }
  }, [
    cognitiveProfile?.attention_span,
    cognitiveProfile?.memory_retention,
    cognitiveProfile?.learning_speed,
    cognitiveProfile?.preferred_content_type,
    cognitiveProfile?.optimal_session_duration,
    cognitiveProfile?.cognitive_load_threshold,
    sessions?.length,
    progress?.length
  ]);

  if (!cognitiveProfile) return null;

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-3">
            <div className="rounded-xl bg-white/20 p-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">AI Adaptive Strategy</h3>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-white/70" />}
              </div>

              {isLoading && (
                <p className="mt-1 text-sm text-white/70">Analyzing your cognitive profile and usage...</p>
              )}

              {strategy && !isLoading && (
                <>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm font-medium">
                      {strategy.strategy_name}
                    </span>
                    <span className="text-sm text-white/80">best for {strategy.recommended_content_type}</span>
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        <p className="text-sm text-white/90">{strategy.strategy_description}</p>
                        <div className="mt-2 rounded-xl bg-white/10 p-3">
                          <p className="mb-1 text-xs font-semibold uppercase text-white/70">Actionable tip</p>
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
              onClick={() => setExpanded((value) => !value)}
              className="flex-shrink-0 text-white/70 transition-colors hover:text-white"
            >
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          )}
        </div>

        {strategy && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={generateStrategy}
            className="mt-3 h-7 text-xs text-white/70 hover:bg-white/10 hover:text-white"
          >
            Regenerate Strategy
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
