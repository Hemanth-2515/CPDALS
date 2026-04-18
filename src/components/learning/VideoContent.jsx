import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, CheckCircle2, ArrowLeft } from "lucide-react";

export default function VideoContent({ content, onComplete, onBack }) {
  const getEmbedUrl = (url) => {
    if (!url) return null;
    // Handle YouTube URLs
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([^&?/\\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?rel=0`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(content.content_body);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-red-100 text-red-600">
            <PlayCircle className="w-3 h-3 mr-1" />
            Video
          </Badge>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            {content.estimated_duration} min
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="aspect-video bg-slate-900">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={content.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white/70">
                <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Video content not available</p>
              </div>
            </div>
          )}
        </div>
        <CardHeader>
          <CardTitle className="text-xl">{content.title}</CardTitle>
          <p className="text-slate-500">{content.description}</p>
          {content.content_body && (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={content.content_body}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Open on YouTube
              </a>
              <span className="text-xs text-slate-400">If the embedded player is blocked, open the video directly.</span>
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onComplete} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle2 className="w-4 h-4" />
          Mark as Complete
        </Button>
      </div>
    </div>
  );
}
