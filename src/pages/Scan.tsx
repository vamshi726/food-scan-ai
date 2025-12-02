import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Sparkles } from "lucide-react";
import { ScannerSection } from "@/components/scanner/ScannerSection";
import { ResultsSection } from "@/components/results/ResultsSection";
import type { NutritionAnalysis } from "@/types/nutrition";

export default function Scan() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAnalysisComplete = (analysisData: NutritionAnalysis) => {
    setAnalysis(analysisData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/welcome");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-[100]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 gradient-hero rounded-xl blur-lg opacity-50 animate-pulse-glow"></div>
                <div className="relative bg-primary rounded-xl p-2">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent gradient-hero">
                  NutriScan AI
                </h1>
                <p className="text-xs text-muted-foreground">Intelligent Food Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => navigate("/welcome")}>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {!analysis ? (
          <div className="max-w-2xl mx-auto">
            <ScannerSection
              onAnalysisComplete={handleAnalysisComplete}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />
          </div>
        ) : (
          <ResultsSection
            analysis={analysis}
            onScanAnother={() => setAnalysis(null)}
          />
        )}
      </main>

      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>NutriScan AI - Your intelligent nutrition companion</p>
        </div>
      </footer>
    </div>
  );
}