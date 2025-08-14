'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Gamepad2, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const path = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background sticky top-0 z-50 border-b backdrop-blur-sm dark:bg-slate-900/80">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className={'flex items-center justify-center ' + buttonVariants({ size: 'sm' })}>
            <Gamepad2 className="h-5! w-5!" />
            TACTLAB
          </Link>
          <div className="hidden items-center space-x-6 md:flex">
            <SignedOut>
              <SignInButton>
                <Button size="sm">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Create your Account</Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              {!path.includes('/app/') && (
                <Link href="/app/dashboard" className={buttonVariants({ size: 'sm' })}>
                  Dashboard
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
          <div className="flex items-center md:hidden">
            <SignedIn>
              <div className="mr-4">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        'w-9! h-9! border-2 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-md',
                    },
                  }}
                />
              </div>
            </SignedIn>
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </nav>
        {isMenuOpen && (
          <div className="mt-4 flex flex-col gap-2 md:hidden">
            <SignedOut>
              <SignInButton>
                <Button size="sm" className="w-full justify-center">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="w-full justify-center">
                  Create your Account
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              {!path.includes('/app/') && (
                <Link
                  href="/app/dashboard"
                  className={buttonVariants({ size: 'sm', className: 'w-full justify-center' })}
                >
                  Dashboard
                </Link>
              )}
            </SignedIn>
          </div>
        )}
      </div>
    </header>
  );
}
