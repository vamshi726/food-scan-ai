export interface HealthierAlternative {
  name: string;
  brand: string;
  reason: string;
  estimatedScore: number;
}

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
  healthierAlternatives: HealthierAlternative[];
}