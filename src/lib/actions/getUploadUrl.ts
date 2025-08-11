'use server';
import { db } from '@/db';
import { videosTable } from '@/db/schema/videos';
import { auth } from '@clerk/nextjs/server';
import { v4 } from 'uuid';
import { minioClient } from './clients';
import { revalidatePath } from 'next/cache';

export async function getPresignedPutUrl(
  filename: string,
  fileSize: number = 2 ^ 53,
): Promise<{ objectId: string; presignedPutUrl: string }> {
  'use server';

  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required. Please sign in to continue.');
  }

  const MAX_FILE_SIZE = 350 * 1024 * 1024;
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum allowed size is 350MB.`);
  }

  const splitFilename = filename.split('.');

  const exists = await minioClient.bucketExists('videos');
  if (!exists) await minioClient.makeBucket('videos');

  // double UUID v4 puts brute force time at ~10^54 years
  const objectId = `${v4()}-${v4()}.${splitFilename[splitFilename.length - 1]}`;
  const presignedPutUrl = await minioClient.presignedPutObject('videos', objectId, 300);

  // Log the created video the the DB
  await db.insert(videosTable).values({
    ogFilename: filename,
    owner: userId,
    objectId,
  });

  revalidatePath('/dashboard');

  return { objectId, presignedPutUrl };
}
