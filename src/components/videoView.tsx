'use client';

import { AnalysisResult, startAnalysis } from '@/lib/actions/analyze';
import { CornerUpLeft, Loader2 } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { AnalysisContent } from './displayAnalysis';
import { Button, buttonVariants } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { VideoPlayer, VideoPlayerRef } from './videoPlayer';
import Link from 'next/link';
import ChatUi from './chat';

interface VideoPlayerProps {
  video: {
    objectId: string;
    ogFilename: string;
    owner: string;
    createdAt: Date;
    tlVideoId: string | null;
    thumbnail: string | null;
    analysis: AnalysisResult | null;
  };
}

export function VideoView({ video }: VideoPlayerProps) {
  const playerRef = useRef<VideoPlayerRef>(null);
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<AnalysisResult | null>(video.analysis);
  const [error, setError] = useState<string | null>(null);
  const [showNotReadyDialog, setShowNotReadyDialog] = useState(false);

  const onTimestampClick = (time: number) => {
    playerRef.current?.jumpToTimestamp(time);
  };

  const handleStartAnalysis = () => {
    startTransition(async () => {
      setError(null);
      try {
        const analysisResults = await startAnalysis(video.objectId);
        setResults(analysisResults);
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('Video has not been processed yet')) {
          setShowNotReadyDialog(true);
        } else {
          setError('Failed to analyze footage. Please try again.');
          console.error(e);
        }
      }
    });
  };

  const tabClass =
    'shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY cursor-pointer text-xs ' +
    'transition-all hover:shadow-none sm:text-sm bg-white border-border';

  return (
    <main className="flex h-(--noheader-screenheight) flex-col p-1 sm:p-2 md:p-4">
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

      <div className="flex">
        <Link href="/app/dashboard/" className={buttonVariants({})}>
          <CornerUpLeft />
          Back
        </Link>
        <div className="ml-auto flex flex-col items-end p-2 sm:mb-4 md:my-0">
          <h1 className="truncate text-base font-semibold sm:text-lg md:text-xl">{video.ogFilename}</h1>
          <p className="text-xs text-gray-600 sm:text-sm">Video Analysis</p>
        </div>
      </div>

      <div className="flex h-full min-h-0 w-full flex-col gap-3 px-2 md:px-0 lg:flex-row">
        <div className="flex w-full items-center justify-center lg:w-3/5">
          <VideoPlayer ref={playerRef} videoSrc={`/api/file/${video.objectId}`} />
        </div>

        <div className="mb-2 h-full w-full flex-grow sm:min-h-[400px] lg:w-2/5">
          <div className="shadow-shadow flex h-full flex-col rounded-lg border bg-white p-2 sm:p-4">
            {results ? (
              <Tabs defaultValue="mechanics" className="flex h-full flex-col pb-1!">
                <TabsList className="grid w-full grid-cols-3 gap-1 px-1 sm:gap-2 sm:px-2">
                  <TabsTrigger value="mechanics" className={tabClass}>
                    Mechanics
                  </TabsTrigger>
                  <TabsTrigger value="strategy" className={tabClass}>
                    Strategy
                  </TabsTrigger>
                  <TabsTrigger value="chat" className={tabClass}>
                    Chat
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="mechanics"
                  className="bg-background rounded-base flex-1 overflow-auto border-2 p-1 sm:p-2"
                >
                  <AnalysisContent
                    type="mechanics"
                    items={results.mechanics}
                    onTimestampClick={onTimestampClick}
                  />
                </TabsContent>
                <TabsContent
                  value="strategy"
                  className="bg-background rounded-base flex-1 overflow-auto border-2 p-1 sm:p-2"
                >
                  <AnalysisContent type="strategy" items={results.strategy} onTimestampClick={onTimestampClick} />
                </TabsContent>
                <TabsContent
                  value="chat"
                  className="bg-background rounded-base flex-1 overflow-auto border-2 p-1 sm:p-2"
                >
                  <ChatUi objectId={video.objectId} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                {isPending ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm text-gray-600">
                      Analyzing your gameplay... This may take a few minutes.
                    </p>
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
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
