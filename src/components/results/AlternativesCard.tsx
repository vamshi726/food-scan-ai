import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import type { HealthierAlternative } from "@/types/nutrition";

interface AlternativesCardProps {
  alternatives: HealthierAlternative[];
  currentScore: number;
}

export const AlternativesCard = ({ alternatives, currentScore }: AlternativesCardProps) => {
  if (!alternatives || alternatives.length === 0) return null;

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-emerald-500";
    if (score >= 4) return "text-amber-500";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 7) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 4) return "bg-amber-500/10 border-amber-500/20";
    return "bg-destructive/10 border-destructive/20";
  };

  return (
    <Card className="p-6 shadow-card border-border/50 bg-gradient-to-br from-primary/5 to-background">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Healthier Alternatives</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Consider these healthier options in the same category:
      </p>

      <div className="grid gap-3">
        {alternatives.map((alt, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border ${getScoreBg(alt.estimatedScore)}`}>
              <span className={`text-lg font-bold ${getScoreColor(alt.estimatedScore)}`}>
                {alt.estimatedScore}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{alt.name}</h4>
                {alt.estimatedScore > currentScore && (
                  <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                    <TrendingUp className="h-3 w-3" />
                    +{alt.estimatedScore - currentScore}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{alt.brand}</p>
              <p className="text-sm text-foreground/80">{alt.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
