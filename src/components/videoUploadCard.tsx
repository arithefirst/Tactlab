'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getPresignedPutUrl } from '@/lib/actions/getUploadUrl';
import { uploadToTwelvelabs } from '@/lib/actions/uploadToTl';
import { DialogTitle } from '@radix-ui/react-dialog';
import { CheckCircle2, Loader2, Trash2, Upload, Video, XCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface VideoUploadCardProps {
  maxFileSize?: number; // in bytes
  className?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function VideoUploadCard({
  className,
  maxFileSize = 350 * 1024 * 1024, // 350MB default
}: VideoUploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState('Preparing upload...');
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

  async function handleUpload() {
    if (!selectedVideo) return;

    setUploadStatus('uploading');
    setError('');

    try {
      setUploadProgress('Getting upload URL...');
      const { presignedPutUrl, objectId } = await getPresignedPutUrl(selectedVideo.name, selectedVideo.size);

      setUploadProgress('Uploading file to storage...');
      const res = await fetch(presignedPutUrl, {
        method: 'PUT',
        body: selectedVideo,
        headers: {
          'Content-Type': selectedVideo.type,
        },
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to upload file: ${res.status} ${res.statusText} - ${errorData}`);
      }

      setUploadProgress('Indexing with Twelve Labs...');
      const { id, videoId } = await uploadToTwelvelabs(objectId);
      console.log('Upload successful:', { id, videoId });

      setUploadStatus('success');
      handleRemoveVideo();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setUploadStatus('error');
      handleRemoveVideo();
    }
  }

  function resetUploadState() {
    setUploadStatus('idle');
    setUploadProgress('Preparing upload...');
    setError('');
  }

  const isDialogOpen = uploadStatus === 'uploading' || uploadStatus === 'success' || uploadStatus === 'error';

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open && uploadStatus !== 'uploading') resetUploadState();
        }}
      >
        <DialogContent className="sm:max-w-md" showClose={uploadStatus !== 'uploading'}>
          <DialogTitle className="sr-only">Upload Status Dialog</DialogTitle>
          {uploadStatus === 'uploading' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <h3 className="text-center text-lg font-medium">{uploadProgress}</h3>
              <p className="text-muted-foreground text-center text-sm">
                Please keep this window open while we process your video.
              </p>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h3 className="text-center text-lg font-medium">Upload Complete!</h3>
              <Button className="mt-2" onClick={resetUploadState}>
                Close
              </Button>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <XCircle className="h-12 w-12 text-red-500" />
              <h3 className="text-center text-lg font-medium">Upload Failed</h3>
              <div className="w-full max-w-sm rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <Button className="mt-2" onClick={resetUploadState}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                      handleUpload();
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
    </>
  );
}
