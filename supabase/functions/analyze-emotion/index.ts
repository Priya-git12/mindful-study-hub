import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, image } = await req.json();
    
    if ((!text || typeof text !== 'string' || text.trim().length === 0) && !image) {
      return new Response(
        JSON.stringify({ error: "Either text or image input is required" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate image data if provided
    if (image && (!image.startsWith('data:image/') || image.length < 100)) {
      console.error("Invalid image data received:", image.substring(0, 50));
      return new Response(
        JSON.stringify({ error: "Invalid image data. Please capture a new image." }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing emotion for:", text ? `text: ${text.substring(0, 50)}...` : "image");

    // Build messages array based on input type
    const messages: any[] = [
      { 
        role: "system", 
        content: "You are an emotion detection AI for a study buddy app called MindSync. Analyze the user's input (text, facial expression, or both) and detect their primary emotion. Provide a motivational message to help them during their study sessions based on their emotional state. Be supportive, encouraging, and gentle." 
      }
    ];

    // Add user content based on what was provided
    if (text && image) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: `Text: ${text}` },
          { type: "image_url", image_url: { url: image } }
        ]
      });
    } else if (image) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Analyze this facial expression:" },
          { type: "image_url", image_url: { url: image } }
        ]
      });
    } else {
      messages.push({ role: "user", content: text });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "detect_emotion",
              description: "Return the detected emotion and confidence score",
              parameters: {
                type: "object",
                properties: {
                  emotion: {
                    type: "string",
                    enum: ["joy", "sadness", "anger", "fear", "surprise", "neutral"],
                    description: "The primary emotion detected in the text"
                  },
                  confidence: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                    description: "Confidence score between 0-100"
                  },
                  reasoning: {
                    type: "string",
                    description: "Brief explanation of why this emotion was detected"
                  },
                  motivation: {
                    type: "string",
                    description: "A supportive, encouraging message (2-3 sentences) to motivate the student based on their emotion. Be warm, gentle, and specific to their emotional state."
                  }
                },
                required: ["emotion", "confidence", "reasoning", "motivation"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "detect_emotion" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze emotion" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call found in response");
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Emotion detected:", result);

    return new Response(
      JSON.stringify(result), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-emotion function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
