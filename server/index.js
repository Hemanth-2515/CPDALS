import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import { connectToDatabase } from "./db.js";
import { createToken, requireAdmin, requireAuth } from "./middleware/auth.js";
import CognitiveProfile from "./models/CognitiveProfile.js";
import Content from "./models/Content.js";
import Feedback from "./models/Feedback.js";
import Gamification from "./models/Gamification.js";
import Progress from "./models/Progress.js";
import Session from "./models/Session.js";
import User from "./models/User.js";
import { defaultContent } from "./seed/defaultContent.js";
import { buildRecommendations } from "./services/recommendations.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/auth/register", async (request, response) => {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password || password.length < 6) {
      return response.status(400).json({ message: "Name, email, and a 6+ character password are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return response.status(409).json({ message: "An account with that email already exists" });
    }

    const adminCount = await User.countDocuments({ role: "admin" });
    const shouldMakeAdmin =
      adminCount === 0 &&
      (String(name || "").toLowerCase().includes("hemanth") || normalizedEmail.includes("hemanth"));

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: shouldMakeAdmin ? "admin" : "student"
    });

    await CognitiveProfile.create({ userId: user._id });
    await Gamification.create({ userId: user._id });

    response.status(201).json({
      token: createToken(user._id),
      user: sanitizeUser(user)
    });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/auth/login", async (request, response) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      return response.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password || "", user.passwordHash);
    if (!isMatch) {
      return response.status(401).json({ message: "Invalid email or password" });
    }

    response.json({
      token: createToken(user._id),
      user: sanitizeUser(user)
    });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/auth/me", requireAuth, async (request, response) => {
  response.json({ user: sanitizeUser(request.user) });
});

