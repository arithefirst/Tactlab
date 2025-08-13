'use client';

import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRef, useState } from 'react';

interface Video {
  objectId: string;
  owner: string;
  createdAt: Date;
  tlVideoId: string | null;
  ogFilename: string;
}

export function VideoPreview({ video, href }: { video: Video; href: string }) {
  const { user } = useUser();
  const videoElement = useRef<HTMLVideoElement | null>(null);
  const canvasElement = useRef<HTMLCanvasElement | null>(null);
  const [thumbnailURL, setThumbnailURL] = useState<string | undefined>(undefined);

  function captureThumbnail() {
    const video = videoElement.current;
    const canvas = canvasElement.current;

    if (canvas && video) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        setThumbnailURL(canvas.toDataURL());
        console.log(canvas.toDataURL());
      }
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <>
      <Link href={href} className="contents">
        <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY transition-all hover:shadow-none">
          <div className="2 grid grid-cols-3 gap-4 px-4">
            <div className="border-border relative aspect-video overflow-hidden rounded-md border-2">
              <img
                src={thumbnailURL}
                alt={`Thumbnail for ${video.ogFilename}`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="col-span-2 flex flex-col justify-center space-y-2">
              <h3 className="font-heading line-clamp-2 text-lg leading-tight" title={video.ogFilename}>
                {video.ogFilename}
              </h3>
              <hr></hr>
              <div className="text-foreground/70 space-y-1 text-sm">
                <p>Uploaded {formatDate(video.createdAt)}</p>
                {video.owner && (
                  <p className="text-xs">
                    by <span className="font-bold">{user?.fullName}</span>
                  </p>
                )}
                {video.tlVideoId && <p className="text-foreground/50 font-mono text-xs">ID: {video.tlVideoId}</p>}
              </div>
            </div>
          </div>
        </Card>
      </Link>
      <video
        className="fixed top-0 left-0 -z-100 hidden h-screen w-screen"
        src={`/api/file/${video.objectId}`}
        ref={videoElement}
        onLoadedData={() => captureThumbnail()}
      />
      <canvas className="fixed top-0 left-0 -z-100 hidden h-screen w-screen" ref={canvasElement} />
    </>
  );
}
