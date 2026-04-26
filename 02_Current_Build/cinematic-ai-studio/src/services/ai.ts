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

export async function autoBreakdownScript(apiKey: string, scriptText: string): Promise<{ title: string; description: string }[]> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert film director and AI prompt engineer.
Analyze the following script excerpt and break it down into a sequence of distinct cinematic shots.
For each shot, provide a short title (e.g., "Wide Establishing Shot") and a highly descriptive text-to-image prompt.
Format the output STRICTLY as a JSON array of objects. Do not include markdown code block formatting like \`\`\`json.
Example format:
[
  { "title": "Wide Establishing Shot", "description": "Wide shot, desolate cyberpunk city street, neon signs reflecting in puddles, rain." },
  { "title": "Close Up Character", "description": "Close up, female character looking determined, blue rim light, 35mm lens." }
]

Script:
${scriptText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text();
    if (!text) throw new Error("Empty response from Gemini");

    // Try to parse the JSON output directly or extract it if wrapped in markdown
    let jsonStr = text;
    if (text.includes('```json')) {
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1];
    } else if (text.includes('```')) {
      const match = text.match(/```\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1];
    }

    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) throw new Error("Invalid format returned");
    return parsed;
  } catch (error) {
    console.error("AutoBreakdown Error:", error);
    // Return a mock if API fails for local testing
    return [
      { title: "Establishing Shot", description: "Wide cinematic establishing shot based on the provided script..." },
      { title: "Medium Shot", description: "Medium coverage tracking shot." }
    ];
  }
}
