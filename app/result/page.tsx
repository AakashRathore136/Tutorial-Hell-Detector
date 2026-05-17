"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getHistory, HistoryEntry } from "@/lib/history";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Flame, AlertOctagon, TerminalSquare, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [entry, setEntry] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      router.push("/analyze");
      return;
    }
    const history = getHistory();
    const found = history.find(e => e.id === id);
    if (found) {
      setEntry(found);
    } else {
      router.push("/analyze");
    }
  }, [searchParams, router]);

  if (!entry) return <div className="p-12 text-center flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;

  const { scores, diagnosis } = entry;

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight">Analysis Complete</h1>
        <p className="text-xl text-muted-foreground">The results are in, and they are not pretty.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card/50 backdrop-blur border-muted flex flex-col items-center p-6 transition-all hover:shadow-md">
          <ScoreGauge score={scores.tutorialHellScore} label="Tutorial Hell" color="#ef4444" size={100} />
        </Card>
        <Card className="bg-card/50 backdrop-blur border-muted flex flex-col items-center p-6 transition-all hover:shadow-md">
          <ScoreGauge score={scores.builderScore} label="Builder Score" color="#22c55e" size={100} />
        </Card>
        <Card className="bg-card/50 backdrop-blur border-muted flex flex-col items-center p-6 transition-all hover:shadow-md">
          <ScoreGauge score={scores.burnoutRisk} label="Burnout Risk" color="#f97316" size={100} />
        </Card>
        <Card className="bg-card/50 backdrop-blur border-muted flex flex-col items-center p-6 transition-all hover:shadow-md">
          <ScoreGauge score={scores.executionRating} label="Execution Rating" color="#3b82f6" size={100} />
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertOctagon className="h-6 w-6" /> Brutal Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg">
            {diagnosis.diagnosis}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" /> Red Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {diagnosis.redFlags.map((flag: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-muted-foreground">{flag}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="h-full border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" /> 7-Day Recovery Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {diagnosis.recoveryPlan.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-500 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="space-y-8">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-500">
              <TerminalSquare className="h-5 w-5" /> Recommended Project
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm">
            {diagnosis.projectIdea}
          </CardContent>
        </Card>

        <div className="text-center p-8 bg-muted/30 rounded-2xl border">
          <Flame className="h-10 w-10 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Final Verdict</h2>
          <p className="text-xl font-medium text-muted-foreground">"{diagnosis.verdict}"</p>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={() => router.push("/analyze")} size="lg" className="px-8">
            Analyze Again
          </Button>
          <Button variant="outline" size="lg" onClick={() => {
            navigator.clipboard.writeText(`My Tutorial Hell Score is ${scores.tutorialHellScore}/100. Verdict: ${diagnosis.verdict}`);
            alert("Copied to clipboard!");
          }}>
            Share Result
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>}>
      <ResultContent />
    </Suspense>
  );
}
