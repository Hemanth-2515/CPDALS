import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function TextContent({ content, onComplete, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-600">
            <FileText className="w-3 h-3 mr-1" />
            Reading
          </Badge>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            {content.estimated_duration} min
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{content.title}</CardTitle>
          <p className="text-slate-500">{content.description}</p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate prose-headings:text-slate-900 prose-a:text-blue-600 max-w-none">
            <ReactMarkdown>{content.content_body || 'No content available.'}</ReactMarkdown>
          </div>
        </CardContent>
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
