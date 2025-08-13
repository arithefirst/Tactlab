'use client';

import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface Video {
  objectId: string;
  owner: string;
  createdAt: Date;
  tlVideoId: string | null;
  ogFilename: string;
}

export function VideoPreview({ video, href }: { video: Video; href: string }) {
  const { user } = useUser();

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }

  return (
    <>
      <Link href={href} className="contents">
        <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY transition-all hover:shadow-none">
          <div className="flex flex-col gap-3 p-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-4">
            <div className="border-border relative aspect-video overflow-hidden rounded-md border-2">
              <video className="h-full w-full object-cover" src={`/api/file/${video.objectId}`} />
            </div>
            <div className="flex flex-col justify-center space-y-2 sm:col-span-2">
              <h3
                className="font-heading line-clamp-2 text-base leading-tight sm:text-lg"
                title={video.ogFilename}
              >
                {video.ogFilename}
              </h3>
              <hr></hr>
              <div className="text-foreground/70 space-y-1 text-xs sm:text-sm">
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
    </>
  );
}
