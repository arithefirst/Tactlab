'use client';

import { startAnalysis } from '@/lib/actions/analyze';
import { Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AnalysisTabProps {
  objectId: string;
  onTimestampClick: (time: number) => void;
}

interface AnalysisResult {
  mechanics: {
    start: number;
    summary: string;
  }[];
  strategy: {
    start: number;
    summary: string;
  }[];
}

function formatTime(time: number) {
  if (!isFinite(time) || isNaN(time)) return '0:00';

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function AnalysisTab({ objectId, onTimestampClick }: AnalysisTabProps) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNotReadyDialog, setShowNotReadyDialog] = useState(false);

  const handleStartAnalysis = () => {
    startTransition(async () => {
      setError(null);
      try {
        const analysisResults = await startAnalysis(objectId);
        setResults(analysisResults);
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('video_not_ready')) {
          setShowNotReadyDialog(true);
        } else {
          setError('Failed to analyze footage. Please try again.');
          console.error(e);
        }
      }
    });
  };

  if (results) {
    return (
      <Tabs defaultValue="mechanics" className="flex h-full flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>
        <TabsContent value="mechanics" className="flex-grow overflow-y-auto">
          <div className="space-y-2 p-1">
            {results.mechanics.map((item, index) => (
              <Card
                key={index}
                className="hover:border-main cursor-pointer transition-all"
                onClick={() => onTimestampClick(item.start)}
              >
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">Mechanics Note at {formatTime(item.start)}</CardTitle>
                  <CardDescription className="text-xs">{item.summary}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="strategy" className="flex-grow overflow-y-auto">
          <div className="space-y-2 p-1">
            {results.strategy.map((item, index) => (
              <Card
                key={index}
                className="hover:border-main cursor-pointer transition-all"
                onClick={() => onTimestampClick(item.start)}
              >
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">Strategy Note at {formatTime(item.start)}</CardTitle>
                  <CardDescription className="text-xs">{item.summary}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <>
      <Dialog open={showNotReadyDialog} onOpenChange={setShowNotReadyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Video Not Ready</DialogTitle>
            <DialogDescription>
              The video is still being indexed. Please wait a moment before trying again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowNotReadyDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        {isPending ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-gray-600">Analyzing your gameplay... This may take a few minutes.</p>
          </>
        ) : (
          <>
            <h3 className="font-semibold">Ready to analyze your gameplay?</h3>
            <p className="text-sm text-gray-600">
              Click the button below to start the AI-powered analysis of your video.
            </p>
            <Button onClick={handleStartAnalysis} disabled={isPending}>
              Start Analysis
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </>
        )}
      </div>
    </>
  );
}
