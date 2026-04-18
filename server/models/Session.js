import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    durationMinutes: { type: Number, default: 25 },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "abandoned"],
      default: "completed"
    },
    cognitiveLoadAvg: { type: Number, default: 60 },
    attentionScore: { type: Number, default: 75 },
    strategyUsed: {
      type: String,
      enum: ["intensive", "spaced", "review", "exploratory"],
      default: "spaced"
    },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
