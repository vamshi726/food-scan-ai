import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CONTEXTUALIZER_SYSTEM_PROMPT = `You are a highly skilled, empathetic, and detail-oriented Nutritional Contextualizer. Your task is to transform raw nutritional data into a personalized, goal-oriented narrative.

## Your Role:
Transform technical nutrition facts into meaningful, actionable insights that resonate with the user's specific health goals and situation.

## Output Requirements:
You MUST respond with a valid JSON object containing the following structure:

{
  "summary": "A 2-3 sentence personalized summary of the food's impact on the user's health goals",
  "highlights": [
    {
      "type": "positive" | "warning" | "neutral",
      "nutrient": "string",
      "message": "Personalized insight about this nutrient",
      "recommendation": "Specific actionable tip"
    }
  ],
  "goalAlignment": {
    "score": 1-10,
    "explanation": "How this food aligns with user's stated goals",
    "suggestions": ["Array of personalized suggestions"]
  },
  "mealContext": {
    "bestTimeToEat": "morning" | "afternoon" | "evening" | "anytime",
    "pairings": ["Suggested food pairings to balance nutrition"],
    "portionAdvice": "Personalized portion guidance"
  },
  "motivationalNote": "A brief, encouraging message tailored to the user's journey"
}

## Guidelines:
1. Always personalize based on user's health conditions, allergies, and dietary preferences
2. Use empathetic, non-judgmental language
3. Focus on practical, achievable recommendations
4. Celebrate positive aspects while gently noting concerns
5. Make complex nutritional science accessible and relatable`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nutritionData, userPreferences, productName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build user context
    let userContext = "";
    if (userPreferences) {
      const { health_issues, sensitivities, dietary_preferences } = userPreferences;
      if (health_issues?.length) {
        userContext += `User's Health Conditions: ${health_issues.join(", ")}\n`;
      }
      if (sensitivities?.length) {
        userContext += `User's Allergies/Sensitivities: ${sensitivities.join(", ")}\n`;
      }
      if (dietary_preferences?.length) {
        userContext += `User's Dietary Preferences: ${dietary_preferences.join(", ")}\n`;
      }
    }

    const prompt = `
## User Profile:
${userContext || "No specific preferences provided - give general healthy eating guidance."}

## Product: ${productName || "Unknown Product"}

## Raw Nutrition Data:
${JSON.stringify(nutritionData, null, 2)}

Transform this raw nutritional data into a personalized, goal-oriented narrative following the exact JSON structure specified. Focus on what matters most to THIS specific user based on their profile.`;

    console.log(`Contextualizing nutrition for: ${productName}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: CONTEXTUALIZER_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to contextualize nutrition data");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let contextualizedData;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      contextualizedData = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("Invalid JSON response from AI");
    }

    console.log("Successfully contextualized nutrition data");

    return new Response(JSON.stringify(contextualizedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contextualize nutrition error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
