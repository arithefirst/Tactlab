'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Upload, Video } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface VideoUploadCardProps {
  onSubmit?: (file: File, reset: () => void) => void;
  maxFileSize?: number; // in bytes
  className?: string;
}

export function VideoUploadCard({
  onSubmit,
  className,
  maxFileSize = 350 * 1024 * 1024, // 100MB default
}: VideoUploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'];

  function validateFile(file: File): boolean {
    setError('');

    if (!acceptedFormats.includes(file.type)) {
      setError('Please select a valid video file (MP4, WebM, OGG, MKV, or MOV)');
      return false;
    }

    if (file.size > maxFileSize) {
      setError(`File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`);
      return false;
    }

    return true;
  }

  function handleFile(file: File) {
    if (validateFile(file)) {
      setSelectedVideo(file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }

  function handleRemoveVideo() {
    setSelectedVideo(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  return (
    <Card className={'mx-auto h-full w-full bg-white ' + className}>
      <CardContent className="h-full p-6">
        <div
          className={`relative flex h-full cursor-pointer items-center justify-center rounded-lg border-4 border-dashed p-8 text-center transition-colors ${isDragOver ? 'border-main' : 'border-black'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedVideo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-green-800">
                <Video className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{selectedVideo.name}</p>
                <p className="text-sm text-gray-700">{(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <div className="flex flex-col">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fileInputRef && fileInputRef.current?.files) {
                      if (onSubmit) {
                        try {
                          onSubmit(fileInputRef.current.files[0], handleRemoveVideo);
                        } catch (e) {
                          setError((e as Error).message);
                        }
                        return;
                      }
                    }
                  }}
                >
                  <Upload />
                  Upload File
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveVideo();
                  }}
                  className="mt-2 bg-red-300"
                >
                  <Trash2 className="mt-0.5" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Upload className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <p className={`text-lg font-medium ${isDragOver && 'animate-tilt-twice'}`}>
                  Drop {isDragOver ? "it like it's hot" : 'your video here'}
                </p>
                <p className="text-foreground/80 text-sm">or click to browse files</p>
                <p className="text-foreground/60 text-xs">
                  Supports MP4, WebM, OGG, MKV, MOV up to {Math.round(maxFileSize / (1024 * 1024))}MB
                </p>
              </div>
              <Button className="mt-4">Choose File</Button>
            </div>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
