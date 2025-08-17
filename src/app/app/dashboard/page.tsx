import { Card } from '@/components/ui/card';
import { VideoPreview } from '@/components/videoPreview';
import { VideoUploadCard } from '@/components/videoUploadCard';
import { db } from '@/db';
import { videosTable } from '@/db/schema/videos';
import { auth } from '@clerk/nextjs/server';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import ScoreGraph from '@/components/scoreGraph';
import { scoresTable } from '@/db/schema/score';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Tactlab | Dashboard',
  description: 'An AI powered app to analyze your gameplay and help you rank up.',
};

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const [videos, scores] = await Promise.all([
    db.select().from(videosTable).where(eq(videosTable.owner, userId)).orderBy(desc(videosTable.createdAt)),
    db.select().from(scoresTable).where(eq(scoresTable.owner, userId)).orderBy(desc(scoresTable.timestamp)),
  ]);

  const tabClass =
    'shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY cursor-pointer text-xs ' +
    'transition-all hover:shadow-none sm:text-sm bg-white border-border';

  return (
    <main className="flex h-(--noheader-screenheight) flex-col p-2 sm:p-4">
      <div className="h-fit">
        <h1 className="ml-2 text-lg sm:text-xl">Welcome to your dashboard!</h1>
      </div>
      <div className="flex min-h-0 w-full flex-grow flex-col gap-3 p-2 lg:grid lg:grid-cols-5">
        <div className="shadow-shadow rounded-base flex flex-grow flex-col gap-4 overflow-y-hidden lg:col-span-2">
          <Card className="flex h-full flex-col gap-4 bg-white p-3 shadow-none sm:p-4">
            <h2 className="flex-shrink-0 text-base font-semibold sm:text-lg">Your Videos</h2>
            <div className="flex min-h-0 flex-grow flex-col gap-2 overflow-y-auto p-1 pr-0 sm:p-2 sm:pr-1">
              {videos.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500 sm:py-8 sm:text-base">
                  No videos uploaded yet
                </p>
              ) : (
                videos.map((video, i) => (
                  <div className="-m-1 h-fit w-full p-1 sm:-m-2 sm:p-2" key={`${video.objectId}-${i}`}>
                    <VideoPreview video={video} />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        <div className="flex h-full flex-col lg:col-span-3">
          <Tabs defaultValue="upload" className="flex h-full flex-col">
            <TabsList className="shadow-shadow grid w-full grid-cols-2 gap-1 px-1 sm:gap-2 sm:px-2">
              <TabsTrigger value="upload" className={tabClass}>
                Upload Video
              </TabsTrigger>
              <TabsTrigger value="progress" className={tabClass}>
                Track Progress
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="flex-1">
              <VideoUploadCard className="max-h-1/2 md:max-h-none" />
            </TabsContent>
            <TabsContent value="progress" className="flex-1">
              <ScoreGraph scores={scores} className="h-full" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
