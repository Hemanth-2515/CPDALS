import mongoose from "mongoose";

const CognitiveProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    attentionSpanMinutes: { type: Number, default: 25 },
    attentionSpan: { type: Number, default: 50, min: 0, max: 100 },
    memoryRetentionScore: { type: Number, default: 0.6, min: 0, max: 1 },
    memoryRetention: { type: Number, default: 50, min: 0, max: 100 },
    learningSpeed: { type: String, default: "medium", enum: ["slow", "medium", "fast"] },
    learningSpeedScore: { type: Number, default: 50, min: 0, max: 100 },
    cognitiveLoadTolerance: { type: String, default: "medium", enum: ["low", "medium", "high"] },
    preferredContentTypes: { type: [String], default: ["text", "video", "quiz"] },
    preferredContentType: { type: String, default: "mixed" },
    preferredSessionDurationMinutes: { type: Number, default: 25 },
    optimalSessionDuration: { type: Number, default: 25 },
    peakHours: { type: [Number], default: [9, 10, 11, 20, 21] },
    peakLearningHours: { type: [String], default: [] },
    cognitiveLoadThreshold: { type: Number, default: 70, min: 0, max: 100 },
    interactionPatterns: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastKnownReadiness: { type: Number, default: 0.7, min: 0, max: 1 }
  },
  { timestamps: true }
);

export default mongoose.models.CognitiveProfile ||
  mongoose.model("CognitiveProfile", CognitiveProfileSchema);
