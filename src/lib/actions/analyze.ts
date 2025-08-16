'use server';

import { db } from '@/db';
import { videosTable } from '@/db/schema/videos';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { tlClient } from './clients';

const jsonStructure = `
Return the output strictly as JSON in the following format:

[
{
"start": <start_time_in_seconds>,
"end": <end_time_in_seconds>,
"summary": "<short description of the decision>"
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

Return the output strictly as JSON in the following format:

${jsonStructure}
`;

const analysisResultSchema = z.array(
  z.object({
    start: z.number(),
    end: z.number(),
    summary: z.string(),
  }),
);

function parseResult(input: string | undefined) {
  if (!input) {
    return [];
  }
  try {
    // The tl client sometimes returns it inside a md codeblock
    const jsonString = input.replace(/^```json\s*/, '').replace(/```$/, '');
    const parsed = JSON.parse(jsonString);
    return analysisResultSchema.parse(parsed);
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

export async function startAnalysis(objectId: string) {
  'use server';
  const temperature = 0.2;

  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Authentication required. Please sign in to continue.');
    }

    const videoId = (
      await db
        .select({ videoId: videosTable.tlVideoId })
        .from(videosTable)
        .where(and(eq(videosTable.objectId, objectId), eq(videosTable.owner, userId)))
        .limit(1)
    )[0].videoId;

    if (!videoId) {
      throw new Error('Video does not exist.');
    }

    const mechStream = processStream(videoId, mechanicsPrompt, temperature);
    const stratStream = processStream(videoId, strategyPrompt, temperature);
    const results = await Promise.all([mechStream, stratStream]);

    const mechResults = results[0];
    const stratResults = results[1];

    const parsedMechResults = parseResult(mechResults);
    const parsedStratResults = parseResult(stratResults);

    return { mechanics: parsedMechResults, strategy: parsedStratResults };
  } catch (e) {
    console.error(e);

    // @ts-expect-error "e is of type unknown"
    if (e.rawResponse) {
      // @ts-expect-error "e is of type unknown"
      console.error(e.rawResponse);
    }
    throw e;
  }
}
