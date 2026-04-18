import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, Trophy, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizComponent({ questions, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correct_answer;

  const upsertAnswer = (collection, nextAnswer) => {
    const existingIndex = collection.findIndex((answer) => answer.questionIndex === nextAnswer.questionIndex);

    if (existingIndex === -1) {
      return [...collection, nextAnswer];
    }

    return collection.map((answer, index) => (index === existingIndex ? nextAnswer : answer));
  };

  const handleSelect = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    setAnswers((previous) =>
      upsertAnswer(previous, {
        questionIndex: currentIndex,
        selected: selectedAnswer,
        correct: isCorrect
      })
    );
  };

  const handleNext = () => {
    const nextAnswers = upsertAnswer(answers, {
      questionIndex: currentIndex,
      selected: selectedAnswer,
      correct: isCorrect
    });

    if (currentIndex < questions.length - 1) {
      setAnswers(nextAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const correctCount = nextAnswers.filter((answer) => answer.correct).length;
      const score = Math.round((correctCount / questions.length) * 100);
      setAnswers(nextAnswers);
      setIsComplete(true);
      onComplete?.(score);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setIsComplete(false);
  };

  if (isComplete) {
    const correctCount = answers.filter((answer) => answer.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-4xl font-bold text-violet-600 mb-4">{score}%</p>
            <p className="text-slate-500 mb-6">
              You got {correctCount} out of {questions.length} questions correct
            </p>
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <Progress value={((currentIndex + 1) / questions.length) * 100} className="w-32 h-2" />
        </div>
        <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          {currentQuestion.options.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                showResult
                  ? index === currentQuestion.correct_answer
                    ? 'border-emerald-500 bg-emerald-50'
                    : index === selectedAnswer
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200'
                  : selectedAnswer === index
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => handleSelect(index)}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  showResult && index === currentQuestion.correct_answer
                    ? 'bg-emerald-500 text-white'
                    : showResult && index === selectedAnswer
                    ? 'bg-red-500 text-white'
                    : selectedAnswer === index
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showResult && index === currentQuestion.correct_answer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                {showResult && index === selectedAnswer && index !== currentQuestion.correct_answer && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {showResult && currentQuestion.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-blue-50 border border-blue-200 mt-4"
          >
            <p className="text-sm text-blue-800">
              <strong>Explanation:</strong> {currentQuestion.explanation}
            </p>
          </motion.div>
        )}

        <div className="flex justify-end pt-4">
          {!showResult ? (
            <Button 
              onClick={handleSubmit} 
              disabled={selectedAnswer === null}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2 bg-violet-600 hover:bg-violet-700">
              {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
