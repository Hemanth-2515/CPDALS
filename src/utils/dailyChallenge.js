import { BookOpen, Clock3, Play, Rocket, Target } from "lucide-react";

export const DAILY_CHALLENGES = [
  {
    id: "complete_content",
    task: "Complete any content item",
    xpReward: 30,
    icon: BookOpen
  },
  {
    id: "quiz_score_80",
    task: "Score 80% or higher on a quiz",
    xpReward: 50,
    icon: Target
  },
  {
    id: "study_15",
    task: "Study for at least 15 minutes",
    xpReward: 25,
    icon: Clock3
  },
  {
    id: "complete_two_contents",
    task: "Complete 2 content items",
    xpReward: 60,
    icon: Rocket
  },
  {
    id: "start_session",
    task: "Start a new learning session",
    xpReward: 20,
    icon: Play
  }
];

export function getTodayChallenge(date = new Date()) {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date - startOfYear;
  const dayOfYear = Math.floor(diff / 86400000);
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

export function getIsoDateOnly(value = new Date()) {
  return new Date(value).toISOString().split("T")[0];
}