app.get("/api/dashboard", requireAuth, async (request, response) => {
  try {
    const [content, progress, sessions, profile, gamification] = await Promise.all([
      Content.find().sort({ orderIndex: 1 }),
      Progress.find({ userId: request.user._id }).sort({ updatedAt: -1 }),
      Session.find({ userId: request.user._id }).sort({ createdAt: -1 }).limit(6),
      CognitiveProfile.findOne({ userId: request.user._id }),
      Gamification.findOne({ userId: request.user._id })
    ]);

    const progressMap = new Map(progress.map((item) => [String(item.contentId), item]));
    const summary = buildSummary(progress, sessions);

    response.json({
      content,
      progress,
      sessions,
      profile,
      gamification: gamification || {
        xp: 0,
        level: 1,
        streakDays: 0,
        totalContentCompleted: 0,
        totalSessions: 0
      },
      recommendations: buildRecommendations(content, progressMap, profile),
      summary
    });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/content", requireAuth, async (request, response) => {
  try {
    const { search = "", type = "all", difficulty = "all", category = "all" } = request.query;
    const filter = {};

    if (type !== "all") {
      filter.type = type;
    }

    if (difficulty !== "all") {
      filter.difficultyLevel = difficulty;
    }

    if (category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $elemMatch: { $regex: search, $options: "i" } } }
      ];
    }

    const [content, progress] = await Promise.all([
      Content.find(filter).sort({ orderIndex: 1 }),
      Progress.find({ userId: request.user._id })
    ]);

    response.json({
      items: content,
      progress,
      categories: await Content.distinct("category")
    });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/content/:id", requireAuth, async (request, response) => {
  try {
    const [item, progress] = await Promise.all([
      Content.findById(request.params.id),
      Progress.findOne({ userId: request.user._id, contentId: request.params.id })
    ]);

    if (!item) {
      return response.status(404).json({ message: "Content not found" });
    }

    response.json({
      item,
      progress
    });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/content", requireAuth, requireAdmin, async (request, response) => {
  try {
    const created = await Content.create({
      title: request.body.title,
      description: request.body.description || "",
      type: request.body.type || "text",
      difficultyLevel: request.body.difficultyLevel || "beginner",
      category: request.body.category || "General",
      tags: request.body.tags || [],
      estimatedDuration: Number(request.body.estimatedDuration || 15),
      cognitiveLoadRating: Number(request.body.cognitiveLoadRating || 4),
      contentBody: request.body.contentBody || "",
      quizQuestions: request.body.quizQuestions || []
    });

    response.status(201).json({ item: created });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.put("/api/content/:id", requireAuth, requireAdmin, async (request, response) => {
  try {
    const updated = await Content.findByIdAndUpdate(
      request.params.id,
      {
        title: request.body.title,
        description: request.body.description || "",
        type: request.body.type || "text",
        difficultyLevel: request.body.difficultyLevel || "beginner",
        category: request.body.category || "General",
        tags: request.body.tags || [],
        estimatedDuration: Number(request.body.estimatedDuration || 15),
        cognitiveLoadRating: Number(request.body.cognitiveLoadRating || 4),
        contentBody: request.body.contentBody || "",
        quizQuestions: request.body.quizQuestions || []
      },
      { new: true }
    );

    response.json({ item: updated });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.delete("/api/content/:id", requireAuth, requireAdmin, async (request, response) => {
  try {
    await Content.findByIdAndDelete(request.params.id);
    await Progress.deleteMany({ contentId: request.params.id });
    response.json({ ok: true });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.put("/api/profile", requireAuth, async (request, response) => {
  try {
    const updates = {
      attentionSpanMinutes: Number(request.body.attentionSpanMinutes || 25),
      learningSpeed: request.body.learningSpeed || "medium",
      cognitiveLoadTolerance: request.body.cognitiveLoadTolerance || "medium",
      preferredSessionDurationMinutes: Number(request.body.preferredSessionDurationMinutes || 25)
    };

    const profile = await CognitiveProfile.findOneAndUpdate(
      { userId: request.user._id },
      updates,
      { new: true, upsert: true }
    );

    const content = await Content.find().sort({ orderIndex: 1 });
    const progress = await Progress.find({ userId: request.user._id });
    const progressMap = new Map(progress.map((item) => [String(item.contentId), item]));

    response.json({
      profile,
      user: sanitizeUser(request.user),
      recommendations: buildRecommendations(content, progressMap, profile)
    });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/progress", requireAuth, async (request, response) => {
  try {
    const { contentId, status, completionPercentage = 0 } = request.body;

    if (!contentId || !status) {
      return response.status(400).json({ message: "contentId and status are required" });
    }

    await Progress.findOneAndUpdate(
      { userId: request.user._id, contentId },
      {
        status,
        completionPercentage,
        lastAccessed: new Date(),
        $inc: { attempts: 1 }
      },
      { new: true, upsert: true }
    );

    const [progress, sessions] = await Promise.all([
      Progress.find({ userId: request.user._id }).sort({ updatedAt: -1 }),
      Session.find({ userId: request.user._id }).sort({ createdAt: -1 }).limit(6)
    ]);
    const gamification = await syncGamification(request.user._id);

    response.json({
      progress,
      gamification,
      summary: buildSummary(progress, sessions)
    });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/sessions", requireAuth, async (request, response) => {
  try {
    await Session.create({
      userId: request.user._id,
      durationMinutes: Number(request.body.durationMinutes || 25),
      strategyUsed: request.body.strategyUsed || "spaced",
      notes: request.body.notes || "",
      status: "completed"
    });

    const [sessions, progress] = await Promise.all([
      Session.find({ userId: request.user._id }).sort({ createdAt: -1 }).limit(6),
      Progress.find({ userId: request.user._id }).sort({ updatedAt: -1 })
    ]);
    const gamification = await syncGamification(request.user._id);

    response.status(201).json({
      sessions,
      gamification,
      summary: buildSummary(progress, sessions)
    });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/leaderboard", requireAuth, async (_request, response) => {
  try {
    const users = await User.find().select("name");
    const gamification = await Gamification.find().sort({ xp: -1 }).lean();
    const userMap = new Map(users.map((user) => [String(user._id), user.name]));

    const rankings = gamification.map((entry, index) => ({
      rank: index + 1,
      userId: String(entry.userId),
      name: userMap.get(String(entry.userId)) || "Learner",
      xp: entry.xp,
      level: entry.level,
      streakDays: entry.streakDays
    }));

    response.json({ rankings });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/assistant", requireAuth, async (request, response) => {
  try {
    const message = String(request.body.message || "").trim();
    if (!message) {
      return response.status(400).json({ message: "Message is required" });
    }

    const profile = await CognitiveProfile.findOne({ userId: request.user._id });
    const answer = buildAssistantReply(message, profile);

    response.json({
      reply: answer
    });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/compat/content", requireAuth, async (_request, response) => {
  try {
    const items = await Content.find().sort({ orderIndex: 1 });
    response.json(items.map(serializeContent));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/compat/content/:id", requireAuth, async (request, response) => {
  try {
    const item = await Content.findById(request.params.id);
    if (!item) {
      return response.status(404).json({ message: "Content not found" });
    }
    response.json(serializeContent(item));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/compat/content", requireAuth, requireAdmin, async (request, response) => {
  try {
    const created = await Content.create(deserializeContent(request.body));
    response.status(201).json(serializeContent(created));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.put("/api/compat/content/:id", requireAuth, requireAdmin, async (request, response) => {
  try {
    const updated = await Content.findByIdAndUpdate(
      request.params.id,
      deserializeContent(request.body),
      { new: true }
    );
    response.json(serializeContent(updated));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.delete("/api/compat/content/:id", requireAuth, requireAdmin, async (request, response) => {
  try {
    await Content.findByIdAndDelete(request.params.id);
    await Progress.deleteMany({ contentId: request.params.id });
    response.json({ ok: true });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/compat/progress", requireAuth, async (request, response) => {
  try {
    const items = await Progress.find({ userId: request.user._id }).sort({ updatedAt: -1 });
    const contentId = request.query.contentId;
    const filtered = contentId ? items.filter((item) => String(item.contentId) === String(contentId)) : items;
    response.json(filtered.map(serializeProgress));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/compat/progress", requireAuth, async (request, response) => {
  try {
    const created = await Progress.create({
      userId: request.user._id,
      ...deserializeProgress(request.body)
    });
    const gamification = await syncGamification(request.user._id);
    response.status(201).json({ item: serializeProgress(created), gamification: serializeGamification(gamification, request.user) });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.put("/api/compat/progress/:id", requireAuth, async (request, response) => {
  try {
    const updated = await Progress.findOneAndUpdate(
      { _id: request.params.id, userId: request.user._id },
      deserializeProgress(request.body),
      { new: true }
    );
    const gamification = await syncGamification(request.user._id);
    response.json({ item: serializeProgress(updated), gamification: serializeGamification(gamification, request.user) });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/compat/sessions", requireAuth, async (request, response) => {
  try {
    const filter = { userId: request.user._id };
    if (request.query.status) {
      filter.status = request.query.status;
    }
    const items = await Session.find(filter).sort({ createdAt: -1 });
    response.json(items.map(serializeSession));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/compat/sessions", requireAuth, async (request, response) => {
  try {
    const created = await Session.create({
      userId: request.user._id,
      ...deserializeSession(request.body)
    });
    const gamification = await syncGamification(request.user._id);
    response.status(201).json({ item: serializeSession(created), gamification: serializeGamification(gamification, request.user) });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.put("/api/compat/sessions/:id", requireAuth, async (request, response) => {
  try {
    const updated = await Session.findOneAndUpdate(
      { _id: request.params.id, userId: request.user._id },
      deserializeSession(request.body),
      { new: true }
    );
    const gamification = await syncGamification(request.user._id);
    response.json({ item: serializeSession(updated), gamification: serializeGamification(gamification, request.user) });
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/compat/cognitive-profile", requireAuth, async (request, response) => {
  try {
    const profile = await ensureProfile(request.user._id);
    response.json([serializeProfile(profile, request.user)]);
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/compat/cognitive-profile", requireAuth, async (request, response) => {
  try {
    const created = await CognitiveProfile.findOneAndUpdate(
      { userId: request.user._id },
      deserializeProfile(request.body),
      { new: true, upsert: true }
    );
    response.status(201).json(serializeProfile(created, request.user));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.put("/api/compat/cognitive-profile/:id", requireAuth, async (request, response) => {
  try {
    const updated = await CognitiveProfile.findOneAndUpdate(
      { _id: request.params.id, userId: request.user._id },
      deserializeProfile(request.body),
      { new: true }
    );
    response.json(serializeProfile(updated, request.user));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/compat/gamification", requireAuth, async (request, response) => {
  try {
    const gamification = await syncGamification(request.user._id);
    response.json([serializeGamification(gamification, request.user)]);
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/compat/gamification/all", requireAuth, async (_request, response) => {
  try {
    const users = await User.find().select("name email role");
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const items = await Gamification.find().sort({ xp: -1 });
    response.json(items.map((item) => serializeGamification(item, userMap.get(String(item.userId)))));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/compat/gamification", requireAuth, async (request, response) => {
  try {
    const created = await Gamification.findOneAndUpdate(
      { userId: request.user._id },
      deserializeGamification(request.body),
      { new: true, upsert: true }
    );
    response.status(201).json(serializeGamification(created, request.user));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.put("/api/compat/gamification/:id", requireAuth, async (request, response) => {
  try {
    const updated = await Gamification.findOneAndUpdate(
      { _id: request.params.id, userId: request.user._id },
      deserializeGamification(request.body),
      { new: true }
    );
    response.json(serializeGamification(updated, request.user));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.get("/api/compat/feedback", requireAuth, async (_request, response) => {
  try {
    const items = await Feedback.find({ userId: request.user._id }).sort({ createdAt: -1 });
    response.json(items.map(serializeFeedback));
  } catch (error) {
    handleServerError(response, error);
  }
});

app.post("/api/compat/feedback", requireAuth, async (request, response) => {
  try {
    const created = await Feedback.create({
      userId: request.user._id,
      ...deserializeFeedback(request.body)
    });
    response.status(201).json(serializeFeedback(created));
  } catch (error) {
    handleServerError(response, error);
  }
});

async function seedContent() {
  for (const item of defaultContent) {
    await Content.updateOne({ title: item.title }, { $set: item }, { upsert: true });
  }
}

async function ensureAdminUser() {
  const adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount > 0) {
    return;
  }

  const hemanthUser = await User.findOne({
    $or: [
      { name: { $regex: "hemanth", $options: "i" } },
      { email: { $regex: "hemanth", $options: "i" } }
    ]
  }).sort({ createdAt: 1 });

  if (hemanthUser) {
    hemanthUser.role = "admin";
    await hemanthUser.save();
    return;
  }

  const firstUser = await User.findOne().sort({ createdAt: 1 });
  if (firstUser) {
    firstUser.role = "admin";
    await firstUser.save();
  }
}

async function ensureProfile(userId) {
  return CognitiveProfile.findOneAndUpdate(
    { userId },
    {},
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function syncGamification(userId) {
  const [progress, sessions, game] = await Promise.all([
    Progress.find({ userId }),
    Session.find({ userId }),
    Gamification.findOne({ userId })
  ]);

  const completedProgress = progress.filter((item) => item.status === "completed" || item.status === "mastered");
  const completedCount = completedProgress.length;
  const totalSessions = sessions.length;
  const activityDates = [...progress, ...sessions]
    .map((item) => new Date(item.lastAccessed || item.updatedAt || item.endTime || item.createdAt))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((first, second) => second.getTime() - first.getTime());
  const latestDate = activityDates[0] || game?.lastActivityDate || null;
  const streakDays = calculateStreakDays(activityDates);
  const dailyChallengesCompletedCount = Number(game?.dailyChallengesCompletedCount || 0);
  const baseXP = completedCount * 40 + totalSessions * 15 + dailyChallengesCompletedCount * 20;
  const xp = Math.max(Number(game?.xp || 0), baseXP);
  const level = getLevelFromXP(xp);
  const badges = Array.from(new Set([...(game?.badges || []), ...deriveBadges({
    completedCount,
    streakDays,
    level,
    dailyChallengesCompletedCount,
    sessions,
    progress
  })]));

  return Gamification.findOneAndUpdate(
    { userId },
    {
      xp,
      level,
      badges,
      streakDays,
      totalContentCompleted: completedCount,
      totalSessions,
      dailyChallengesCompletedCount,
      lastActivityDate: latestDate
    },
    { new: true, upsert: true }
  );
}

function buildSummary(progress, sessions) {
  const completedCount = progress.filter(
    (item) => item.status === "completed" || item.status === "mastered"
  ).length;
  const inProgressCount = progress.filter((item) => item.status === "in_progress").length;

  return {
    completedCount,
    inProgressCount,
    totalSessions: sessions.length
  };
}

function sanitizeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    full_name: user.name,
    email: user.email,
    role: user.role || "admin"
  };
}

function serializeContent(item) {
  if (!item) {
    return null;
  }

  return {
    id: String(item._id),
    title: item.title,
    description: item.description,
    type: item.type,
    difficulty_level: item.difficultyLevel,
    category: item.category,
    tags: item.tags || [],
    estimated_duration: item.estimatedDuration,
    cognitive_load_rating: item.cognitiveLoadRating,
    content_body: item.contentBody,
    quiz_questions: (item.quizQuestions || []).map((question) => ({
      question: question.question,
      options: question.options,
      correct_answer: question.correctAnswer,
      explanation: question.explanation
    })),
    order_index: item.orderIndex,
    created_date: item.createdAt,
    updated_date: item.updatedAt
  };
}

function deserializeContent(payload) {
  return {
    title: payload.title,
    description: payload.description || "",
    type: payload.type || "text",
    difficultyLevel: payload.difficulty_level || payload.difficultyLevel || "beginner",
    category: payload.category || "",
    tags: payload.tags || [],
    estimatedDuration: Number(payload.estimated_duration ?? payload.estimatedDuration ?? 10),
    cognitiveLoadRating: Number(payload.cognitive_load_rating ?? payload.cognitiveLoadRating ?? 5),
    contentBody: payload.content_body ?? payload.contentBody ?? "",
    orderIndex: Number(payload.order_index ?? payload.orderIndex ?? 0),
    quizQuestions: (payload.quiz_questions || payload.quizQuestions || []).map((question) => ({
      question: question.question,
      options: question.options || [],
      correctAnswer: Number(question.correct_answer ?? question.correctAnswer ?? 0),
      explanation: question.explanation || ""
    }))
  };
}

function serializeProgress(item) {
  if (!item) {
    return null;
  }

  return {
    id: String(item._id),
    user_email: "",
    content_id: String(item.contentId),
    status: item.status,
    completion_percentage: item.completionPercentage,
    time_spent_minutes: item.timeSpentMinutes,
    attempts: item.attempts,
    best_quiz_score: item.bestQuizScore,
    last_accessed: item.lastAccessed,
    created_date: item.createdAt,
    updated_date: item.updatedAt
  };
}

function deserializeProgress(payload) {
  return {
    contentId: payload.content_id ?? payload.contentId,
    status: payload.status ?? "not_started",
    completionPercentage: Number(payload.completion_percentage ?? payload.completionPercentage ?? 0),
    timeSpentMinutes: Number(payload.time_spent_minutes ?? payload.timeSpentMinutes ?? 0),
    attempts: Number(payload.attempts ?? 0),
    bestQuizScore: Number(payload.best_quiz_score ?? payload.bestQuizScore ?? 0),
    lastAccessed: payload.last_accessed ? new Date(payload.last_accessed) : new Date(),
    notes: payload.notes || ""
  };
}

function serializeSession(item) {
  if (!item) {
    return null;
  }

  return {
    id: String(item._id),
    user_email: "",
    status: item.status,
    duration_minutes: item.durationMinutes,
    strategy_used: item.strategyUsed,
    cognitive_load_avg: item.cognitiveLoadAvg,
    attention_score: item.attentionScore,
    start_time: item.startTime || item.createdAt,
    end_time: item.endTime,
    notes: item.notes || "",
    created_date: item.createdAt,
    updated_date: item.updatedAt
  };
}

function deserializeSession(payload) {
  return {
    status: payload.status || "completed",
    durationMinutes: Number(payload.duration_minutes ?? payload.durationMinutes ?? 25),
    strategyUsed: payload.strategy_used ?? payload.strategyUsed ?? "spaced",
    cognitiveLoadAvg: Number(payload.cognitive_load_avg ?? payload.cognitiveLoadAvg ?? 60),
    attentionScore: Number(payload.attention_score ?? payload.attentionScore ?? 75),
    startTime: payload.start_time ? new Date(payload.start_time) : new Date(),
    endTime: payload.end_time ? new Date(payload.end_time) : null,
    notes: payload.notes || ""
  };
}

function serializeProfile(item, user) {
  if (!item) {
    return null;
  }

  return {
    id: String(item._id),
    user_email: user.email,
    attention_span: item.attentionSpan ?? 50,
    memory_retention: item.memoryRetention ?? 50,
    learning_speed: item.learningSpeedScore ?? 50,
    preferred_content_type: item.preferredContentType || "mixed",
    optimal_session_duration: item.optimalSessionDuration ?? item.preferredSessionDurationMinutes ?? 25,
    cognitive_load_threshold: item.cognitiveLoadThreshold ?? 70,
    peak_learning_hours: item.peakLearningHours || [],
    interaction_patterns: item.interactionPatterns || {},
    created_date: item.createdAt,
    updated_date: item.updatedAt
  };
}

function deserializeProfile(payload) {
  const attentionSpan = Number(payload.attention_span ?? payload.attentionSpan ?? 50);
  const memoryRetention = Number(payload.memory_retention ?? payload.memoryRetention ?? 50);
  const learningSpeedScore = Number(payload.learning_speed ?? payload.learningSpeedScore ?? 50);
  const cognitiveLoadThreshold = Number(payload.cognitive_load_threshold ?? payload.cognitiveLoadThreshold ?? 70);
  const optimalSessionDuration = Number(payload.optimal_session_duration ?? payload.optimalSessionDuration ?? 25);

  return {
    attentionSpan,
    attentionSpanMinutes: Math.max(10, Math.round(attentionSpan / 2)),
    memoryRetention,
    memoryRetentionScore: Math.max(0, Math.min(1, memoryRetention / 100)),
    learningSpeedScore,
    learningSpeed: learningSpeedScore >= 67 ? "fast" : learningSpeedScore <= 33 ? "slow" : "medium",
    preferredContentType: payload.preferred_content_type ?? payload.preferredContentType ?? "mixed",
    preferredContentTypes: (() => {
      const preferred = payload.preferred_content_type ?? payload.preferredContentType ?? "mixed";
      return preferred === "mixed" ? ["text", "video", "quiz", "interactive"] : [preferred];
    })(),
    preferredSessionDurationMinutes: optimalSessionDuration,
    optimalSessionDuration,
    cognitiveLoadThreshold,
    cognitiveLoadTolerance: cognitiveLoadThreshold >= 67 ? "high" : cognitiveLoadThreshold <= 33 ? "low" : "medium",
    peakLearningHours: payload.peak_learning_hours ?? payload.peakLearningHours ?? [],
    interactionPatterns: payload.interaction_patterns ?? payload.interactionPatterns ?? {}
  };
}

function serializeGamification(item, user) {
  if (!item) {
    return null;
  }

  return {
    id: String(item._id),
    user_email: user?.email || "",
    user_name: user?.name || user?.full_name || "Learner",
    xp: item.xp,
    level: item.level || getLevelFromXP(item.xp || 0),
    badges: item.badges || [],
    streak_days: item.streakDays,
    last_activity_date: item.lastActivityDate,
    total_content_completed: item.totalContentCompleted,
    total_sessions: item.totalSessions,
    daily_challenge_completed: item.dailyChallengeCompleted,
    daily_challenge_date: item.dailyChallengeDate,
    daily_challenges_completed_count: item.dailyChallengesCompletedCount || 0,
    created_date: item.createdAt,
    updated_date: item.updatedAt
  };
}

function deserializeGamification(payload) {
  const xp = Number(payload.xp ?? 0);
  return {
    xp,
    badges: payload.badges || [],
    streakDays: Number(payload.streak_days ?? payload.streakDays ?? 0),
    lastActivityDate: payload.last_activity_date ? new Date(payload.last_activity_date) : null,
    totalContentCompleted: Number(payload.total_content_completed ?? payload.totalContentCompleted ?? 0),
    totalSessions: Number(payload.total_sessions ?? payload.totalSessions ?? 0),
    dailyChallengeCompleted: Boolean(payload.daily_challenge_completed ?? payload.dailyChallengeCompleted),
    dailyChallengeDate: payload.daily_challenge_date ? new Date(payload.daily_challenge_date) : null,
    dailyChallengesCompletedCount: Number(
      payload.daily_challenges_completed_count ?? payload.dailyChallengesCompletedCount ?? 0
    ),
    level: Number(payload.level ?? getLevelFromXP(xp))
  };
}

function serializeFeedback(item) {
  if (!item) {
    return null;
  }

  return {
    id: String(item._id),
    user_email: "",
    content_id: item.contentId ? String(item.contentId) : null,
    session_id: item.sessionId ? String(item.sessionId) : null,
    rating: item.rating,
    difficulty_perceived: item.difficultyPerceived,
    pace_feedback: item.paceFeedback,
    content_helpful: item.contentHelpful,
    comments: item.comments,
    created_date: item.createdAt,
    updated_date: item.updatedAt
  };
}

function deserializeFeedback(payload) {
  return {
    contentId: payload.content_id || null,
    sessionId: payload.session_id || null,
    rating: Number(payload.rating ?? 0),
    difficultyPerceived: payload.difficulty_perceived || "",
    paceFeedback: payload.pace_feedback || "",
    contentHelpful: payload.content_helpful ?? null,
    comments: payload.comments || ""
  };
}

function isSameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function calculateStreakDays(activityDates) {
  if (!activityDates.length) {
    return 0;
  }

  const normalized = Array.from(
    new Set(
      activityDates.map((date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      )
    )
  ).sort((first, second) => second - first);

  const today = new Date();
  const todayValue = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayValue = todayValue - 86400000;

  if (normalized[0] !== todayValue && normalized[0] !== yesterdayValue) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index - 1] - normalized[index] === 86400000) {
      streak += 1;
    } else {
      break;
    }
  }

  return normalized[0] === yesterdayValue ? streak - 1 : streak;
}

function getLevelFromXP(xp) {
  if (xp >= 1500) {
    return 6;
  }
  if (xp >= 1000) {
    return 5;
  }
  if (xp >= 600) {
    return 4;
  }
  if (xp >= 300) {
    return 3;
  }
  if (xp >= 100) {
    return 2;
  }
  return 1;
}

function deriveBadges({ completedCount, streakDays, level, dailyChallengesCompletedCount, sessions, progress }) {
  const badges = [];

  if (completedCount >= 1) badges.push("first_step");
  if (completedCount >= 5) badges.push("content_5");
  if (completedCount >= 10) badges.push("content_10");
  if (streakDays >= 3) badges.push("streak_3");
  if (streakDays >= 7) badges.push("streak_7");
  if (level >= 3) badges.push("level_3");
  if (level >= 5) badges.push("level_5");
  if (dailyChallengesCompletedCount >= 5) badges.push("daily_5");
  if (progress.some((item) => Number(item.bestQuizScore || 0) === 100)) badges.push("quiz_ace");
  if (sessions.some((item) => Number(item.durationMinutes || 0) > 0 && Number(item.durationMinutes || 0) <= 5)) {
    badges.push("speed_demon");
  }

  return badges;
}

function handleServerError(response, error) {
  console.error(error);
  response.status(500).json({ message: "Internal server error" });
}

function buildAssistantReply(message, profile) {
  const extractedQuestion = (message.match(/Student's question:\s*(.+)$/ims) || [])[1]?.trim() || message;
  const lowered = extractedQuestion.toLowerCase();
  const sessionLength = profile?.preferredSessionDurationMinutes || 25;
  const load = profile?.cognitiveLoadTolerance || "medium";
  const speed = profile?.learningSpeed || "medium";
  const attention = profile?.attentionSpan ?? 50;
  const memory = profile?.memoryRetention ?? 50;

  if (lowered.includes("profile") || lowered.includes("improv")) {
    return `Use ${sessionLength}-minute study blocks, keep your difficulty progression aligned with a ${speed} learning pace, and avoid stacking too many high-load topics in one sitting because your current load tolerance is ${load}. With attention around ${attention}% and memory around ${memory}%, focus on one concept, do a short retrieval check, then log the session so the recommendations improve. Which part of your profile do you want to improve first?`;
  }

  if (lowered.includes("quiz") || lowered.includes("exam")) {
    return `Switch to a retrieval-first routine: review one lesson, answer 3 to 5 recall questions without notes, then revisit the explanation. For your profile, shorter repeated sessions will work better than one long cram block. If you want, I can also give you a simple pre-quiz routine to raise your score.`;
  }

  if (lowered.includes("focus") || lowered.includes("concentr")) {
    return `Reduce each session to a single target outcome, keep the timer fixed at ${sessionLength} minutes, and start with medium-load content before moving to harder material. If attention drops, stop and begin the next session later instead of extending the current one. Do you want a focus plan for today or a longer weekly routine?`;
  }

  if (lowered.includes("strategy") || lowered.includes("study plan")) {
    return `Right now your best fit is a ${speed} pace with sessions around ${sessionLength} minutes. Start with content that matches your preferred format, finish with a quick quiz or summary, and keep harder topics separate when cognitive load feels high. If you tell me the topic you are studying, I can turn that into a step-by-step plan.`;
  }

  if (lowered.includes("memory") || lowered.includes("retain")) {
    return `To improve retention, study one small concept at a time, close the notes, and recall the idea in your own words after 5 minutes and again later in the day. Your current profile suggests repetition and short retrieval checks will help more than one long passive session. Want me to give you a 10-minute memory drill?`;
  }

  return `Based on your current profile, keep sessions around ${sessionLength} minutes, start with medium-complexity material, and use a review cycle that matches your ${speed} learning speed. I can help with focus, quizzes, memory retention, study strategies, or your cognitive profile. What would you like to improve next?`;
}

async function bootstrap() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  await connectToDatabase(process.env.MONGODB_URI);
  await ensureAdminUser();
  await seedContent();

  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
