'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const path = usePathname();

  return (
    <header className="bg-background border-b backdrop-blur-sm dark:bg-slate-900/80">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className={'flex items-center justify-center ' + buttonVariants({ size: 'sm' })}>
            <Gamepad2 className="h-5! w-5!" />
            TACTLAB
          </Link>
          <div className="flex items-center space-x-6">
            <SignedOut>
              <SignInButton>
                <Button size="sm">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Create your Account</Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              {path !== '/app/dashboard' && (
                <Link href="/app/dashboard" className={buttonVariants({ size: 'sm' })}>
                  Upload Gameplay
                </Link>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      'w-9! h-9! border-2 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-md',
                  },
                }}
              />
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
}
