'use server';
import { db } from '@/db';
import { videosTable } from '@/db/schema/videos';
import { auth } from '@clerk/nextjs/server';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { type TasksCreateResponse } from 'twelvelabs-js/api';
import { minioClient, tlClient } from './clients';

export async function uploadToTwelvelabs(objId: string): Promise<TasksCreateResponse> {
  'use server';

  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required. Please sign in to continue.');
  }

  const objStream = await minioClient.getObject('videos', objId);
  const tempPath = join(tmpdir(), `temp-${objId}`);

  try {
    // TO-DO
    // integrate with file api so we can use file urls instead of a local file buffer
    await pipeline(objStream, fs.createWriteStream(tempPath));
    const readStream = fs.createReadStream(tempPath);

    const res = await tlClient.tasks.create({
      enableVideoStream: true,
      videoFile: readStream,
      indexId: process.env.TL_INDEX_ID!,
    });

    await db.update(videosTable).set({ tlVideoId: res.videoId });

    return res;
  } catch (e) {
    throw e;
  } finally {
    // Clean up the temporary file
    fs.unlink(tempPath, (err) => {
      if (err) console.error(`Failed to clean up temporary file ${tempPath}:`, err);
    });
  }
}
