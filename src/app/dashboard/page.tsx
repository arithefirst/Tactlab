'use client';
import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  if (isLoaded && !user) {
    router.replace('/');
  }

  return !isLoaded ? (
    <div className="fixed top-0 left-0 h-screen w-screen bg-white">
      <Loader2 className="fixed top-1/2 left-1/2 -translate-1/2 animate-spin" />
    </div>
  ) : isSignedIn ? (
    <main className="flex h-(--noheader-screenheight) flex-col p-4">
      <div className="h-fit">
        <h1 className="ml-2 text-xl">
          Welcome, <span className="font-bold">{user.fullName}</span>
        </h1>
      </div>
      <div className="grid w-full flex-grow grid-cols-5 gap-2 p-2">
        <Card className="col-span-2 flex items-center justify-center">
          <span>&quot;Previous Video&quot; impl coming soon :D</span>
        </Card>
        <Card className="col-span-3 flex items-center justify-center">
          <span>&quot;Previous Video&quot; impl coming soon :D</span>
        </Card>
      </div>
    </main>
  ) : (
    <></>
  );
}
