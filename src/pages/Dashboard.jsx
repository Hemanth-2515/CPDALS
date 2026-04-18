import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Play, Brain, Sparkles, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import StatsOverview from '../components/dashboard/StatsOverview';
import CognitiveMetricsCard from '../components/dashboard/CognitiveMetricsCard';
import LearningRecommendations from '../components/dashboard/LearningRecommendations';
import ActiveSession from '../components/dashboard/ActiveSession';
import AdaptiveStrategyPanel from '../components/ai/AdaptiveStrategyPanel';
import AILearningAssistant from '../components/ai/AILearningAssistant';
import XPLevelBar from '../components/gamification/XPLevelBar';
import DailyChallengeCard from '../components/gamification/DailyChallengeCard';
import { getIsoDateOnly, getTodayChallenge } from "@/utils/dailyChallenge";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['cognitiveProfile', user?.email],
    queryFn: () => base44.entities.CognitiveProfile.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions', user?.email],
    queryFn: () => base44.entities.LearningSession.filter({ user_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: content } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.Content.list('order_index', 100),
  });

  const createSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.LearningSession.create(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification'] }),
      ]);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LearningSession.update(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification'] }),
      ]);
    },
  });

  const { data: gamification } = useQuery({
    queryKey: ['gamification', user?.email],
    queryFn: async () => {
      const items = await base44.entities.Gamification.filter({ user_email: user.email });
      return items[0];
    },
    enabled: !!user?.email,
  });

  const cognitiveProfile = profile?.[0];
  const activeSession = sessions?.find(s => s.status === 'active');

  // Get recommendations based on cognitive profile
  const getRecommendations = () => {
    if (!content?.length) return [];
    
    const completedIds = progress?.filter(p => p.status === 'completed' || p.status === 'mastered')
      .map(p => p.content_id) || [];
    
    let filtered = content.filter(c => !completedIds.includes(c.id));
    
    if (cognitiveProfile) {
      // Sort by cognitive compatibility
      filtered.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        
        if (cognitiveProfile.preferred_content_type === a.type) scoreA += 10;
        if (cognitiveProfile.preferred_content_type === b.type) scoreB += 10;
        
        if (a.cognitive_load_rating <= cognitiveProfile.cognitive_load_threshold / 10) scoreA += 5;
        if (b.cognitive_load_rating <= cognitiveProfile.cognitive_load_threshold / 10) scoreB += 5;
        
        return scoreB - scoreA;
      });
    }
    
    return filtered;
  };

  const handleStartSession = async () => {
    const strategy = cognitiveProfile?.attention_span < 50 ? 'spaced' : 'intensive';
    const createdSession = await createSessionMutation.mutateAsync({
      user_email: user.email,
      start_time: new Date().toISOString(),
      status: 'active',
      strategy_used: strategy,
    });

    const today = getIsoDateOnly();
    const challenge = getTodayChallenge();
    const alreadyCompletedToday =
      gamification?.daily_challenge_completed &&
      gamification?.daily_challenge_date &&
      getIsoDateOnly(gamification.daily_challenge_date) === today;

    if (!alreadyCompletedToday && challenge.id === "start_session") {
      const payload = {
        ...(gamification || {}),
        xp: (gamification?.xp || 0) + challenge.xpReward,
        level: gamification?.level || 1,
        daily_challenge_completed: true,
        daily_challenge_date: today,
        daily_challenges_completed_count: (gamification?.daily_challenges_completed_count || 0) + 1
      };

      if (gamification?.id) {
        await base44.entities.Gamification.update(gamification.id, payload);
      } else {
        await base44.entities.Gamification.create(payload);
      }
      await queryClient.invalidateQueries({ queryKey: ['gamification'] });
    }

    return createdSession;
  };

  const handlePauseSession = async () => {
    if (activeSession) {
      await updateSessionMutation.mutateAsync({
        id: activeSession.id,
        data: { status: 'paused' }
      });
    }
  };

  const handleEndSession = async () => {
    if (activeSession) {
      const duration = Math.round((Date.now() - new Date(activeSession.start_time).getTime()) / 60000);
      await updateSessionMutation.mutateAsync({
        id: activeSession.id,
        data: {
          status: 'completed',
          end_time: new Date().toISOString(),
          duration_minutes: duration,
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Learner'}
              </h1>
              <p className="text-slate-500 mt-1">Continue your personalized learning journey</p>
            </div>
            {!activeSession && (
              <Button 
                onClick={handleStartSession}
                className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200"
              >
                <Play className="w-4 h-4" />
                Start Learning Session
              </Button>
            )}
          </div>
        </motion.div>

        {/* Active Session */}
        {activeSession && (
          <div className="mb-6">
            <ActiveSession
              session={activeSession}
              onPause={handlePauseSession}
              onEnd={handleEndSession}
              cognitiveLoad={cognitiveProfile?.cognitive_load_threshold || 50}
            />
          </div>
        )}

        {/* XP Level Bar */}
        {gamification && (
          <div className="mb-6">
            <XPLevelBar xp={gamification.xp || 0} />
          </div>
        )}

        {/* Stats Overview */}
        <div className="mb-6">
            <StatsOverview 
              sessions={sessions || []} 
              progress={progress || []} 
              streak={gamification?.streak_days || 0}
            />
          </div>

        <div className="mb-6">
          <AdaptiveStrategyPanel
            cognitiveProfile={cognitiveProfile}
            sessions={sessions || []}
            progress={progress || []}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            <LearningRecommendations 
              recommendations={getRecommendations()}
              onStartContent={(c) => {
                window.location.href = createPageUrl(`Learn?contentId=${c.id}`);
              }}
            />
            <AILearningAssistant
              cognitiveProfile={cognitiveProfile}
              recentContent={content?.slice(0, 5)}
            />
          </div>

          {/* Cognitive Profile + Daily Challenge */}
          <div className="space-y-6">
            <DailyChallengeCard gamification={gamification} streak={gamification?.streak_days || 0} />
            <CognitiveMetricsCard profile={cognitiveProfile} />
            
            {/* Quick Links */}
            <div className="space-y-3">
              <Link to={createPageUrl('ContentLibrary')}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Browse All Content
                </Button>
              </Link>
              <Link to={createPageUrl('Profile')}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Brain className="w-4 h-4 text-violet-500" />
                  View Full Cognitive Profile
                </Button>
              </Link>
              <Link to={createPageUrl('Leaderboard')}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
