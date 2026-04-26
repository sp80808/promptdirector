import { GoogleGenAI } from "@google/genai";

export async function generateSmartCoverage(
  apiKey: string, 
  shotDescription: string, 
  characters: string[]
): Promise<{ title: string; optics: string; motion: string; prompt: string }[]> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a professional Film Director.
Given a base shot description: "${shotDescription}"
And these characters present: ${characters.join(", ")}
Suggest 4-5 additional coverage shots (e.g. Over-the-shoulder, Extreme Close Up, Tracking Wide, Low Angle) to fully capture the emotional and cinematic weight of the scene.
For each shot, provide a title, lens/optics, motion, and a technical image prompt.
Format the output STRICTLY as a JSON array of objects.
Example: [{"title": "Tight ECU", "optics": "85mm macro", "motion": "Static", "prompt": "Macro shot of eyes, sweat on brow, high-contrast lighting"}]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text();
    let jsonStr = text;
    if (text.includes('```json')) jsonStr = text.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || text;
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Coverage Error:", error);
    return [];
  }
}

export async function generateCinematicDNA(apiKey: string, films: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a world-class Cinematographer.
Analyze the visual style (lighting, color palette, camera work, film stock) of these reference films: "${films}".
Synthesize them into a single, cohesive "Cinematic DNA" string consisting of highly descriptive technical tokens.
Focus on: Lighting setup (e.g. high-contrast, chiaroscuro), Color grading (e.g. teal/orange, sepia), Lens choice (e.g. anamorphic, spherical 35mm), and Textures (e.g. 35mm grain, hazy).
Output ONLY the technical prompt string. No conversational text.
Example Output: 35mm anamorphic lens, high-contrast chiaroscuro lighting, heavy film grain, moody teal and deep amber palette, smoke and atmospheric haze.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { temperature: 0.8 }
    });

    return response.text().trim();
  } catch (error) {
    console.error("DNA Generation Error:", error);
    return "Cinematic lighting, high-contrast, filmic texture, 35mm lens.";
  }
}

export interface ScriptBreakdownResponse {
  characters: { name: string; traits: string }[];
  shots: { title: string; description: string; duration: number; optics: string }[];
}

export async function autoBreakdownScript(apiKey: string, scriptText: string): Promise<ScriptBreakdownResponse> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert film director and AI production assistant.
Analyze the following script excerpt and provide:
1. A list of unique CHARACTERS found, with a short description of their physical traits and age inferred from context.
2. A sequence of distinct cinematic SHOTS. For each shot, provide:
   - title: Short descriptive title.
   - description: A highly descriptive technical text-to-image prompt.
   - duration: Suggested length in seconds (e.g., 2.5, 4.0, 6.0).
   - optics: Suggested lens (e.g., "35mm anamorphic", "85mm prime").

Format the output STRICTLY as a single JSON object.
Example:
{
  "characters": [{ "name": "Sarah", "traits": "Mid-30s, weary eyes, wearing a tattered flight suit." }],
  "shots": [
    { "title": "Wide Establishing", "description": "High angle wide shot of a desert planet...", "duration": 5.0, "optics": "24mm wide" }
  ]
}

Script:
${scriptText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { temperature: 0.7 }
    });

    const text = response.text();
    let jsonStr = text;
    if (text.includes('```json')) jsonStr = text.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || text;
    else if (text.includes('```')) jsonStr = text.match(/```\s*([\s\S]*?)\s*```/)?.[1] || text;

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AutoBreakdown Error:", error);
    return {
      characters: [],
      shots: [
        { title: "Establishing Shot", description: "Cinematic wide shot...", duration: 4.0, optics: "35mm" },
        { title: "Medium Close Up", description: "Character reaction shot...", duration: 3.0, optics: "50mm" }
      ]
    };
  }
}
