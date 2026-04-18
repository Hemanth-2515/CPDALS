import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Star, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { getLevelInfo } from "../components/gamification/XPLevelBar";
import XPLevelBar from "../components/gamification/XPLevelBar";

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: allGameData, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.Gamification.list('-xp', 50),
  });

  const rankedPlayers = (allGameData || [])
    .filter(g => g.xp > 0)
    .sort((a, b) => b.xp - a.xp);

  const myRank = rankedPlayers.findIndex(p => p.user_email === currentUser?.email) + 1;
  const myData = rankedPlayers.find(p => p.user_email === currentUser?.email);

  const medalColors = ['text-amber-400', 'text-slate-400', 'text-orange-400'];
  const rankBg = ['bg-amber-50 border-amber-200', 'bg-slate-50 border-slate-200', 'bg-orange-50 border-orange-200'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
              <p className="text-slate-500">Top learners ranked by XP</p>
            </div>
          </div>
        </motion.div>

        {/* My Rank Card */}
        {myData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="border-2 border-violet-200 shadow-lg bg-gradient-to-r from-violet-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black text-violet-600 w-8 text-center">#{myRank || '—'}</div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {currentUser?.full_name?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{currentUser?.full_name} <Badge variant="secondary" className="ml-1 text-xs">You</Badge></p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{myData.xp} XP</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{myData.streak_days}d streak</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-violet-600">{getLevelInfo(myData.xp).name}</p>
                    <p className="text-xs text-slate-400">Level {getLevelInfo(myData.xp).level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Rankings */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rankings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && (
              <div className="py-8 text-center text-slate-400">Loading rankings...</div>
            )}
            {!isLoading && rankedPlayers.length === 0 && (
              <div className="py-8 text-center text-slate-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No rankings yet. Start learning to appear here!</p>
              </div>
            )}
            {rankedPlayers.map((player, index) => {
              const isMe = player.user_email === currentUser?.email;
              const levelInfo = getLevelInfo(player.xp);
              const rank = index + 1;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isMe ? 'border-violet-300 bg-violet-50' :
                    rank <= 3 ? `border ${rankBg[rank - 1]}` : 'border-transparent bg-slate-50'
                  }`}
                >
                  <div className="w-8 text-center">
                    {rank <= 3 ? (
                      <Medal className={`w-5 h-5 mx-auto ${medalColors[rank - 1]}`} />
                    ) : (
                      <span className="text-sm font-bold text-slate-400">#{rank}</span>
                    )}
                  </div>

                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${levelInfo.color}`}>
                    {(player.user_name || player.user_email)?.[0]?.toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isMe ? 'text-violet-700' : 'text-slate-900'}`}>
                      {player.user_name || player.user_email}
                      {isMe && <span className="ml-1 text-xs text-violet-400">(you)</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{levelInfo.name}</span>
                      {player.streak_days > 0 && (
                        <span className="text-xs text-orange-500 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" />{player.streak_days}d
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />{player.xp}
                    </p>
                    <p className="text-xs text-slate-400">XP</p>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}