import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Flame, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { getIsoDateOnly, getTodayChallenge } from "@/utils/dailyChallenge";

export default function DailyChallengeCard({ gamification, streak = 0 }) {
  const challenge = getTodayChallenge();
  const Icon = challenge.icon;
  const today = getIsoDateOnly();
  const challengeDate = gamification?.daily_challenge_date
    ? getIsoDateOnly(gamification.daily_challenge_date)
    : null;
  const completed = challengeDate === today && gamification?.daily_challenge_completed;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">
        <div
          className={`p-5 ${
            completed
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-semibold uppercase tracking-wide opacity-90">Daily Challenge</span>
                <span className="ml-auto flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                  <Star className="h-3 w-3" />
                  +{challenge.xpReward} XP
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/20 p-3">
                  <Icon className="h-8 w-8" />
                </div>
                <p className="text-base font-bold leading-snug">{challenge.task}</p>
              </div>
            </div>
          </div>

          {streak > 0 && (
            <div className="mt-3 flex w-fit items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-bold">{streak} day streak</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {completed ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 text-emerald-600"
            >
              <CheckCircle2 className="h-6 w-6" />
              <div>
                <p className="font-semibold">Challenge Completed</p>
                <p className="text-sm text-slate-500">Come back tomorrow for a new challenge</p>
              </div>
            </motion.div>
          ) : (
            <Link to={createPageUrl("ContentLibrary")}>
              <Button className="w-full bg-amber-500 text-white hover:bg-amber-600">Start Challenge</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
