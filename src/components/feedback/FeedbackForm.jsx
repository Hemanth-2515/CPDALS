import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedbackForm({ contentId, sessionId, onSubmit, onSkip }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [difficulty, setDifficulty] = useState(null);
  const [pace, setPace] = useState(null);
  const [helpful, setHelpful] = useState(null);
  const [comments, setComments] = useState('');

  const handleSubmit = () => {
    onSubmit({
      content_id: contentId,
      session_id: sessionId,
      rating,
      difficulty_perceived: difficulty,
      pace_feedback: pace,
      content_helpful: helpful,
      comments,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0 shadow-lg max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">How was this content?</CardTitle>
          <p className="text-sm text-slate-500">Your feedback helps us improve your learning experience</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 mb-3">Overall Rating</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Difficulty Level</p>
            <div className="flex gap-2">
              {[
                { value: 'too_easy', label: 'Too Easy' },
                { value: 'just_right', label: 'Just Right' },
                { value: 'too_hard', label: 'Too Hard' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={difficulty === option.value ? 'default' : 'outline'}
                  size="sm"
                  className={difficulty === option.value ? 'bg-violet-600' : ''}
                  onClick={() => setDifficulty(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Pace */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Learning Pace</p>
            <div className="flex gap-2">
              {[
                { value: 'too_slow', label: 'Too Slow' },
                { value: 'just_right', label: 'Just Right' },
                { value: 'too_fast', label: 'Too Fast' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={pace === option.value ? 'default' : 'outline'}
                  size="sm"
                  className={pace === option.value ? 'bg-violet-600' : ''}
                  onClick={() => setPace(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Helpful */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Was this content helpful?</p>
            <div className="flex gap-3">
              <Button
                variant={helpful === true ? 'default' : 'outline'}
                className={`gap-2 ${helpful === true ? 'bg-emerald-600' : ''}`}
                onClick={() => setHelpful(true)}
              >
                <ThumbsUp className="w-4 h-4" />
                Yes
              </Button>
              <Button
                variant={helpful === false ? 'default' : 'outline'}
                className={`gap-2 ${helpful === false ? 'bg-red-600' : ''}`}
                onClick={() => setHelpful(false)}
              >
                <ThumbsDown className="w-4 h-4" />
                No
              </Button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Additional Comments (optional)</p>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share any thoughts or suggestions..."
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onSkip}>
              Skip
            </Button>
            <Button 
              className="flex-1 bg-violet-600 hover:bg-violet-700" 
              onClick={handleSubmit}
              disabled={!rating}
            >
              Submit Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}