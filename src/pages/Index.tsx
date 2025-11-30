import { useState } from "react";
import { ScannerSection } from "@/components/scanner/ScannerSection";
import { ResultsSection } from "@/components/results/ResultsSection";
import { Sparkles, Scan } from "lucide-react";

export interface NutritionAnalysis {
  productName: string;
  barcode?: string;
  healthScore: number;
  category: "healthy" | "moderate" | "unhealthy";
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    sodium: number;
    fiber: number;
  };
  ingredients: string[];
  riskIngredients: Array<{
    name: string;
    risk: "high" | "medium" | "low";
    explanation: string;
  }>;
  recommendations: string[];
  aiExplanation: string;
}

const Index = () => {
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Hero Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
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
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-medium text-primary">AI Powered</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {!analysis ? (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
                <Scan className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Scan in under 12 seconds</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Know exactly what
                <br />
                <span className="gradient-hero bg-clip-text text-transparent">you're eating</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Instantly analyze any packaged food with AI-powered nutrition intelligence. Get personalized health scores and better alternatives.
              </p>
            </div>

            <ScannerSection
              onAnalysisComplete={setAnalysis}
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

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>NutriScan AI - Your intelligent nutrition companion</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
