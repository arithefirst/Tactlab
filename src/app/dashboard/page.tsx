import { Card } from '@/components/ui/card';
import { VideoPreview } from '@/components/videoPreview';
import { VideoUploadCard } from '@/components/videoUploadCard';
import { db } from '@/db';
import { videosTable } from '@/db/schema/videos';
import { auth } from '@clerk/nextjs/server';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const videos = await db
    .select()
    .from(videosTable)
    .where(eq(videosTable.owner, userId))
    .orderBy(desc(videosTable.createdAt));

  return (
    <main className="flex h-(--noheader-screenheight) flex-col p-4">
      <div className="h-fit">
        <h1 className="ml-2 text-xl">Welcome to your dashboard!</h1>
      </div>
      <div className="grid min-h-0 w-full flex-grow grid-cols-5 gap-2 p-2">
        <div className="shadow-shadow rounded-base col-span-2 flex flex-col gap-4 overflow-y-hidden">
          <Card className="flex h-full flex-col gap-4 bg-white p-4 shadow-none">
            <h2 className="flex-shrink-0 text-lg font-semibold">Your Videos</h2>
            <div className="flex min-h-0 flex-grow flex-col gap-2 overflow-y-auto p-2 pr-1">
              {videos.length === 0 ? (
                <p className="py-8 text-center text-gray-500">No videos uploaded yet</p>
              ) : (
                // Add proper HREF when i make the page for individual videos
                videos.map((video, i) => (
                  <div className="-m-2 h-fit w-full p-2" key={`${video.objectId}-${i}`}>
                    <VideoPreview video={video} href="/" />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <VideoUploadCard className="col-span-3" />
      </div>
    </main>
  );
}
