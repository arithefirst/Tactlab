// Example in a Route Handler
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Authentication required. Please sign in to continue.');
  } else {
    redirect('/app/dashboard/');
  }
}
