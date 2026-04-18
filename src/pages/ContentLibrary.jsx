import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, PlayCircle, FileText, HelpCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { useSearchParams } from "react-router-dom";

import ContentCard from '../components/learning/ContentCard';

export default function ContentLibrary() {
  const [user, setUser] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(() => searchParams.get('type') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState(() => searchParams.get('difficulty') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'all');

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: content, isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.Content.list('order_index', 100),
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const progressMap = progress?.reduce((acc, p) => {
    acc[p.content_id] = p;
    return acc;
  }, {}) || {};

  const categories = useMemo(
    () => [...new Set(content?.map(c => c.category).filter(Boolean))],
    [content]
  );

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedType(searchParams.get('type') || 'all');
    setSelectedDifficulty(searchParams.get('difficulty') || 'all');
    setSelectedCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (searchQuery) nextParams.set('search', searchQuery);
    if (selectedType !== 'all') nextParams.set('type', selectedType);
    if (selectedDifficulty !== 'all') nextParams.set('difficulty', selectedDifficulty);
    if (selectedCategory !== 'all') nextParams.set('category', selectedCategory);
    setSearchParams(nextParams, { replace: true });
  }, [searchQuery, selectedType, selectedDifficulty, selectedCategory, setSearchParams]);

  const filteredContent = content?.filter(c => {
    const matchesSearch = !searchQuery || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || c.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || c.difficulty_level === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesType && matchesDifficulty && matchesCategory;
  }) || [];

  const contentTypes = [
    { value: 'all', label: 'All', icon: BookOpen },
    { value: 'video', label: 'Videos', icon: PlayCircle },
    { value: 'text', label: 'Reading', icon: FileText },
    { value: 'quiz', label: 'Quizzes', icon: HelpCircle },
    { value: 'interactive', label: 'Interactive', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">Content Library</h1>
          <p className="text-slate-500 mt-1">Explore all available learning materials</p>
        </motion.div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white border-slate-200"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Type Tabs */}
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="bg-white border h-12 p-1">
              {contentTypes.map(type => (
                <TabsTrigger 
                  key={type.value} 
                  value={type.value}
                  className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                >
                  <type.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No content found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((item, index) => (
              <ContentCard
                key={item.id}
                content={item}
                progress={progressMap[item.id]}
                index={index}
                onClick={() => {
                  const nextParams = new URLSearchParams();
                  nextParams.set('contentId', item.id);
                  if (searchQuery) nextParams.set('search', searchQuery);
                  if (selectedType !== 'all') nextParams.set('type', selectedType);
                  if (selectedDifficulty !== 'all') nextParams.set('difficulty', selectedDifficulty);
                  if (selectedCategory !== 'all') nextParams.set('category', selectedCategory);
                  window.location.href = `${createPageUrl('Learn')}?${nextParams.toString()}`;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
