'use client';

import { Button } from '@/components/ui/button';
import { VideoProgressBar } from '@/components/ui/video-progress-bar';
import { Pause, Play, VolumeX, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface VideoPlayerProps {
  videoSrc: string;
  className?: string;
  markers?: number[]; // Add this line
}

export interface VideoPlayerRef {
  jumpToTimestamp: (timestamp: number) => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoSrc, className, markers = [] }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMute, setIsMute] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    function jumpToTimestamp(timestamp: number) {
      const video = videoRef.current;
      if (!video || !duration) return;

      const clampedTime = Math.max(0, Math.min(timestamp, duration));
      video.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }

    useImperativeHandle(ref, () => ({
      jumpToTimestamp,
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      let animationFrameId: number;

      function updateTime() {
        if (!isDragging) {
          setCurrentTime(video!.currentTime);
          animationFrameId = requestAnimationFrame(updateTime);
        }
      }

      function handlePlay() {
        setIsPlaying(true);
        animationFrameId = requestAnimationFrame(updateTime);
      }

      function handlePause() {
        setIsPlaying(false);
        cancelAnimationFrame(animationFrameId);
      }

      video.addEventListener('loadedmetadata', () => {
        if (isFinite(video.duration)) {
          setDuration(video.duration);
        }
      });
      video.addEventListener('durationchange', () => {
        if (isFinite(video.duration)) {
          setDuration(video.duration);
        }
      });
      video.addEventListener('ended', () => setIsPlaying(false));
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      if (!isDragging && !video.paused) {
        animationFrameId = requestAnimationFrame(updateTime);
      }

      // Check if duration is already available
      if (isFinite(video.duration)) {
        setDuration(video.duration);
      }

      return () => {
        cancelAnimationFrame(animationFrameId);
        video.removeEventListener('loadedmetadata', () => {
          if (isFinite(video.duration)) {
            setDuration(video.duration);
          }
        });
        video.removeEventListener('durationchange', () => {
          if (isFinite(video.duration)) {
            setDuration(video.duration);
          }
        });
        video.removeEventListener('ended', () => setIsPlaying(false));
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }, [isDragging]);

    async function togglePlay() {
      const video = videoRef.current;
      if (!video) return;

      try {
        if (isPlaying) {
          await video.pause();
        } else {
          await video.play();
        }
      } catch (error) {
        console.error('Error toggling play state:', error);
      }
    }

    function toggleMute() {
      const video = videoRef.current;
      if (!video) return;

      video.muted = !video.muted;
      setIsMute(video.muted);
    }

    function handleSeek(time: number) {
      const video = videoRef.current;
      if (!video) return;

      video.currentTime = time;
      setCurrentTime(time);
    }

    function formatTime(time: number) {
      if (!isFinite(time) || isNaN(time)) return '0:00';

      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
      <div className={className + ' shadow-shadow h-fit w-full overflow-hidden rounded-lg border bg-white'}>
        <div className="relative bg-black">
          <video ref={videoRef} src={videoSrc} className="aspect-video w-full" />
        </div>

        <div className="space-y-4 p-4">
          <VideoProgressBar
            currentTime={currentTime}
            duration={duration}
            isDragging={isDragging}
            onSeek={handleSeek}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            markers={markers}
          />

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <div className="flex gap-2">
              <Button onClick={togglePlay} size="sm">
                {isPlaying ? <Pause /> : <Play />}
              </Button>
              <Button onClick={toggleMute} size="sm">
                {isMute ? <VolumeX /> : <Volume2 />}
              </Button>
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    );
  },
);

VideoPlayer.displayName = 'VideoPlayer';
