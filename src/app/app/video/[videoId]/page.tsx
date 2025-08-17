import { VideoView } from '@/components/videoView';
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

export default async function VideoPage({ params }: { params: Promise<{ videoId: string }> }) {
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

  return <VideoView video={video} />;
}
