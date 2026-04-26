import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * eCoT: Cinematic.AI v5.0 Orchestration Service
 * This service handles the "Director's Brain" logic, using Gemini to 
 * breakdown scripts, optimize prompts, and check continuity.
 */

export async function optimizePrompt(apiKey: string, context: { 
  character?: string, 
  location?: string, 
  action?: string, 
  optics?: string 
}) {
  if (!apiKey) throw new Error("Google AI Studio key is missing.");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are an expert cinematographer and AI video prompt engineer. 
    Fuse the following into a highly optimized, technical video generation prompt (max 3 sentences).
    Character: ${context.character || "N/A"}
    Location: ${context.location || "N/A"}
    Action/Directorial: ${context.action || "N/A"}
    Optics/Lens: ${context.optics || "N/A"}
    
    Output ONLY the final prompt text. For example: "High-angle medium shot, Elias Thorne standing in Neon Alleys..."
  `;
  
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to optimize prompt. Check your BYOK settings.");
  }
}

export async function autoBreakdownScript(apiKey: string, scriptText: string) {
  if (!apiKey) throw new Error("Google AI Studio key is missing.");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    You are an automated Storyboard Generator based on OpenTimelineIO paradigms.
    Break down the following script text into 3 to 6 distinct video shots.
    For each shot, provide a title and a brief description that captures the action and camera angle.
    Return ONLY a JSON array of objects, where each object has "title" and "description" fields.
    
    Example:
    [
      { "title": "Establish Alley", "description": "Wide shot, establishing the dark alley. Rain falls." },
      { "title": "Shock Reaction", "description": "Close up, characters face looking shocked." }
    ]

    Script to breakdown:
    "${scriptText}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Script Breakdown Error:", error);
    throw new Error("Failed to breakdown script.");
  }
}

export async function checkContinuity(apiKey: string, images: string[], prompts: string[]) {
  if (!apiKey) throw new Error("Google AI Studio key is missing.");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const prompt = `
    You are a Script Supervisor on a film set. 
    Compare the following shots for continuity errors in props, wardrobe, character positions, or lighting.
    Prompts: ${JSON.stringify(prompts)}
    List any potential continuity errors as a JSON array of strings.
    If there are no apparent errors, return an empty array [].
  `;
  
  const parts: any[] = [{ text: prompt }];
  
  images.forEach(img => {
    parts.push({
      inlineData: {
        data: img.split(',')[1],
        mimeType: "image/jpeg"
      }
    });
  });

  try {
    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const text = result.response.text();
    const errors = JSON.parse(text);
    return Array.isArray(errors) ? errors : [];
  } catch (error) {
    console.error("Continuity Check Error:", error);
    throw new Error("Failed to check continuity.");
  }
}
