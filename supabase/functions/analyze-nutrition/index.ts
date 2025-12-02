import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NutritionData {
  product_name?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
    fiber_100g?: number;
  };
  ingredients_text?: string;
  ingredients?: Array<{ text: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode, image, userPreferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let nutritionData: NutritionData | null = null;
    let productName = "Unknown Product";
    let barcodeValue = barcode;

    // Fetch from external API if barcode provided
    if (barcode) {
      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
        );
        const data = await response.json();
        
        if (data.status === 1 && data.product) {
          nutritionData = data.product;
          productName = data.product.product_name || "Unknown Product";
        }
      } catch (error) {
        console.error("Error fetching from Open Food Facts:", error);
      }
    }

    // If image provided and no nutrition data yet, use AI to extract
    if (image && !nutritionData) {
      const visionPrompt = `Analyze this nutrition label image and extract:
1. Product name
2. Nutrition facts per 100g (calories, protein, carbs, fat, sugar, sodium, fiber)
3. Complete ingredients list

Return ONLY a JSON object with this exact structure:
{
  "product_name": "string",
  "nutriments": {
    "energy-kcal_100g": number,
    "proteins_100g": number,
    "carbohydrates_100g": number,
    "fat_100g": number,
    "sugars_100g": number,
    "sodium_100g": number,
    "fiber_100g": number
  },
  "ingredients_text": "comma separated ingredients"
}`;

      const visionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: visionPrompt },
                { type: "image_url", image_url: { url: image } }
              ]
            }
          ],
        }),
      });

      if (visionResponse.ok) {
        const visionData = await visionResponse.json();
        const extractedText = visionData.choices[0].message.content;
        
        // Parse JSON from response
        try {
          const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            nutritionData = JSON.parse(jsonMatch[0]);
            productName = nutritionData?.product_name || "Scanned Product";
          }
        } catch (e) {
          console.error("Failed to parse vision response:", e);
        }
      }
    }

    if (!nutritionData) {
      return new Response(
        JSON.stringify({ error: "Could not fetch or extract nutrition data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Prepare data for AI analysis
    const nutrients = {
      calories: nutritionData.nutriments?.["energy-kcal_100g"] || 0,
      protein: nutritionData.nutriments?.proteins_100g || 0,
      carbs: nutritionData.nutriments?.carbohydrates_100g || 0,
      fat: nutritionData.nutriments?.fat_100g || 0,
      sugar: nutritionData.nutriments?.sugars_100g || 0,
      sodium: (nutritionData.nutriments?.sodium_100g || 0) * 1000, // Convert g to mg
      fiber: nutritionData.nutriments?.fiber_100g || 0,
    };

    const ingredientsText = nutritionData.ingredients_text || 
      nutritionData.ingredients?.map(i => i.text).join(", ") || 
      "No ingredients listed";

    // Multi-agent AI analysis with personalization
    const userContext = userPreferences ? `

User Health Profile:
- Health Issues: ${userPreferences.health_issues?.join(", ") || "None"}
- Sensitivities: ${userPreferences.sensitivities?.join(", ") || "None"}
- Allergies/Intolerances: ${userPreferences.intolerances?.join(", ") || "None"}
- Dietary Preferences: ${userPreferences.dietary_preferences?.join(", ") || "None"}

IMPORTANT: Provide personalized warnings and recommendations based on the user's health profile. Flag any ingredients that conflict with their health issues, sensitivities, or allergies.` : "";

    const analysisPrompt = `You are a nutrition expert AI conducting a multi-agent analysis.

Product: ${productName}
Barcode: ${barcodeValue || "N/A"}

Nutrients (per 100g):
- Calories: ${nutrients.calories} kcal
- Protein: ${nutrients.protein}g
- Carbs: ${nutrients.carbs}g
- Fat: ${nutrients.fat}g
- Sugar: ${nutrients.sugar}g
- Sodium: ${nutrients.sodium}mg
- Fiber: ${nutrients.fiber}g

Ingredients: ${ingredientsText}
${userContext}

Perform a comprehensive analysis following this multi-agent approach:

Agent 1 - Ingredient Parser: Parse and categorize all ingredients
Agent 2 - Risk Detector: Identify harmful additives, preservatives, excessive sugar/sodium
Agent 3 - Health Score Calculator: Calculate a score from 1-10 based on WHO guidelines${userPreferences ? " AND user's health profile" : ""}
Agent 4 - Recommendation Engine: Suggest healthier alternatives or improvements${userPreferences ? " tailored to user's needs" : ""}

Return ONLY valid JSON with this structure:
{
  "healthScore": number (1-10),
  "category": "healthy" | "moderate" | "unhealthy",
  "riskIngredients": [
    {
      "name": "ingredient name",
      "risk": "high" | "medium" | "low",
      "explanation": "why it's concerning${userPreferences ? " (mention if it conflicts with user profile)" : ""}"
    }
  ],
  "recommendations": ["rec1", "rec2", "rec3"],
  "aiExplanation": "2-3 sentence summary of overall assessment${userPreferences ? " personalized to user's health profile" : ""}"
}

Guidelines:
- Score ≥7: healthy (low sugar <10g, sodium <400mg, high fiber >5g)
- Score 4-6: moderate (moderate sugar 10-20g, sodium 400-800mg)  
- Score ≤3: unhealthy (high sugar >20g, sodium >800mg, many additives)
- Flag: E-numbers, palm oil, high fructose corn syrup, trans fats, artificial sweeteners
- Consider nutrient density and ingredient quality
${userPreferences ? "- CRITICAL: Lower score if ingredients conflict with user's health issues, sensitivities, or allergies" : ""}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a nutrition analysis AI that returns only valid JSON." },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI analysis error:", aiResponse.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    // Parse AI response
    let analysisResult;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      console.error("AI response:", aiContent);
      throw new Error("Failed to parse AI analysis");
    }

    // Build final analysis
    const analysis = {
      productName,
      barcode: barcodeValue,
      healthScore: analysisResult.healthScore || 5,
      category: analysisResult.category || "moderate",
      nutrients,
      ingredients: ingredientsText.split(",").map(i => i.trim()).filter(Boolean),
      riskIngredients: analysisResult.riskIngredients || [],
      recommendations: analysisResult.recommendations || [],
      aiExplanation: analysisResult.aiExplanation || "Analysis completed successfully.",
    };

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-nutrition function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
