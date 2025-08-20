'use server';

import { db } from '@/db';
import { videosTable } from '@/db/schema/videos';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { tlClient } from './clients';
import { scoresTable } from '@/db/schema/score';
import { revalidatePath } from 'next/cache';

const jsonStructure = `
Return the output strictly as JSON in the following format:

[
{
"start": <start_time_in_seconds>,
"end": <end_time_in_seconds>,
"summary": "<short description of the decision>",
"score": "<score for the footage>"
}
]`;

const mechanicsPrompt = `
Identify and return all moments where the player makes important strategic decisions or notable misplays. 
Focus on both good and bad examples of positioning choices (movement across the map, holding choke points, rotating),
timing decisions (when to engage, retreat, use abilities, etc), and resource management (ammo, health, energy,
cooldown usage, etc). For each detected event, return:

1. The start timestamp in seconds
2. The end timestamp in seconds
3. A 1–2 sentence summary of the decision and its context, clarifying if it was a good play or a mistake.

In addition, return a score from 0-10000, where 0 is for abysmal performance, and 10000 is perfect with almost no mistakes.

${jsonStructure}
`;

const strategyPrompt = `
Detect and return all moments of high-skill mechanical execution as well as significant mechanical failures.
Focus on both successful and unsuccessful examples of accuracy (precise aim, headshots, missed shots, etc), reaction times
(fast responses to threats, slow reactions), and combos (stringing multiple actions together efficiently, failed combos, etc).
For each detected event, return:

1. The start timestamp in seconds
2. The end timestamp in seconds
3. A 1–2 sentence summary describing the mechanical skill performed and whether it was successful or a failure.

In addition, return a score from 0-10000, where 0 is for abysmal performance, and 10000 is perfect with almost no mistakes.

${jsonStructure}
`;

export interface AnalysisResult {
  mechanics: {
    start: number;
    end: number;
    summary: string;
  }[];
  strategy: {
    start: number;
    end: number;
    summary: string;
  }[];
}

const analysisResultSchema = z.array(
  z.object({
    start: z.number(),
    end: z.number(),
    summary: z.string(),
    score: z.number(),
  }),
);

function parseResult(input: string | undefined) {
  if (!input) {
    return [];
  }
  try {
    const jsonString = input.replace(/^```json\s*/, '').replace(/```$/, '');
    const parsed = JSON.parse(jsonString);
    // Only return start, end, summary (ignore score)
    return analysisResultSchema.parse(parsed).map(({ start, end, summary }) => ({
      start,
      end,
      summary,
    }));
  } catch (e) {
    console.error('Failed to parse analysis result:', e);
    console.error('Raw input:', input);
    return [];
  }
}

async function processStream(videoId: string, prompt: string, temperature: number): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    try {
      let textBuffer = '';
      const stream = await tlClient.analyzeStream({
        videoId,
        prompt,
        temperature,
      });

      for await (const chunk of stream) {
        if (chunk.eventType === 'stream_end') {
          resolve(textBuffer);
          console.log('Stream end');
          return;
        } else if (chunk.eventType === 'text_generation') {
          if ('text' in chunk) {
            textBuffer += chunk.text!;
            console.log(chunk.text!);
          }
        }
      }
    } catch (e) {
      reject(e);
    }
  });
}

function extractScores(input: string | undefined): number[] {
  if (!input) return [];
  try {
    const jsonString = input.replace(/^```json\s*/, '').replace(/```$/, '');
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed.map((item) => (typeof item.score === 'number' ? item.score : 0)) : [];
  } catch {
    return [];
  }
}

export async function startAnalysis(objectId: string): Promise<AnalysisResult> {
  'use server';

  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required. Please sign in to continue.');
  }

  try {
    const [video] = await db
      .select({ videoId: videosTable.tlVideoId, analysis: videosTable.analysis })
      .from(videosTable)
      .where(and(eq(videosTable.objectId, objectId), eq(videosTable.owner, userId)))
      .limit(1);

    if (!video) {
      throw new Error('Video not found or you do not have permission to access it.');
    }

    if (video.analysis) {
      return video.analysis;
    }

    if (!video.videoId) {
      throw new Error('Video has not been processed yet and has no video ID.');
    }

    const temperature = 0.2;
    const [mechResults, stratResults] = await Promise.all([
      processStream(video.videoId, mechanicsPrompt, temperature),
      processStream(video.videoId, strategyPrompt, temperature),
    ]);

    const mechScores = extractScores(mechResults);
    const stratScores = extractScores(stratResults);
    const allScores = [...mechScores, ...stratScores];
    const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

    // Log average score in the db
    await db.insert(scoresTable).values({
      owner: userId,
      score: avgScore,
    });

    const result = { mechanics: parseResult(mechResults), strategy: parseResult(stratResults) };

    // save the result to the db for future access
    await db.update(videosTable).set({ analysis: result }).where(eq(videosTable.objectId, objectId));
    revalidatePath(`/app/video/${objectId}`);

    return result;
  } catch (e) {
    console.error('An error occurred during analysis:', e);
    throw new Error('Failed to analyze video. Please try again later.');
  }
}
