'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { VideoUploadCard } from '@/components/videoUploadCard';
import { getPresignedPutUrl, uploadToTwelvelabs } from '@/lib/actions';
import { useUser } from '@clerk/nextjs';
import { DialogTitle } from '@radix-ui/react-dialog';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState('Preparing upload...');
  const [error, setError] = useState<string | null>(null);

  if (isLoaded && !user) {
    router.replace('/');
  }

  async function handleTLUpload(file: File, reset: () => void) {
    setUploadStatus('uploading');
    setError(null);

    try {
      setUploadProgress('Getting upload URL...');
      const { presignedPutUrl, objId } = await getPresignedPutUrl(file.name, file.size);

      setUploadProgress('Uploading file to storage...');
      const res = await fetch(presignedPutUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to upload file: ${res.status} ${res.statusText} - ${errorData}`);
      }

      setUploadProgress('Indexing with Twelve Labs...');
      const { id, videoId } = await uploadToTwelvelabs(objId);
      console.log('Upload successful:', { id, videoId });

      setUploadStatus('success');
      reset();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setUploadStatus('error');
      reset();
    }
  }

  function resetUploadState() {
    setUploadStatus('idle');
    setUploadProgress('Preparing upload...');
    setError(null);
  }

  const isDialogOpen = uploadStatus === 'uploading' || uploadStatus === 'success' || uploadStatus === 'error';

  return !isLoaded ? (
    <div className="fixed top-0 left-0 h-screen w-screen bg-white">
      <Loader2 className="fixed top-1/2 left-1/2 -translate-1/2 animate-spin" />
    </div>
  ) : isSignedIn ? (
    <main className="flex h-(--noheader-screenheight) flex-col p-4">
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

      <div className="h-fit">
        <h1 className="ml-2 text-xl">
          Welcome, <span className="font-bold">{user.fullName}</span>
        </h1>
      </div>
      <div className="grid w-full flex-grow grid-cols-5 gap-2 p-2">
        <Card className="col-span-2 flex items-center justify-center bg-white">
          <span>&quot;Previous Upload Storage&quot; coming soon :D</span>
        </Card>

        <VideoUploadCard className="col-span-3" onSubmit={handleTLUpload} />
      </div>
    </main>
  ) : (
    <></>
  );
}
