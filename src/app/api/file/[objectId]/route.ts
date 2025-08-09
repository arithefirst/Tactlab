import * as Minio from 'minio';
import { notFound } from 'next/navigation';
import { NextRequest } from 'next/server';
import { Readable } from 'stream';

const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT!,
  port: 9000,
  useSSL: false,
  accessKey: process.env.S3_ACCESSKEY,
  secretKey: process.env.S3_SECRETKEY,
});

// converts Node readable to a web readable stream
// so it can be sent as the response body
function readableToReadableStream(readable: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      readable.on('data', (chunk: unknown) => {
        controller.enqueue(chunk);
      });
      readable.on('end', () => {
        controller.close();
      });
      readable.on('error', (err: Error) => {
        controller.error(err);
      });
    },
  });
}

// this route can be unprotected because of our double-uuid filenames,
// since it is statistically improbable that a person is able to find even
// one file before the heat death of the universe or something lol

export async function GET(req: NextRequest, { params }: { params: Promise<{ objectId: string }> }) {
  try {
    const { objectId } = await params;

    // check that the object exists and acquire an stream
    const stat = await minioClient.statObject('videos', objectId);
    const objectStream = await minioClient.getObject('videos', objectId);

    // send the stream as the res
    return new Response(readableToReadableStream(objectStream), {
      headers: {
        'Content-Type': stat.metaData?.['content-type'] || 'application/octet-stream',
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (e) {
    // @ts-expect-error expect e to be of type unknown
    if (e.code && e.code === 'NotFound') {
      notFound();
    } else {
      console.error(`Error in file api: ${e}`);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
