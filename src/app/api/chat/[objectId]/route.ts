import { NextRequest } from 'next/server';
import { TwelveLabs } from 'twelvelabs-js';
import { auth } from '@clerk/nextjs/server';
import { videosTable } from '@/db/schema/videos';
import { db } from '@/db';
import { and, eq } from 'drizzle-orm';

const tlClient = new TwelveLabs({ apiKey: process.env.TL_API_KEY });

export async function POST(req: NextRequest, { params }: { params: Promise<{ objectId: string }> }) {
  const { prompt } = await req.json();
  const { objectId } = await params;

  const { userId } = await auth();
  if (!userId) {
    return new Response('Authentication required. Please sign in to continue.', {
      status: 401,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const [video] = await db
    .select({ videoId: videosTable.tlVideoId })
    .from(videosTable)
    .where(and(eq(videosTable.objectId, objectId), eq(videosTable.owner, userId)))
    .limit(1);

  if (!video?.videoId) {
    return new Response('Video not found or access denied.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const stream = await tlClient.analyzeStream({
    videoId: video.videoId,
    prompt,
    temperature: 0.2,
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.eventType === 'stream_end') {
            controller.close();
            break;
          } else if (chunk.eventType === 'text_generation' && 'text' in chunk) {
            controller.enqueue(encoder.encode(chunk.text!));
          }
        }
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
