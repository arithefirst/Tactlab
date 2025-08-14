'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Gamepad2, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background sticky top-0 z-50 w-screen border-b backdrop-blur-sm">
      <div className="w-full px-4 py-4">
        <nav className="flex w-full items-center justify-between">
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
              <Link href="/app/dashboard" className={buttonVariants({ size: 'sm' })}>
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      'w-9! h-9! border-2 border-black shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-md',
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
              isMenuOpen
            </SignedOut>
            <SignedIn>
              <Link
                href="/app/dashboard"
                className={buttonVariants({ size: 'sm', className: 'w-full justify-center' })}
              >
                Dashboard
              </Link>
            </SignedIn>
          </div>
        )}
      </div>
    </header>
  );
}
