const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const STORAGE_KEY = "cpdals-auth";

function getSession() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setSession(session) {
  if (!session?.token || !session?.user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

async function apiRequest(path, options = {}) {
  const session = getSession();
  const headers = {
    "Content-Type": "application/json",
    ...(session.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return payload;
}

function sortItems(items, sortField) {
  if (!sortField) {
    return items;
  }

  const descending = sortField.startsWith("-");
  const key = descending ? sortField.slice(1) : sortField;
  return [...items].sort((first, second) => {
    const a = first[key];
    const b = second[key];
    if (a === b) {
      return 0;
    }
    if (a == null) {
      return 1;
    }
    if (b == null) {
      return -1;
    }
    if (a > b) {
      return descending ? -1 : 1;
    }
    return descending ? 1 : -1;
  });
}

function filterItems(items, filters = {}) {
  const ignoredKeys = new Set(["user_email", "user_name"]);
  return items.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      if (value == null || value === "") {
        return true;
      }
      if (ignoredKeys.has(key)) {
        return true;
      }
      return String(item[key]) === String(value);
    })
  );
}

function buildEntityClient(basePath) {
  return {
    async list(sortField, limit) {
      const items = await apiRequest(basePath);
      const sorted = sortItems(items, sortField);
      return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
    },
    async filter(filters = {}, sortField, limit) {
      if (filters.id) {
        const item = await apiRequest(`${basePath}/${filters.id}`);
        return item ? [item] : [];
      }

      const items = await apiRequest(basePath + buildQuery(filters));
      const sorted = sortItems(filterItems(items, filters), sortField);
      return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
    },
    async create(data) {
      const payload = await apiRequest(basePath, { method: "POST", body: data });
      return payload.item || payload;
    },
    async update(id, data) {
      const payload = await apiRequest(`${basePath}/${id}`, { method: "PUT", body: data });
      return payload.item || payload;
    },
    async delete(id) {
      return apiRequest(`${basePath}/${id}`, { method: "DELETE" });
    }
  };
}

function buildQuery(filters) {
  const params = new URLSearchParams();
  if (filters.content_id) {
    params.set("contentId", filters.content_id);
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

function deriveStrategyResponse(prompt) {
  const text = prompt.toLowerCase();
  const attention = Number((prompt.match(/Attention Span: (\d+)/i) || [])[1] || 50);
  const duration = Number((prompt.match(/Optimal Session Duration: (\d+)/i) || [])[1] || 25);
  const score = Number((prompt.match(/Average quiz score: (\d+)/i) || [])[1] || 60);
  const strategyName = attention < 45 ? "Spaced Repetition" : attention > 70 ? "Intensive Focus" : score >= 75 ? "Balanced Review" : "Guided Reinforcement";
  const recommendedContentType = text.includes("Preferred Content Type: video") ? "video with recap quizzes" : text.includes("Preferred Content Type: text") ? "reading with short recall checks" : "mixed lessons with quizzes";

  return {
    strategy_name: strategyName,
    strategy_description:
      attention < 45
        ? "Use shorter study blocks with quick retrieval checks between topics to reduce overload and keep recall active."
        : score < 60
        ? "Keep each session focused on one concept, follow it with a short quiz, and revisit weak areas before moving on."
        : "Use focused sessions on one concept at a time, then finish with a short recap or quiz to reinforce retention.",
    recommended_content_type: recommendedContentType,
    session_advice: `Keep sessions close to ${duration} minutes and stop before attention drops noticeably.`,
    actionable_tip: "After each topic, write a two-line summary from memory before moving to the next item."
  };
}

function deriveProfileUpdateResponse(prompt) {
  const score = Number((prompt.match(/Quiz score: (\d+)/i) || [])[1] || 70);
  const load = Number((prompt.match(/Cognitive Load Threshold: (\d+)/i) || [])[1] || 70);
  const memory = Number((prompt.match(/Memory Retention: (\d+)/i) || [])[1] || 50);
  const attention = Number((prompt.match(/Attention Span: (\d+)/i) || [])[1] || 50);
  const speed = Number((prompt.match(/Learning Speed: (\d+)/i) || [])[1] || 50);
  const duration = Number((prompt.match(/Estimated duration: (\d+)/i) || [])[1] || 20);
  const contentType = (prompt.match(/Content type: ([^\n]+)/i) || [])[1]?.toLowerCase() || "";
  const difficulty = (prompt.match(/Content difficulty: ([^\n]+)/i) || [])[1]?.toLowerCase() || "";

  const delta = score >= 80 ? 3 : score < 50 ? -3 : 1;
  return {
    attention_span: Math.max(0, Math.min(100, attention + (duration <= 15 ? 2 : duration >= 35 ? -1 : 1) + (contentType.includes("video") ? 1 : 0))),
    memory_retention: Math.max(0, Math.min(100, memory + delta)),
    learning_speed: Math.max(0, Math.min(100, speed + (score >= 80 ? 1 : score < 50 ? -2 : 0) + (difficulty.includes("advanced") && score >= 70 ? 1 : 0))),
    cognitive_load_threshold: Math.max(0, Math.min(100, load + (score >= 80 ? 1 : 0) + (difficulty.includes("advanced") ? 1 : 0)))
  };
}

export const base44 = {
  auth: {
    async me() {
      const session = getSession();
      if (!session.token) {
        const error = new Error("Authentication required");
        error.status = 401;
        throw error;
      }

      try {
        const payload = await apiRequest("/api/auth/me");
        const nextSession = { token: session.token, user: payload.user };
        setSession(nextSession);
        return payload.user;
      } catch (error) {
        setSession(null);
        throw error;
      }
    },
    logout(redirectUrl) {
      setSession(null);
      if (redirectUrl !== undefined) {
        window.location.href = "/";
      }
    },
    redirectToLogin() {
      window.location.href = "/";
    }
  },
  entities: {
    Content: buildEntityClient("/api/compat/content"),
    UserProgress: buildEntityClient("/api/compat/progress"),
    LearningSession: buildEntityClient("/api/compat/sessions"),
    CognitiveProfile: buildEntityClient("/api/compat/cognitive-profile"),
    Gamification: {
      ...buildEntityClient("/api/compat/gamification"),
      async list(sortField, limit) {
        const items = await apiRequest("/api/compat/gamification/all");
        const sorted = sortItems(items, sortField);
        return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
      }
    },
    Feedback: buildEntityClient("/api/compat/feedback")
  },
  integrations: {
    Core: {
      async InvokeLLM({ prompt, response_json_schema }) {
        if (response_json_schema?.properties?.strategy_name) {
          return deriveStrategyResponse(prompt);
        }

        if (response_json_schema?.properties?.attention_span) {
          return deriveProfileUpdateResponse(prompt);
        }

        const reply = await apiRequest("/api/assistant", {
          method: "POST",
          body: { message: prompt }
        });
        return reply.reply;
      }
    }
  }
};
