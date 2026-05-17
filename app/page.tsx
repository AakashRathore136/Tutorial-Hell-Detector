import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TerminalSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-background to-muted/20">
      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-8">
        Brutally Honest AI Analysis
      </div>
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl">
        Stop watching. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
          Start building.
        </span>
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
        Are you trapped in Tutorial Hell? Find out your exact score, get a brutal reality check, and receive a 7-day execution plan to break free.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/analyze">
          <Button size="lg" className="w-full sm:w-auto font-semibold group h-12 px-8">
            Analyze My Habits
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <Link href="/history">
          <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8">
            View History
          </Button>
        </Link>
      </div>
      
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl w-full text-left">
        <div className="p-6 rounded-2xl bg-card border shadow-sm transition-all hover:shadow-md">
          <TerminalSquare className="h-8 w-8 mb-4 text-red-500" />
          <h3 className="font-bold text-lg mb-2">Harsh Diagnosis</h3>
          <p className="text-muted-foreground text-sm">Get a brutally honest assessment of your recent learning and coding habits.</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border shadow-sm transition-all hover:shadow-md">
          <TerminalSquare className="h-8 w-8 mb-4 text-orange-500" />
          <h3 className="font-bold text-lg mb-2">Detailed Metrics</h3>
          <p className="text-muted-foreground text-sm">See your exact Tutorial Hell Score, Builder Score, and Burnout Risk.</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border shadow-sm transition-all hover:shadow-md">
          <TerminalSquare className="h-8 w-8 mb-4 text-green-500" />
          <h3 className="font-bold text-lg mb-2">Actionable Plan</h3>
          <p className="text-muted-foreground text-sm">Receive a custom 7-day recovery plan and tailored project ideas.</p>
        </div>
      </div>
    </div>
  );
}
