import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoPlayer } from '@/components/videoPlayer';
import { db } from '@/db';
import { videosTable } from '@/db/schema/videos';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Tactlab | Video Analysis',
  description: 'AI-powered gameplay analysis',
};

export default async function VideoPage({ params }: { params: { videoId: string } }) {
  const { videoId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const videos = await db
    .select()
    .from(videosTable)
    .where(and(eq(videosTable.objectId, videoId), eq(videosTable.owner, userId)))
    .limit(1);

  if (videos.length === 0) {
    notFound();
  }

  const video = videos[0];

  return (
    <main className="flex h-(--noheader-screenheight) flex-col p-1 sm:p-2 md:p-4">
      <div className="mb-2 px-2 py-2 sm:mb-4 md:my-0">
        <h1 className="truncate text-base font-semibold sm:text-lg md:text-xl">{video.ogFilename}</h1>
        <p className="text-xs text-gray-600 sm:text-sm">Video Analysis</p>
      </div>

      <div className="flex h-full w-full flex-col gap-3 px-2 md:px-0 lg:flex-row">
        <div className="flex w-full items-center justify-center lg:w-3/5">
          <VideoPlayer videoSrc={`/api/file/${video.objectId}`} />
        </div>

        <div className="mb-2 h-full w-full flex-grow sm:min-h-[400px] lg:w-2/5">
          <Tabs
            defaultValue="analysis"
            className="shadow-shadow flex h-full flex-col rounded-lg border bg-white p-2 sm:p-4"
          >
            <TabsList className="grid w-full grid-cols-3 gap-1 px-1 sm:gap-2 sm:px-2">
              <TabsTrigger
                value="analysis"
                className="hover:border-border border-background cursor-pointer border text-xs sm:text-sm"
              >
                Analysis
              </TabsTrigger>
              <TabsTrigger
                value="timestamps"
                className="hover:border-border border-background cursor-pointer border text-xs sm:text-sm"
              >
                Timestamps
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="hover:border-border border-background cursor-pointer border text-xs sm:text-sm"
              >
                Chat
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="analysis"
              className="bg-background rounded-base flex-1 overflow-auto border-2 p-1 sm:p-2"
            >
              Woah, analysis!
            </TabsContent>
            <TabsContent
              value="timestamps"
              className="bg-background rounded-base flex-1 overflow-auto border-2 p-1 sm:p-2"
            >
              Woah, timestamps!
            </TabsContent>
            <TabsContent
              value="chat"
              className="bg-background rounded-base flex-1 overflow-auto border-2 p-1 sm:p-2"
            >
              Woah, chat!
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
