import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import type { NutritionAnalysis } from "@/types/nutrition";
import { HealthScoreCard } from "./HealthScoreCard";
import { NutrientsCard } from "./NutrientsCard";
import { IngredientsCard } from "./IngredientsCard";
import { RecommendationsCard } from "./RecommendationsCard";
import { AlternativesCard } from "./AlternativesCard";

interface ResultsSectionProps {
  analysis: NutritionAnalysis;
  onScanAnother: () => void;
}

export const ResultsSection = ({ analysis, onScanAnother }: ResultsSectionProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h2 className="text-3xl font-bold">{analysis.productName}</h2>
          {analysis.barcode && (
            <p className="text-sm text-muted-foreground">Barcode: {analysis.barcode}</p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={onScanAnother}
          className="shrink-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Scan Another
        </Button>
      </div>

      {/* Health Score */}
      <HealthScoreCard analysis={analysis} />

      {/* Nutrients */}
      <NutrientsCard nutrients={analysis.nutrients} />

      {/* Ingredients & Risks */}
      <IngredientsCard
        ingredients={analysis.ingredients}
        riskIngredients={analysis.riskIngredients}
      />

      {/* AI Explanation */}
      <Card className="p-6 shadow-card border-border/50">
        <h3 className="text-lg font-semibold mb-3">AI Analysis</h3>
        <p className="text-muted-foreground leading-relaxed">{analysis.aiExplanation}</p>
      </Card>

      {/* Recommendations */}
      <RecommendationsCard recommendations={analysis.recommendations} />

      {/* Healthier Alternatives */}
      <AlternativesCard 
        alternatives={analysis.healthierAlternatives} 
        currentScore={analysis.healthScore}
      />
    </div>
  );
};
