import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subjects, instituteTimetable, personalEvents, startDate, endDate } = await req.json();
    
    console.log('Generating schedule for:', { subjects, instituteTimetable, personalEvents, startDate, endDate });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are an expert study planner. Create a detailed, personalized study schedule.

**Student's Subjects:**
${subjects.map((s: any) => `- ${s.name}: ${s.hoursPerWeek} hours/week${s.deadline ? `, Deadline: ${s.deadline}` : ''}`).join('\n')}

**Institute Timetable:**
${instituteTimetable || 'Not provided'}

**Personal Events/Activities:**
${personalEvents || 'None mentioned'}

**Schedule Period:** ${startDate || 'This week'} to ${endDate || 'Next week'}

Create a realistic, balanced study schedule that:
1. Respects institute class timings (avoid conflicts)
2. Works around personal events
3. Distributes study hours evenly across the week
4. Includes breaks and rest periods
5. Prioritizes subjects with upcoming deadlines
6. Suggests optimal study times based on subject difficulty

Return the schedule in this JSON format:
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "sessions": [
        {
          "time": "9:00 AM - 10:30 AM",
          "subject": "Subject name",
          "topic": "Suggested topic/activity",
          "type": "study/review/practice"
        }
      ]
    }
  ],
  "totalHours": number,
  "tips": ["tip1", "tip2", "tip3"],
  "priorities": ["High priority item 1", "High priority item 2"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert study planner. Always respond with valid JSON only, no markdown or extra text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response:', data);
    
    let scheduleContent = data.choices[0].message.content;
    
    // Clean up markdown code blocks if present
    scheduleContent = scheduleContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const schedule = JSON.parse(scheduleContent);

    return new Response(
      JSON.stringify(schedule),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-schedule function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An error occurred generating the schedule'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
