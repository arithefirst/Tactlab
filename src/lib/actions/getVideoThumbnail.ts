'use server';

import { auth } from '@clerk/nextjs/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getVideoThumbnail(url: string): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required. Please sign in to continue.');
  }

  // grabs an early frame from the video to use as a thumbnail
  const command = `timeout 30 ffmpeg -i "${url}" -ss 00:00:01 -vframes 1 -f image2pipe -vcodec png -y - 2>/dev/null | base64 -w 0`;

  try {
    const { stdout } = await execAsync(command);

    if (!stdout || stdout.trim().length === 0) {
      throw new Error('No thumbnail data generated - video may be invalid or inaccessible');
    }

    const base64Data = stdout.trim();
    return `data:image/png;base64,${base64Data}`;
  } catch (error) {
    console.error('FFmpeg error:', error);
    throw new Error(`Failed to generate video thumbnail: ${error}`);
  }
}
