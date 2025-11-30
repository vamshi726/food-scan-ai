import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface IngredientsCardProps {
  ingredients: string[];
  riskIngredients: Array<{
    name: string;
    risk: "high" | "medium" | "low";
    explanation: string;
  }>;
}

export const IngredientsCard = ({ ingredients, riskIngredients }: IngredientsCardProps) => {
  const getRiskColor = (risk: string) => {
    if (risk === "high") return "destructive";
    if (risk === "medium") return "outline";
    return "secondary";
  };

  const getRiskIcon = (risk: string) => {
    if (risk === "high") return <AlertCircle className="h-4 w-4" />;
    if (risk === "medium") return <AlertTriangle className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Risk Ingredients */}
      {riskIngredients.length > 0 && (
        <Card className="p-6 shadow-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">⚠️ Concerning Ingredients</h3>
          <div className="space-y-3">
            {riskIngredients.map((ingredient, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-muted/50 border border-border space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={getRiskColor(ingredient.risk)} className="gap-1">
                    {getRiskIcon(ingredient.risk)}
                    {ingredient.risk.toUpperCase()} RISK
                  </Badge>
                  <span className="font-medium">{ingredient.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{ingredient.explanation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All Ingredients */}
      <Card className="p-6 shadow-card border-border/50">
        <h3 className="text-lg font-semibold mb-4">Ingredients List</h3>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient, index) => {
            const isRisky = riskIngredients.some(
              (ri) => ri.name.toLowerCase() === ingredient.toLowerCase()
            );
            return (
              <Badge
                key={index}
                variant={isRisky ? "destructive" : "secondary"}
                className="text-sm"
              >
                {ingredient}
              </Badge>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
