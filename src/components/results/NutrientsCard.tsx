import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface NutrientsCardProps {
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    sodium: number;
    fiber: number;
  };
}

export const NutrientsCard = ({ nutrients }: NutrientsCardProps) => {
  const nutrientData = [
    {
      name: "Calories",
      value: nutrients.calories,
      unit: "kcal",
      max: 2000,
      isPerServing: true,
    },
    { name: "Protein", value: nutrients.protein, unit: "g", max: 50 },
    { name: "Carbs", value: nutrients.carbs, unit: "g", max: 300 },
    { name: "Fat", value: nutrients.fat, unit: "g", max: 70 },
    { name: "Sugar", value: nutrients.sugar, unit: "g", max: 50, warning: nutrients.sugar > 15 },
    {
      name: "Sodium",
      value: nutrients.sodium,
      unit: "mg",
      max: 2300,
      warning: nutrients.sodium > 500,
    },
    { name: "Fiber", value: nutrients.fiber, unit: "g", max: 30, isGood: nutrients.fiber > 3 },
  ];

  return (
    <Card className="p-6 shadow-card border-border/50">
      <h3 className="text-lg font-semibold mb-4">Nutrition Facts (per serving)</h3>
      <div className="space-y-4">
        {nutrientData.map((nutrient) => {
          const percentage = Math.min((nutrient.value / nutrient.max) * 100, 100);
          const getProgressColor = () => {
            if (nutrient.isGood) return "bg-success";
            if (nutrient.warning) return "bg-destructive";
            if (percentage > 30) return "bg-warning";
            return "bg-primary";
          };

          return (
            <div key={nutrient.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{nutrient.name}</span>
                <span className={`text-sm font-semibold ${nutrient.warning ? "text-destructive" : nutrient.isGood ? "text-success" : ""}`}>
                  {nutrient.value}
                  {nutrient.unit}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all ${getProgressColor()}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
