import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface RecommendationsCardProps {
  recommendations: string[];
}

export const RecommendationsCard = ({ recommendations }: RecommendationsCardProps) => {
  return (
    <Card className="p-6 shadow-card border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recommendations</h3>
      </div>
      <ul className="space-y-2">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">•</span>
            <span className="text-sm text-foreground/90">{rec}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};
