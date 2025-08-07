import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, BarChart3, Brain, Gamepad2, Play, Target, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">      

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6">
            <Brain className="mr-1 h-3 w-3" />
            AI-Powered Gaming Analysis
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-600 dark:from-slate-100 dark:to-blue-400 bg-clip-text text-transparent">
            Level Up Your Gaming with AI Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Upload your gameplay footage and get instant AI-powered insights to improve your performance. 
            Discover your strengths, identify weaknesses, and climb the ranks faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton>
                <Button size="lg" className="group">
                  Upload Your Gameplay
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button size="lg" className="group">
                Upload Your Gameplay
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignedIn>
            <Button variant="outline" size="lg">
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful AI Analysis Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our advanced AI analyzes every aspect of your gameplay to provide actionable insights
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Aim Analysis</CardTitle>
              <CardDescription>
                Track your crosshair placement, reaction times, and accuracy patterns to improve your shooting mechanics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed statistics on your KDA, win rate, economy management, and decision-making patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Tactical Insights</CardTitle>
              <CardDescription>
                AI-powered analysis of your positioning, rotations, and strategic decision-making
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Monitor your improvement over time with detailed progress charts and skill development metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>Multi-Game Support</CardTitle>
              <CardDescription>
                Support for popular competitive games including Valorant, CS2, Overwatch, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle>Custom Training Plans</CardTitle>
              <CardDescription>
                Personalized training recommendations based on your specific weaknesses and goals
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
