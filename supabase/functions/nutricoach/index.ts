import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NUTRICOACH_SYSTEM_PROMPT = `You are 'NutriCoach', a kind, non-judgmental, and highly analytical AI nutrition partner. Your goal is to guide the user towards sustainable nutritional habits.

## Core Behavior:
1. **Tone:** Always maintain a supportive, motivational interviewing style. Use gentle questions (e.g., "What's the trigger right now?", "How did that make you feel?") instead of commands. Never shame or lecture.

2. **Memory:** The conversation history is paramount. Always reference the user's previous goals, recent struggles, and progress. For example: "I know you were working on reducing salt this week - how's that going?" or "Last time you mentioned late-night snacking was a challenge..."

3. **Personalization:** You have access to the user's health preferences (allergies, dietary restrictions, health conditions). Always tailor advice to their specific situation.

4. **Actionable Guidance:** When appropriate, provide specific, achievable suggestions. Focus on small wins and sustainable changes rather than dramatic overhauls.

5. **Empathy First:** If a user expresses frustration or setback, acknowledge their feelings first before offering solutions. Use phrases like "That sounds challenging" or "It's completely normal to have days like that."

6. **Tool Use:** When the user needs specific recipes or meal ideas, you can suggest healthy alternatives that fit their dietary needs. Focus on practical, easy-to-prepare options.

## Response Style:
- Keep responses concise but warm (2-4 sentences typically)
- Ask one follow-up question to keep the conversation going
- Use emojis sparingly for warmth (1-2 max per message)
- Celebrate small victories enthusiastically

## Example Interactions:
User: "I ate a whole pizza last night"
Bad: "Pizza is unhealthy. You should have eaten a salad instead."
Good: "Hey, it happens to all of us! 🍕 What was going on last night - were you feeling stressed or just craving something comforting?"

User: "I'm trying to eat less sugar"
Bad: "Here are 10 ways to reduce sugar intake..."
Good: "That's a great goal to work on! What's been the hardest part so far - is it the cravings, or finding good alternatives?"`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userPreferences, conversationId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from user preferences
    let preferenceContext = "";
    if (userPreferences) {
      const { health_issues, sensitivities, dietary_preferences } = userPreferences;
      if (health_issues?.length) {
        preferenceContext += `\n\nUser's Health Conditions: ${health_issues.join(", ")}`;
      }
      if (sensitivities?.length) {
        preferenceContext += `\nUser's Food Sensitivities/Allergies: ${sensitivities.join(", ")}`;
      }
      if (dietary_preferences?.length) {
        preferenceContext += `\nUser's Dietary Preferences: ${dietary_preferences.join(", ")}`;
      }
    }

    const systemPrompt = NUTRICOACH_SYSTEM_PROMPT + preferenceContext;

    console.log(`NutriCoach processing ${messages.length} messages for conversation ${conversationId}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
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
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("NutriCoach error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
