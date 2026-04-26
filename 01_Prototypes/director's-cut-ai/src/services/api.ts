import { GoogleGenAI } from "@google/genai";

export async function optimizePromptWithGemini(apiKey: string, characterNotes: string, locationNotes: string, cameraNotes: string) {
  if (!apiKey) throw new Error("Google AI Studio key is missing.");
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are an expert cinematographer and AI video prompt engineer. 
    Fuse the following into a highly optimized, technical video generation prompt (max 3 sentences).
    Character: ${characterNotes}
    Location: ${locationNotes}
    Camera/Action: ${cameraNotes}
    
    Output ONLY the final prompt text. For example: "High-angle medium shot, Elias Thorne standing in Neon Alleys..."
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to optimize prompt. Check your BYOK settings.");
  }
}

export async function generateMoodboardImage(apiKey: string, prompt: string) {
  if (!apiKey) throw new Error("Google AI Studio key is missing for Imagen.");
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
       return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Imagen API Error:", error);
    throw new Error("Failed to generate image. Check your BYOK settings.");
  }
}

export async function adaptToSceneDescription(apiKey: string, base64Image: string, contextNotes: string) {
  if (!apiKey) throw new Error("Google AI Studio key is missing.");
  
  const ai = new GoogleGenAI({ apiKey });
  
  // Extract base64 data without the data:image/jpeg;base64, prefix
  const base64Data = base64Image.split(',')[1];
  
  const prompt = `
    You are a professional screenwriter and set designer.
    Analyze the provided moodboard image along with these director's notes: "${contextNotes}".
    Create a highly evocative, concise scene description (2-3 paragraphs) that adapts the visual mood, lighting, and elements of the image into a narrative context for a script or prompt matrix.
    Return ONLY the scene description text.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
           inlineData: {
             data: base64Data,
             mimeType: "image/jpeg"
           }
        },
        prompt
      ]
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Adaptation Error:", error);
    throw new Error("Failed to adapt scene description. Check your BYOK settings.");
  }
}

export async function enhancePromptText(apiKey: string, rawPrompt: string, lightSource: string, style: string) {
  if (!apiKey) throw new Error("Google AI Studio key is missing.");
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are a Director of Photography and AI prompt engineer.
    Enhance the following shot description into a highly detailed cinematic prompt.
    Raw Prompt: "${rawPrompt || 'A cinematic shot'}"
    Light Source Placement: ${lightSource}
    Target Style: ${style}
    
    Instructions:
    If the Target Style is EXACTLY 'Noir/Chiaroscuro', you MUST generate BOTH a rich positive prompt prioritizing contrast/shadows, AND a strict negative prompt array (e.g. ["flat lighting", "daylight"]).
    Present the output clearly, for example:
    [POSITIVE]
    (your highly detailed prompt here)
    
    [NEGATIVE]
    ["keyword 1", "keyword 2"]
    
    If it is not Noir, just return a highly professional descriptive paragraph.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }],
    });
    return response.text || rawPrompt;
  } catch (error) {
    console.error("Enhance Prompt Error:", error);
    throw new Error("Failed to enhance prompt.");
  }
}

export async function autoBreakdownScript(apiKey: string, scriptText: string) {
  if (!apiKey) throw new Error("Google AI Studio key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an automated Storyboard Generator based on OpenTimelineIO paradigms.
    Break down the following script text into 3 to 6 distinct video shots.
    For each shot, provide a brief description that captures the action and camera angle.
    Return ONLY a JSON array of objects, where each object has a "description" string field.
    
    Example:
    [
      { "description": "Wide shot, establishing the dark alley. Rain falls." },
      { "description": "Close up, characters face looking shocked." }
    ]

    Script to breakdown:
    "${scriptText}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
        const data = JSON.parse(response.text);
        return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    console.error("Script Breakdown Error:", error);
    throw new Error("Failed to breakdown script.");
  }
}

export async function checkContinuity(apiKey: string, image1Base64?: string, image2Base64?: string, promptA?: string, promptB?: string) {
  if (!apiKey) throw new Error("Google AI Studio key is missing.");
  const ai = new GoogleGenAI({ apiKey });
  
  // As a fallback for demo, if images are missing we can use the prompts
  const prompt = `
    You are a Script Supervisor on a film set. 
    Compare the following two shots for continuity errors in props, wardrobe, character positions, or lighting.
    Shot A prompt: "${promptA || 'Missing'}"
    Shot B prompt: "${promptB || 'Missing'}"
    List any potential continuity errors as a JSON array of strings (e.g., ["The jacket color changed", "Lighting shifted from overhead to window-left"]). 
    If there are no apparent errors, return an empty array [].
    Return ONLY a valid JSON array of strings, nothing else.
  `;
  
  const contents: any[] = [{ text: prompt }]; // Using structured content array
  
  if (image1Base64) {
      contents.unshift({ inlineData: { data: image1Base64.split(',')[1], mimeType: "image/jpeg" } });
  }
  if (image2Base64) {
      contents.unshift({ inlineData: { data: image2Base64.split(',')[1], mimeType: "image/jpeg" } });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents, // Passing the array correctly
      config: {
        responseMimeType: "application/json",
      }
    });
    
    if (response.text) {
      const errors = JSON.parse(response.text);
      return Array.isArray(errors) ? errors : ["Potential spatial mismatch detected"];
    }
    return [];
  } catch (error) {
    console.error("Continuity Check Error:", error);
    throw new Error("Failed to check continuity.");
  }
}

export async function generateVideo(token: string, prompt: string, service: 'seedance' | 'veo' | 'nanobanana') {
  if (!token) throw new Error(`API token missing for ${service.toUpperCase()} in BYOK settings.`);
  
  // Simulate network delay to pretend we are waiting for a video queue
  await new Promise(resolve => setTimeout(resolve, 3500));
  
  // Return a mock result with a public sample video to simulate success
  // We use different videos based on the "service" just for variety
  let url = 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
  if (service === 'veo') url = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
  if (service === 'nanobanana') url = 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';

  return {
    id: `job_${Math.random().toString(36).substring(7)}`,
    status: 'completed',
    url
  };
}
