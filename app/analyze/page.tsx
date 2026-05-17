"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UserStats, calculateScores } from "@/lib/scoring";
import { saveHistory } from "@/lib/history";

export default function AnalyzePage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [stats, setStats] = useState<UserStats>({
    tutorialHours: 10,
    codingHours: 2,
    unfinishedProjects: 5,
    shippedProjects: 0,
    githubCommits: 5,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    try {
      const scores = calculateScores(stats);
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats, scores }),
      });
      
      if (!response.ok) throw new Error("Failed to analyze");
      
      const diagnosis = await response.json();
      
      const entry = saveHistory({
        stats,
        scores,
        diagnosis,
      });
      
      router.push(`/result?id=${entry?.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to perform analysis. Ensure API key is set.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card className="border-muted shadow-lg bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl">Submit to the Machine</CardTitle>
          <CardDescription>
            Be honest. The AI will know if you're lying about your shipped projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Tutorial Hours (Past 30 days)</Label>
                  <span className="text-muted-foreground text-sm">{stats.tutorialHours}h</span>
                </div>
                <Slider 
                  value={[stats.tutorialHours]} 
                  max={200} step={1}
                  onValueChange={(val: any) => setStats({...stats, tutorialHours: Array.isArray(val) ? val[0] : val})}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Actual Coding Hours (Past 30 days)</Label>
                  <span className="text-muted-foreground text-sm">{stats.codingHours}h</span>
                </div>
                <Slider 
                  value={[stats.codingHours]} 
                  max={200} step={1}
                  onValueChange={(val: any) => setStats({...stats, codingHours: Array.isArray(val) ? val[0] : val})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unfinished Projects</Label>
                  <Input 
                    type="number" min="0" 
                    value={stats.unfinishedProjects}
                    onChange={(e) => setStats({...stats, unfinishedProjects: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shipped Projects</Label>
                  <Input 
                    type="number" min="0" 
                    value={stats.shippedProjects}
                    onChange={(e) => setStats({...stats, shippedProjects: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>GitHub Commits (Est. Past 30 days)</Label>
                <Input 
                  type="number" min="0" 
                  value={stats.githubCommits}
                  onChange={(e) => setStats({...stats, githubCommits: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="space-y-2">
                <Label>Describe your recent learning behavior</Label>
                <Textarea 
                  placeholder="I've been watching a 12-hour Next.js clone video but haven't started my own project..."
                  value={stats.description}
                  onChange={(e) => setStats({...stats, description: e.target.value})}
                  required
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing your failures...
                </>
              ) : (
                "Give it to me straight"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
