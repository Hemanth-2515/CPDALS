export function buildRecommendations(content, progressMap, profile) {
  const speedWeight = profile?.learningSpeed === "fast" ? 1 : profile?.learningSpeed === "slow" ? -1 : 0;
  const loadTarget =
    profile?.cognitiveLoadTolerance === "high"
      ? 8
      : profile?.cognitiveLoadTolerance === "low"
        ? 3
        : 5;

  return [...content]
    .map((item) => {
      const progress = progressMap.get(String(item._id));
      const progressPenalty = progress?.status === "completed" ? 50 : progress?.status === "in_progress" ? 5 : 0;
      const durationDiff = Math.abs((profile?.preferredSessionDurationMinutes || 25) - item.estimatedDuration);
      const loadDiff = Math.abs(loadTarget - item.cognitiveLoadRating);
      const typeBoost = profile?.preferredContentTypes?.includes(item.type) ? 4 : 0;
      const difficultyBoost = item.difficultyLevel === "beginner" ? 2 : item.difficultyLevel === "intermediate" ? 1 : 0;

      return {
        ...item.toObject(),
        score: 100 - durationDiff - loadDiff * 2 + typeBoost + difficultyBoost + speedWeight - progressPenalty
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, 4);
}
