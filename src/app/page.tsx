import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="bg-background flex min-h-(--noheader-screenheight) flex-col items-center justify-center px-4 py-8">
      <section className="rounded-base shadow-shadow w-full max-w-2xl bg-white p-8 text-center">
        <h1 className="font-heading mb-4 text-3xl">
          Welcome to <span className="text-main font-bold">Tactlab</span>
        </h1>
        <p className="text-foreground mb-6 text-lg">
          Analyze your CS2 gameplay with AI-powered insights.
          <br />
          Upload your videos, track your progress, and rank up!
        </p>
        <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/app/dashboard" className={buttonVariants({ size: 'lg', className: 'w-full sm:w-auto' })}>
            Go to Dashboard
          </Link>
          <Link
            href="https://github.com/arithefirst/tactlab"
            target="_blank"
            rel="noopener"
            className={buttonVariants({ variant: 'neutral', size: 'lg', className: 'w-full sm:w-auto' })}
          >
            GitHub
          </Link>
        </div>
      </section>
      <footer className="mt-8 text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Tactlab. Powered by Twelvelabs & Clerk.
      </footer>
    </main>
  );
}
