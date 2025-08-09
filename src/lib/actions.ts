'use server';
import * as fs from 'fs';
import * as Minio from 'minio';
import { tmpdir } from 'os';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { TwelveLabs } from 'twelvelabs-js';
import { type TasksCreateResponse } from 'twelvelabs-js/api';
import { v4 } from 'uuid';
import { auth } from '@clerk/nextjs/server';

const tlClient = new TwelveLabs({ apiKey: process.env.TL_API_KEY });
const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT!,
  port: 9000,
  useSSL: false,
  accessKey: process.env.S3_ACCESSKEY,
  secretKey: process.env.S3_SECRETKEY,
});

export async function getPresignedPutUrl(
  filename: string,
  fileSize: number = 2 ^ 53,
): Promise<{ objId: string; presignedPutUrl: string }> {
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
  const objId = `${v4()}-${v4()}.${splitFilename[splitFilename.length - 1]}`;
  const presignedPutUrl = await minioClient.presignedPutObject('videos', objId, 300);

  return { objId, presignedPutUrl };
}

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
