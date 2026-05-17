"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, deleteHistoryEntry, HistoryEntry } from "@/lib/history";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setHistory(getHistory());
  };

  if (history.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto py-24 text-center space-y-6">
        <h2 className="text-3xl font-bold">No History Found</h2>
        <p className="text-muted-foreground">You haven't been analyzed yet. Are you afraid?</p>
        <Link href="/analyze">
          <Button size="lg">Take the Test <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Analysis History</h1>
        <p className="text-muted-foreground">Your past failures and verdicts.</p>
      </div>

      <div className="grid gap-4">
        {history.map((entry) => (
          <Card key={entry.id} className="relative overflow-hidden group">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1 flex items-center gap-2">
                    Tutorial Hell Score: <span className={entry.scores.tutorialHellScore > 50 ? "text-red-500" : "text-green-500"}>{entry.scores.tutorialHellScore}/100</span>
                  </CardTitle>
                  <CardDescription>
                    {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString()}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(entry.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                "{entry.diagnosis.verdict}"
              </p>
              <div className="flex gap-4">
                <Link href={`/result?id=${entry.id}`}>
                  <Button variant="secondary" size="sm">View Full Result</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
