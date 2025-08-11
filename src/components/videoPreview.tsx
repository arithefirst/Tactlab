'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getVideoThumbnail } from '@/lib/actions/getVideoThumbnail';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Video {
  objectId: string;
  owner: string;
  createdAt: Date;
  tlVideoId: string | null;
  ogFilename: string;
  thumbnail: string | null;
}

export function VideoPreview({ video, href }: { video: Video; href: string }) {
  const [thumbnailURL, setThumbnailURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    async function fetchThumbnail() {
      try {
        setIsLoading(true);
        setHasError(false);
        const url = await getVideoThumbnail(`${window.location.origin}/api/file/${video.objectId}`);
        setThumbnailURL(url);
      } catch (error) {
        console.error('Failed to fetch thumbnail:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (!video.thumbnail) {
      fetchThumbnail();
    } else {
      setThumbnailURL(video.thumbnail);
      setIsLoading(false);
    }
  }, [video.objectId, video.thumbnail]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="grid grid-cols-3 gap-4 px-4">
          <Skeleton className="aspect-video w-full rounded-md" />
          <div className="col-span-2 flex flex-col justify-center space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-px w-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Link href={href} className="contents">
      <Card className="hover:translate-x-boxShadowX hover:translate-y-boxShadowY transition-all hover:shadow-none">
        <div className="2 grid grid-cols-3 gap-4 px-4">
          <div className="border-border relative aspect-video overflow-hidden rounded-md border-2">
            {hasError || !thumbnailURL ? (
              <div className="bg-secondary-background text-foreground/60 flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 text-2xl">🎥</div>
                  <div className="text-sm">No preview</div>
                </div>
              </div>
            ) : (
              <img
                src={thumbnailURL}
                alt={`Thumbnail for ${video.ogFilename}`}
                className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
              />
            )}
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
  );
}
