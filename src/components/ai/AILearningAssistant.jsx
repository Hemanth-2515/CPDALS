import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';

export default function AILearningAssistant({ cognitiveProfile, recentContent }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI learning assistant powered by CPDALS. I can help explain concepts, suggest study strategies based on your cognitive profile, or answer any questions. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const profileContext = cognitiveProfile ? `
      The student has the following cognitive profile:
      - Attention span: ${cognitiveProfile.attention_span}%
      - Memory retention: ${cognitiveProfile.memory_retention}%
      - Learning speed: ${cognitiveProfile.learning_speed}%
      - Preferred content type: ${cognitiveProfile.preferred_content_type}
      - Optimal session duration: ${cognitiveProfile.optimal_session_duration} minutes
    ` : '';

    const contentContext = recentContent?.length ? `
      Recently studied topics: ${recentContent.map(c => c.title).join(', ')}
    ` : '';

    const conversationContext = messages
      .slice(-4)
      .map((message) => `${message.role === 'user' ? 'Student' : 'Assistant'}: ${message.content}`)
      .join('\n');

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an intelligent learning assistant for CPDALS (Cognitive Process Driven Adaptive Learning System).
You help students learn more effectively by giving personalized advice based on their cognitive profile and recent usage.

${profileContext}
${contentContext}

Recent conversation:
${conversationContext}

Student's question: ${userMessage}

Respond conversationally. Keep it interactive, helpful, and specific. Ask one short follow-up question when useful.`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (requestError) {
      setError('The assistant could not answer just now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'How should I improve my cognitive profile?',
    'Explain my current learning strategy',
    'How can I score better in quizzes?',
  ];

  return (
    <Card className="border-0 shadow-lg flex flex-col h-[420px]">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          AI Learning Assistant
        </CardTitle>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-violet-600" />
                </div>
              )}
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : 'bg-slate-100 text-slate-800 rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-0.5 prose-li:my-0">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 justify-start"
            >
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-violet-600" />
              </div>
              <div className="px-3 py-2 rounded-2xl bg-slate-100 rounded-tl-sm">
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setInput(prompt)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your learning..."
            className="flex-1 h-9 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 h-9 w-9 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    </Card>
  );
}
