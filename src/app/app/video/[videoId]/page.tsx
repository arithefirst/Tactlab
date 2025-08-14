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
    <main className="flex min-h-(--noheader-screenheight) flex-col p-2 sm:p-4">
      <div className="mb-4">
        <h1 className="text-lg font-semibold sm:text-xl">{video.ogFilename}</h1>
        <p className="text-sm text-gray-600">Video Analysis</p>
      </div>

      <div className="flex flex-col gap-4 md:h-full md:flex-grow lg:flex-row">
        <div className="flex items-center">
          <VideoPlayer videoSrc={`/api/file/${video.objectId}`} />
        </div>

        <div className="min-h-0 w-full flex-grow lg:w-3/5">
          <Tabs
            defaultValue="analysis"
            className="shadow-shadow flex h-full flex-col rounded-lg border bg-white p-4"
          >
            <TabsList className="grid w-full grid-cols-3 gap-2 px-2">
              <TabsTrigger
                value="analysis"
                className="hover:border-border border-background cursor-pointer border"
              >
                Analysis
              </TabsTrigger>
              <TabsTrigger
                value="timestamps"
                className="hover:border-border border-background cursor-pointer border"
              >
                Timestamps
              </TabsTrigger>
              <TabsTrigger value="chat" className="hover:border-border border-background cursor-pointer border">
                Chat
              </TabsTrigger>
            </TabsList>
            <TabsContent value="analysis" className="bg-background rounded-base flex-1 overflow-auto border-2 p-2">
              Woah, analysis!
            </TabsContent>
            <TabsContent
              value="timestamps"
              className="bg-background rounded-base flex-1 overflow-auto border-2 p-2"
            >
              Woah, timestamps!
            </TabsContent>
            <TabsContent value="chat" className="bg-background rounded-base flex-1 overflow-auto border-2 p-2">
              Woah, chat!
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
