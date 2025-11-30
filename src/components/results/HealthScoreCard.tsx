import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { NutritionAnalysis } from "@/pages/Index";

interface HealthScoreCardProps {
  analysis: NutritionAnalysis;
}

export const HealthScoreCard = ({ analysis }: HealthScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-success";
    if (score >= 4) return "text-warning";
    return "text-destructive";
  };

  const getScoreBackground = (category: string) => {
    if (category === "healthy") return "gradient-healthy";
    if (category === "moderate") return "gradient-warning";
    return "gradient-danger";
  };

  const getScoreIcon = (category: string) => {
    if (category === "healthy") return <CheckCircle2 className="h-8 w-8" />;
    if (category === "moderate") return <AlertTriangle className="h-8 w-8" />;
    return <XCircle className="h-8 w-8" />;
  };

  return (
    <Card className="p-6 shadow-card border-border/50 overflow-hidden relative">
      <div className="flex items-center gap-6">
        {/* Score Circle */}
        <div className="relative shrink-0">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center ${getScoreBackground(
              analysis.category
            )} shadow-glow`}
          >
            <div className="text-center text-white">
              <div className="text-4xl font-bold">{analysis.healthScore}</div>
              <div className="text-xs font-medium opacity-90">/ 10</div>
            </div>
          </div>
        </div>

        {/* Score Details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className={getScoreColor(analysis.healthScore)}>
              {getScoreIcon(analysis.category)}
            </div>
            <h3 className="text-2xl font-bold capitalize">{analysis.category}</h3>
          </div>
          <p className="text-muted-foreground">
            {analysis.category === "healthy" &&
              "This product has a good nutritional profile and is a healthy choice."}
            {analysis.category === "moderate" &&
              "This product is okay in moderation but contains some concerning ingredients."}
            {analysis.category === "unhealthy" &&
              "This product contains multiple concerning ingredients and high amounts of unhealthy nutrients."}
          </p>
        </div>
      </div>
    </Card>
  );
};
