import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content", default: null },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", default: null },
    rating: { type: Number, default: 0 },
    difficultyPerceived: { type: String, default: "" },
    paceFeedback: { type: String, default: "" },
    contentHelpful: { type: Boolean, default: null },
    comments: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
