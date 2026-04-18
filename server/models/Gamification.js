import mongoose from "mongoose";

const GamificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null },
    badges: { type: [String], default: [] },
    dailyChallengeCompleted: { type: Boolean, default: false },
    dailyChallengeDate: { type: Date, default: null },
    dailyChallengesCompletedCount: { type: Number, default: 0 },
    totalContentCompleted: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Gamification ||
  mongoose.model("Gamification", GamificationSchema);
