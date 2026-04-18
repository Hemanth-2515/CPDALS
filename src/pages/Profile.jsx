import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Brain, Zap, Clock, Target, TrendingUp, Award, 
  Calendar, BarChart3, Settings, User, BookOpen, Star
} from "lucide-react";
import { motion } from "framer-motion";
import XPLevelBar from "../components/gamification/XPLevelBar";
import BadgeCatalog from "../components/gamification/BadgeCatalog";

export default function Profile() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['cognitiveProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CognitiveProfile.filter({ user_email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions', user?.email],
    queryFn: () => base44.entities.LearningSession.filter({ user_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: feedback } = useQuery({
    queryKey: ['feedback', user?.email],
    queryFn: () => base44.entities.Feedback.filter({ user_email: user.email }, '-created_date', 50),
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

  const createProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.CognitiveProfile.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cognitiveProfile'] }),
  });

  // Create profile if doesn't exist
  useEffect(() => {
    if (user?.email && profile === undefined) {
      createProfileMutation.mutate({
        user_email: user.email,
        attention_span: 50,
        memory_retention: 50,
        learning_speed: 50,
        preferred_content_type: 'mixed',
        optimal_session_duration: 25,
        cognitive_load_threshold: 70,
      });
    }
  }, [user, profile]);

  const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
  const totalMinutes = sessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;
  const masteredContent = progress?.filter(p => p.status === 'mastered').length || 0;
  const quizAttempts = progress?.filter((item) => Number(item.best_quiz_score || 0) > 0) || [];
  const avgQuizScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((acc, item) => acc + Number(item.best_quiz_score || 0), 0) / quizAttempts.length)
    : 0;
  const avgRating = feedback?.length > 0 
    ? (feedback.reduce((acc, f) => acc + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : 0;

  const cognitiveMetrics = [
    { key: 'attention_span', label: 'Attention Span', icon: Zap, color: 'amber', description: 'Your ability to maintain focus during learning sessions' },
    { key: 'memory_retention', label: 'Memory Retention', icon: Brain, color: 'violet', description: 'How well you retain information over time' },
    { key: 'learning_speed', label: 'Learning Speed', icon: Clock, color: 'emerald', description: 'How quickly you grasp new concepts' },
    { key: 'cognitive_load_threshold', label: 'Cognitive Capacity', icon: Target, color: 'blue', description: 'Maximum mental effort before fatigue' },
  ];

  const achievements = [
    { title: 'First Steps', description: 'Complete your first content', earned: (progress?.length || 0) > 0, icon: BookOpen },
    { title: 'Quick Learner', description: 'Complete 5 pieces of content', earned: (progress?.filter(p => p.status === 'completed').length || 0) >= 5, icon: Zap },
    { title: 'Dedicated Student', description: 'Study for 5+ hours total', earned: totalMinutes >= 300, icon: Clock },
    { title: 'Master Mind', description: 'Master 3 content pieces', earned: masteredContent >= 3, icon: Award },
  ];

  const metricColors = {
    amber: { bg: "bg-amber-100", text: "text-amber-600" },
    violet: { bg: "bg-violet-100", text: "text-violet-600" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
    blue: { bg: "bg-blue-100", text: "text-blue-600" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-200">
              {user?.full_name?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user?.full_name || 'Learner'}</h1>
              <p className="text-slate-500">{user?.email}</p>
              {gamification && (
                <div className="flex items-center gap-1 mt-1 text-amber-500 font-semibold text-sm">
                  <Star className="w-4 h-4" />{gamification.xp || 0} XP
                </div>
              )}
            </div>
          </div>
          {gamification && <XPLevelBar xp={gamification.xp || 0} />}
        </motion.div>

        <Tabs defaultValue="cognitive" className="space-y-6">
          <TabsList className="bg-white border h-12 p-1">
            <TabsTrigger value="cognitive" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <Brain className="w-4 h-4" />
              Cognitive Profile
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Cognitive Profile Tab */}
          <TabsContent value="cognitive" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {cognitiveMetrics.map((metric, index) => (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${metricColors[metric.color].bg}`}>
                          <metric.icon className={`w-6 h-6 ${metricColors[metric.color].text}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-900">{metric.label}</h3>
                            <span className="text-2xl font-bold text-slate-900">
                              {profile?.[metric.key] || 50}%
                            </span>
                          </div>
                          <Progress value={profile?.[metric.key] || 50} className="h-3 mb-2" />
                          <p className="text-sm text-slate-500">{metric.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Learning Preferences */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-600" />
                  Learning Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Preferred Content Type</p>
                    <Badge variant="secondary" className="text-base px-4 py-2 bg-violet-100 text-violet-700">
                      {profile?.preferred_content_type || 'Mixed'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Optimal Session Duration</p>
                    <Badge variant="secondary" className="text-base px-4 py-2 bg-blue-100 text-blue-700">
                      {profile?.optimal_session_duration || 25} minutes
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Peak Learning Hours</p>
                    <Badge variant="secondary" className="text-base px-4 py-2 bg-emerald-100 text-emerald-700">
                      {profile?.peak_learning_hours?.join(', ') || 'Not set'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Sessions Completed', value: completedSessions, icon: Calendar, color: 'violet' },
                { label: 'Total Learning Time', value: `${Math.round(totalMinutes / 60)}h`, icon: Clock, color: 'blue' },
                { label: 'Current Streak', value: `${gamification?.streak_days || 0}d`, icon: TrendingUp, color: 'emerald' },
                { label: 'Content Mastered', value: masteredContent, icon: Award, color: 'amber' },
                { label: 'Average Quiz Score', value: `${avgQuizScore}%`, icon: Target, color: 'blue' },
                { label: 'Avg Content Rating', value: avgRating, icon: Star, color: 'amber' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${metricColors[stat.color].bg}`}>
                        <stat.icon className={`w-6 h-6 ${metricColors[stat.color].text}`} />
                      </div>
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Sessions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Learning Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions?.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">
                          {session.strategy_used} Session
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(session.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                        {session.duration_minutes && (
                          <p className="text-sm text-slate-500 mt-1">{session.duration_minutes} min</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!sessions || sessions.length === 0) && (
                    <p className="text-center text-slate-500 py-8">No sessions yet. Start learning!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <BadgeCatalog earnedBadges={gamification?.badges || []} />
            <div className="grid sm:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-0 shadow-lg ${achievement.earned ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'opacity-60'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          achievement.earned 
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                            : 'bg-slate-200 text-slate-400'
                        }`}>
                          <achievement.icon className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{achievement.title}</h3>
                          <p className="text-sm text-slate-500">{achievement.description}</p>
                          {achievement.earned && (
                            <Badge className="mt-2 bg-amber-100 text-amber-700">Earned!</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
