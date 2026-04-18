import mongoose from "mongoose";

const QuizQuestionSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  },
  { _id: false }
);

const ContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["video", "text", "quiz", "interactive"],
      default: "text"
    },
    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    category: { type: String, default: "General" },
    tags: { type: [String], default: [] },
    estimatedDuration: { type: Number, default: 15 },
    cognitiveLoadRating: { type: Number, default: 4 },
    contentBody: { type: String, default: "" },
    quizQuestions: { type: [QuizQuestionSchema], default: [] },
    prerequisites: { type: [String], default: [] },
    orderIndex: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Content || mongoose.model("Content", ContentSchema);
