import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Gamepad2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <Gamepad2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">TactLab</span>
          </div>
          <div className="hidden items-center space-x-6 md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              How It Works
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Pricing
            </a>
            <SignedOut>
              <SignInButton>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Start Analyzing</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button size="sm">Upload Gameplay</Button>
              <UserButton />
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
}
