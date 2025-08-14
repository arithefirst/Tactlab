'use client';

import { useEffect, useRef } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  isDragging: boolean;
  onSeek: (time: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function VideoProgressBar({
  currentTime,
  duration,
  isDragging,
  onSeek,
  onDragStart,
  onDragEnd,
}: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  // handle mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      const progressBar = progressRef.current;
      if (!progressBar || !duration) return;

      const rect = progressBar.getBoundingClientRect();
      const position = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      const percent = position / rect.width;
      const newTime = percent * duration;

      const clampedTime = Math.max(0, Math.min(newTime, duration));
      onSeek(clampedTime);
    };

    const handleMouseUp = () => {
      onDragEnd();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration, onSeek, onDragEnd]);

  function handleProgressClick(event: React.MouseEvent<HTMLDivElement>) {
    if (isDragging) return;

    const progressBar = progressRef.current;
    if (!progressBar || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const clickPercent = clickPosition / rect.width;
    const newTime = clickPercent * duration;

    const clampedTime = Math.max(0, Math.min(newTime, duration));
    onSeek(clampedTime);
  }

  function handleMouseDown(event: React.MouseEvent) {
    event.preventDefault();

    // Immediately seek to the click position when starting drag
    const progressBar = progressRef.current;
    if (progressBar && duration) {
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = event.clientX - rect.left;
      const clickPercent = clickPosition / rect.width;
      const newTime = clickPercent * duration;
      const clampedTime = Math.max(0, Math.min(newTime, duration));
      onSeek(clampedTime);
    }

    onDragStart();
  }

  function handleProgressMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    // only handle if clicking on the progress bar and not the handle (for jump-drag simeltanous thingy)
    if (event.target === event.currentTarget) {
      handleMouseDown(event);
    }
  }

  const progressPercent = duration > 0 && isFinite(currentTime) ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={progressRef}
      className="relative h-2 cursor-pointer rounded-full bg-gray-200 transition-all hover:bg-gray-300"
      onClick={handleProgressClick}
      onMouseDown={handleProgressMouseDown}
    >
      <div
        className="bg-main pointer-events-none absolute top-0 left-0 h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
      />
      <div
        className="bg-main absolute top-1/2 h-4 w-4 -translate-y-1/2 transform cursor-grab rounded-full hover:scale-110 active:cursor-grabbing"
        style={{ left: `${Math.max(0, Math.min(100, progressPercent))}%`, marginLeft: '-8px' }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
