import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";
import { ALL_BADGES } from '../components/gamification/BadgeCatalog';
import XPToast from '../components/gamification/XPToast';
import { getIsoDateOnly, getTodayChallenge } from "@/utils/dailyChallenge";
import { useSearchParams } from "react-router-dom";

import TextContent from '../components/learning/TextContent';
import VideoContent from '../components/learning/VideoContent';
import QuizComponent from '../components/learning/QuizComponent';
import FeedbackForm from '../components/feedback/FeedbackForm';

function getLevelFromXP(xp) {
  if (xp >= 1500) return 6;
  if (xp >= 1000) return 5;
  if (xp >= 600) return 4;
  if (xp >= 300) return 3;
  if (xp >= 100) return 2;
  return 1;
}

export default function Learn() {
  const [user, setUser] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [completedSessionId, setCompletedSessionId] = useState(null);
  const [xpToast, setXpToast] = useState({ visible: false, xpGained: 0, badge: null });
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get('contentId');

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', contentId],
    queryFn: async () => {
      const items = await base44.entities.Content.filter({ id: contentId });
      return items[0];
    },
    enabled: !!contentId,
  });

  const { data: existingProgress } = useQuery({
    queryKey: ['progress', user?.email, contentId],
    queryFn: async () => {
      const items = await base44.entities.UserProgress.filter({ 
        user_email: user.email, 
        content_id: contentId 
      });
      return items[0];
    },
    enabled: !!user?.email && !!contentId,
  });

  const { data: activeSession } = useQuery({
    queryKey: ['activeSession', user?.email],
    queryFn: async () => {
      const sessions = await base44.entities.LearningSession.filter({ 
        user_email: user.email, 
        status: 'active' 
      });
      return sessions[0];
    },
    enabled: !!user?.email,
  });

  const { data: gamification } = useQuery({
    queryKey: ['gamification', user?.email],
    queryFn: async () => {
      const items = await base44.entities.Gamification.filter({ user_email: user.email });
      return items[0];
    },
    enabled: !!user?.email,
  });

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProgress.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['progress'] }),
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProgress.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['progress'] }),
  });

  const createSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.LearningSession.create(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['activeSession'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification'] }),
      ]);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LearningSession.update(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['activeSession'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification'] }),
      ]);
    },
  });

  const createFeedbackMutation = useMutation({
    mutationFn: (data) => base44.entities.Feedback.create(data),
    onSuccess: () => {
      window.location.href = createPageUrl('Dashboard');
    },
  });

  const updateCognitiveProfile = async (currentQuizScore) => {
    if (!user?.email) return;
    
    const profiles = await base44.entities.CognitiveProfile.filter({ user_email: user.email });
    const profile = profiles[0];
    if (!profile) return;

    const score = currentQuizScore ?? quizScore;

    // Use AI to analyze performance and update cognitive scores intelligently
    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Cognitive Profiling Module of CPDALS.
      
      A student just completed a learning session. Analyze their performance and update their cognitive profile.
      
      Current Profile:
      - Attention Span: ${profile.attention_span}%
      - Memory Retention: ${profile.memory_retention}%
      - Learning Speed: ${profile.learning_speed}%
      - Cognitive Load Threshold: ${profile.cognitive_load_threshold}%
      
      Session Data:
      - Content type: ${content?.type}
      - Quiz score: ${score !== null ? score + '%' : 'No quiz taken'}
      - Content difficulty: ${content?.difficulty_level}
      - Estimated duration: ${content?.estimated_duration} minutes
      
      Based on this data, calculate updated scores (0-100) for each metric.
      Make small incremental adjustments (+/- 1-5 points) based on performance.
      If quiz score > 80%: increase memory retention slightly
      If quiz score < 50%: decrease memory retention slightly, consider adjusting learning speed
      Completing harder content = slightly increase cognitive load threshold
      `,
      response_json_schema: {
        type: "object",
        properties: {
          attention_span: { type: "number" },
          memory_retention: { type: "number" },
          learning_speed: { type: "number" },
          cognitive_load_threshold: { type: "number" }
        }
      }
    });

    const clamp = (val) => Math.min(100, Math.max(0, Math.round(val)));

    await base44.entities.CognitiveProfile.update(profile.id, {
      attention_span: clamp(aiAnalysis.attention_span || profile.attention_span),
      memory_retention: clamp(aiAnalysis.memory_retention || profile.memory_retention),
      learning_speed: clamp(aiAnalysis.learning_speed || profile.learning_speed),
      cognitive_load_threshold: clamp(aiAnalysis.cognitive_load_threshold || profile.cognitive_load_threshold),
      interaction_patterns: {
        ...profile.interaction_patterns,
        quiz_accuracy: score !== null
          ? ((profile.interaction_patterns?.quiz_accuracy || 50) + score) / 2
          : profile.interaction_patterns?.quiz_accuracy,
        content_completion_rate: ((profile.interaction_patterns?.content_completion_rate || 50) + 100) / 2,
      }
    });
  };

  const updateGamification = async (scoreToUse, sessionDurationMinutes = 0) => {
    if (!user?.email) return;
    const gam = (await base44.entities.Gamification.filter({ user_email: user.email }))[0] || gamification;
    const todayChallenge = getTodayChallenge();

    // XP calculation
    let xpGained = 20; // base for completing content
    if (content?.difficulty_level === 'intermediate') xpGained += 10;
    if (content?.difficulty_level === 'advanced') xpGained += 25;
    if (scoreToUse !== null && scoreToUse >= 80) xpGained += 20;
    if (scoreToUse !== null && scoreToUse === 100) xpGained += 15;

    const today = getIsoDateOnly();
    const lastDate = gam?.last_activity_date ? getIsoDateOnly(gam.last_activity_date) : null;
    const yesterday = getIsoDateOnly(Date.now() - 86400000);
    const newStreak = lastDate === yesterday ? (gam?.streak_days || 0) + 1 :
                      lastDate === today ? (gam?.streak_days || 0) : 1;
    const alreadyCompleted = existingProgress?.status === 'completed' || existingProgress?.status === 'mastered';
    const totalCompleted = alreadyCompleted
      ? (gam?.total_content_completed || 0)
      : (gam?.total_content_completed || 0) + 1;

    // Badge checks
    const currentBadges = gam?.badges || [];
    const newBadges = [...currentBadges];
    let earnedBadge = null;

    const checkBadge = (id) => {
      if (!newBadges.includes(id)) {
        newBadges.push(id);
        earnedBadge = ALL_BADGES.find(b => b.id === id);
      }
    };

    if (totalCompleted >= 1) checkBadge('first_step');
    if (totalCompleted >= 5) checkBadge('content_5');
    if (totalCompleted >= 10) checkBadge('content_10');
    if (scoreToUse === 100) checkBadge('quiz_ace');
    if (newStreak >= 3) checkBadge('streak_3');
    if (newStreak >= 7) checkBadge('streak_7');

    const alreadyCompletedToday =
      gam?.daily_challenge_completed && gam?.daily_challenge_date && getIsoDateOnly(gam.daily_challenge_date) === today;

    const challengeCompleted = !alreadyCompletedToday && (() => {
      switch (todayChallenge.id) {
        case 'complete_content':
          return true;
        case 'quiz_score_80':
          return content?.type === 'quiz' && scoreToUse !== null && scoreToUse >= 80;
        case 'study_15':
          return Number(sessionDurationMinutes || content?.estimated_duration || 0) >= 15;
        case 'complete_two_contents':
          return totalCompleted >= 2;
        case 'start_session':
          return Boolean(activeSession);
        default:
          return false;
      }
    })();

    if (challengeCompleted) {
      xpGained += todayChallenge.xpReward;
    }

    const completedChallenges = (gam?.daily_challenges_completed_count || 0) + (challengeCompleted ? 1 : 0);
    const newXP = (gam?.xp || 0) + xpGained;
    const newLevel = getLevelFromXP(newXP);

    if (newLevel >= 3) checkBadge('level_3');
    if (newLevel >= 5) checkBadge('level_5');
    if (completedChallenges >= 5) checkBadge('daily_5');

    const updateData = {
      user_email: user.email,
      user_name: user.full_name,
      xp: newXP,
      level: newLevel,
      badges: newBadges,
      streak_days: newStreak,
      last_activity_date: today,
      total_content_completed: totalCompleted,
      total_sessions: gam?.total_sessions || 0,
      daily_challenge_completed: challengeCompleted || alreadyCompletedToday,
      daily_challenge_date: challengeCompleted || alreadyCompletedToday ? today : gam?.daily_challenge_date,
      daily_challenges_completed_count: completedChallenges,
    };

    if (gam) {
      await base44.entities.Gamification.update(gam.id, updateData);
    } else {
      await base44.entities.Gamification.create(updateData);
    }

    setXpToast({ visible: true, xpGained, badge: earnedBadge });
  };

  const handleComplete = async (currentQuizScore) => {
    if (!user?.email || !contentId) return;

    const scoreToUse = currentQuizScore ?? quizScore;
    const completionTime = new Date().toISOString();
    let sessionDurationMinutes = Number(content?.estimated_duration || 0);
    let sessionId = activeSession?.id;

    if (activeSession?.id) {
      sessionDurationMinutes = Math.max(
        1,
        Math.round((Date.now() - new Date(activeSession.start_time).getTime()) / 60000)
      );
      await updateSessionMutation.mutateAsync({
        id: activeSession.id,
        data: {
          status: 'completed',
          end_time: completionTime,
          duration_minutes: sessionDurationMinutes,
          strategy_used: activeSession.strategy_used,
        }
      });
    } else {
      const createdSession = await createSessionMutation.mutateAsync({
        user_email: user.email,
        start_time: completionTime,
        end_time: completionTime,
        duration_minutes: Math.max(1, sessionDurationMinutes || 10),
        status: 'completed',
        strategy_used: content?.type === 'quiz' ? 'review' : 'spaced',
        notes: `Auto-recorded after completing ${content?.title || 'learning content'}.`,
      });
      sessionId = createdSession?.id || null;
      sessionDurationMinutes = createdSession?.duration_minutes || sessionDurationMinutes;
    }

    const progressData = {
      status: 'completed',
      completion_percentage: 100,
      last_accessed: completionTime,
      time_spent_minutes: Math.max(sessionDurationMinutes, existingProgress?.time_spent_minutes || 0),
      attempts: (existingProgress?.attempts || 0) + 1,
      best_quiz_score: scoreToUse !== null ? Math.max(scoreToUse, existingProgress?.best_quiz_score || 0) : existingProgress?.best_quiz_score,
    };

    if (existingProgress) {
      await updateProgressMutation.mutateAsync({ id: existingProgress.id, data: progressData });
    } else {
      await createProgressMutation.mutateAsync({
        user_email: user.email,
        content_id: contentId,
        ...progressData,
      });
    }

    await Promise.all([
      updateCognitiveProfile(scoreToUse),
      updateGamification(scoreToUse, sessionDurationMinutes),
      queryClient.invalidateQueries({ queryKey: ['progress'] }),
      queryClient.invalidateQueries({ queryKey: ['gamification'] }),
      queryClient.invalidateQueries({ queryKey: ['cognitiveProfile'] }),
    ]);

    setCompletedSessionId(sessionId || null);
    if (sessionId) {
      await queryClient.invalidateQueries({ queryKey: ['activeSession'] });
    }
    setShowFeedback(true);
  };

  const handleQuizComplete = async (score) => {
    setQuizScore(score);
    await handleComplete(score);
  };

  const handleFeedbackSubmit = async (feedback) => {
    await createFeedbackMutation.mutateAsync({
      ...feedback,
      user_email: user.email,
      session_id: completedSessionId || activeSession?.id || null,
    });
  };

  const handleBack = () => {
    const nextParams = new URLSearchParams();
    for (const key of ['search', 'type', 'difficulty', 'category']) {
      const value = searchParams.get(key);
      if (value) {
        nextParams.set(key, value);
      }
    }
    const query = nextParams.toString();
    window.location.href = query ? `${createPageUrl('ContentLibrary')}?${query}` : createPageUrl('ContentLibrary');
  };

  if (isLoading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (showFeedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50 py-12 px-4">
        <FeedbackForm
          contentId={contentId}
          sessionId={completedSessionId || activeSession?.id}
          onSubmit={handleFeedbackSubmit}
          onSkip={() => {
            window.location.href = createPageUrl('Dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50 py-8 px-4">
      <XPToast
        xpGained={xpToast.xpGained}
        badge={xpToast.badge}
        visible={xpToast.visible}
        onHide={() => setXpToast(p => ({ ...p, visible: false }))}
      />
      <div className="max-w-4xl mx-auto">
        {content.type === 'text' && (
          <TextContent 
            content={content} 
            onComplete={handleComplete}
            onBack={handleBack}
          />
        )}
        {content.type === 'video' && (
          <VideoContent 
            content={content} 
            onComplete={handleComplete}
            onBack={handleBack}
          />
        )}
        {content.type === 'quiz' && content.quiz_questions?.length > 0 && (
          <QuizComponent 
            questions={content.quiz_questions}
            onComplete={handleQuizComplete}
          />
        )}
        {content.type === 'interactive' && (
          <TextContent 
            content={content} 
            onComplete={handleComplete}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
