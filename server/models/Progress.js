import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content", required: true },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "mastered"],
      default: "not_started"
    },
    completionPercentage: { type: Number, default: 0 },
    timeSpentMinutes: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    bestQuizScore: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);
