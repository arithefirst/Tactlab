import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Gamepad2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">TactLab</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <Button size="sm">Start Analyzing</Button>
            </div>
          </nav>
        </div>
      </header>
  )
}