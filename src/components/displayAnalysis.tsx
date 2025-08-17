'use client';

import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';

interface AnalysisItem {
  start: number;
  summary: string;
}

interface AnalysisContentProps {
  type: 'mechanics' | 'strategy';
  items: AnalysisItem[];
  onTimestampClick: (time: number) => void;
}

function formatTime(time: number) {
  if (!isFinite(time) || isNaN(time)) return '0:00';

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function AnalysisContent({ type, items, onTimestampClick }: AnalysisContentProps) {
  const titleCaseType = type.charAt(0).toUpperCase() + type.slice(1);

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">No {type} notes found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-1">
      {items.map((item, index) => (
        <Card
          key={index}
          className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY cursor-pointer bg-white transition-all hover:shadow-none"
          onClick={() => onTimestampClick(item.start)}
        >
          <CardHeader className="p-3">
            <CardTitle className="text-sm">
              {titleCaseType} Note at {formatTime(item.start)}
            </CardTitle>
            <CardDescription className="text-xs">{item.summary}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
