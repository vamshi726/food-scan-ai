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

// Search the web for product information using AI
async function searchProductOnline(barcode: string, apiKey: string): Promise<NutritionData | null> {
  console.log(`Searching online for barcode: ${barcode}`);
  
  const searchPrompt = `Search for a product with barcode/UPC: ${barcode}
  
Find information about this product including:
1. Product name and brand
2. Nutrition facts per 100g (calories, protein, carbs, fat, sugar, sodium, fiber)
3. Ingredients list

Return ONLY a valid JSON object with this structure:
{
  "product_name": "Brand - Product Name",
  "nutriments": {
    "energy-kcal_100g": number or null,
    "proteins_100g": number or null,
    "carbohydrates_100g": number or null,
    "fat_100g": number or null,
    "sugars_100g": number or null,
    "sodium_100g": number or null (in grams),
    "fiber_100g": number or null
  },
  "ingredients_text": "comma separated ingredients or 'Unknown' if not found"
}

If you cannot find the product, return:
{
  "product_name": null,
  "error": "Product not found"
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a product research assistant. You have knowledge of many consumer products, their barcodes, nutrition information, and ingredients. Provide accurate information when you know it, and clearly indicate when information is estimated or uncertain." 
          },
          { role: "user", content: searchPrompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI search failed:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.product_name && !parsed.error) {
        console.log(`Found product via AI search: ${parsed.product_name}`);
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error in AI product search:", error);
  }
  
  return null;
}

// Try multiple barcode databases
async function fetchFromBarcodeAPIs(barcode: string): Promise<NutritionData | null> {
  // Try Open Food Facts first
  try {
    console.log(`Trying Open Food Facts for barcode: ${barcode}`);
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      console.log(`Found product in Open Food Facts: ${data.product.product_name}`);
      return data.product;
    }
  } catch (error) {
    console.error("Error fetching from Open Food Facts:", error);
  }

  // Try Open Food Facts with different regional endpoints
  const regions = ['us', 'uk', 'de', 'fr', 'es'];
  for (const region of regions) {
    try {
      console.log(`Trying Open Food Facts ${region} for barcode: ${barcode}`);
      const response = await fetch(
        `https://${region}.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        console.log(`Found product in Open Food Facts ${region}: ${data.product.product_name}`);
        return data.product;
      }
    } catch (error) {
      console.error(`Error fetching from Open Food Facts ${region}:`, error);
    }
  }

  return null;
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
    let dataSource = "unknown";

    // Fetch from external APIs if barcode provided
    if (barcode) {
      // Step 1: Try barcode databases
      nutritionData = await fetchFromBarcodeAPIs(barcode);
      
      if (nutritionData) {
        productName = nutritionData.product_name || "Unknown Product";
        dataSource = "Open Food Facts";
      } else {
        // Step 2: No data in databases - search using AI
        console.log("Product not found in databases, searching with AI...");
        nutritionData = await searchProductOnline(barcode, LOVABLE_API_KEY);
        
        if (nutritionData) {
          productName = nutritionData.product_name || "Unknown Product";
          dataSource = "AI Search";
        }
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
            dataSource = "Label OCR";
          }
        } catch (e) {
          console.error("Failed to parse vision response:", e);
        }
      }
    }

    if (!nutritionData) {
      return new Response(
        JSON.stringify({ 
          error: "Could not find product information. Please try uploading a photo of the nutrition label instead.",
          suggestion: "upload_label"
        }),
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
Data Source: ${dataSource}

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
Agent 5 - Alternatives Finder: Suggest 3 healthier alternative products in the same category

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
  "aiExplanation": "2-3 sentence summary of overall assessment${userPreferences ? " personalized to user's health profile" : ""}",
  "healthierAlternatives": [
    {
      "name": "Product Name",
      "brand": "Brand Name",
      "reason": "Why this is healthier (1 sentence)",
      "estimatedScore": number (1-10)
    }
  ]
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
      dataSource,
      healthScore: analysisResult.healthScore || 5,
      category: analysisResult.category || "moderate",
      nutrients,
      ingredients: ingredientsText.split(",").map(i => i.trim()).filter(Boolean),
      riskIngredients: analysisResult.riskIngredients || [],
      recommendations: analysisResult.recommendations || [],
      aiExplanation: analysisResult.aiExplanation || "Analysis completed successfully.",
      healthierAlternatives: analysisResult.healthierAlternatives || [],
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
