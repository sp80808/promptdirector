import { CinematicState, Shot, Take } from "../types";
import { PromptOrchestrator } from "./orchestrator";

const SILICON_FLOW_URL = "https://api.siliconflow.cn/v1";

export class GenerationAPI {
  /**
   * Generates an image using SiliconFlow API.
   * If no API key is provided, it simulates the generation process for local testing.
   */
  static async renderShot(
    shot: Shot, 
    state: CinematicState, 
    onTakeCreated: (takeId: string) => void,
    onTakeUpdated: (takeId: string, updates: Partial<Take>) => void
  ) {
    const apiKey = state.apiKeys.siliconFlow;
    
    const finalPrompt = PromptOrchestrator.buildGenerationPayload(shot, state);
    const { settings } = shot;

    // Convert Aspect Ratio to WxH
    let imageSize = "1024x576"; // default 16:9
    if (settings.aspectRatio === "21:9") imageSize = "1280x512";
    if (settings.aspectRatio === "1:1") imageSize = "1024x1024";
    if (settings.aspectRatio === "9:16") imageSize = "576x1024";

    const seed = Math.floor(Math.random() * 999999999);

    const initialTake: Omit<Take, "id" | "shotId"> = {
      seed,
      status: "rendering",
      rating: 0,
      createdAt: Date.now(),
      metadata: {
        model: settings.model,
        prompt: finalPrompt,
        negativePrompt: settings.negativePrompt,
        cfgScale: settings.cfgScale,
        steps: settings.steps,
        aspectRatio: settings.aspectRatio
      }
    };

    // Trigger state update to add take
    const id = Math.random().toString(36).slice(2, 11);
    onTakeCreated(id);

    // If no API key, simulate success after 3 seconds
    if (!apiKey) {
      console.log("No API key provided. Simulating generation...\nPrompt:", finalPrompt);
      setTimeout(() => {
        onTakeUpdated(id, {
          status: "rendered",
          thumbUrl: `https://picsum.photos/seed/${seed}/1024/576`,
          fullImageUrl: `https://picsum.photos/seed/${seed}/1024/576`,
        });
      }, 3000);
      return;
    }

    // Call actual SiliconFlow API
    try {
      const response = await fetch(`${SILICON_FLOW_URL}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          prompt: finalPrompt,
          negative_prompt: settings.negativePrompt,
          image_size: imageSize,
          batch_size: 1,
          seed: seed,
          num_inference_steps: settings.steps,
          guidance_scale: settings.cfgScale
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.images && data.images[0]) {
        onTakeUpdated(id, {
          status: "rendered",
          thumbUrl: data.images[0].url,
          fullImageUrl: data.images[0].url,
        });
      } else {
        throw new Error("No image returned from API");
      }
    } catch (err) {
      console.error(err);
      onTakeUpdated(id, { status: "failed" });
    }
  }

  static async animateTake(
    take: Take,
    state: CinematicState,
    onTakeUpdated: (takeId: string, updates: Partial<Take>) => void
  ) {
    const apiKey = state.apiKeys.siliconFlow;
    
    onTakeUpdated(take.id, { status: "rendering" });

    if (!apiKey) {
      console.log("Simulating Image-to-Video animation for take", take.id);
      setTimeout(() => {
        onTakeUpdated(take.id, {
          status: "rendered",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" // Mock video
        });
      }, 5000);
      return;
    }

    try {
      const response = await fetch(`${SILICON_FLOW_URL}/video/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "tencent/HunyuanVideo",
          image_url: take.fullImageUrl,
          prompt: take.metadata?.prompt || "Cinematic motion, slow pan",
          seed: Math.floor(Math.random() * 999999999)
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      
      const data = await response.json();
      if (data.video_url) {
        onTakeUpdated(take.id, { status: "rendered", videoUrl: data.video_url });
      } else {
        throw new Error("No video URL returned");
      }
    } catch (err) {
      console.error(err);
      onTakeUpdated(take.id, { status: "failed" });
    }
  }

  static async upscaleTake(
    take: Take,
    state: CinematicState,
    onTakeUpdated: (takeId: string, updates: Partial<Take>) => void
  ) {
    const apiKey = state.apiKeys.siliconFlow;
    
    onTakeUpdated(take.id, { status: "rendering" });

    if (!apiKey) {
      console.log("Simulating Upscale for take", take.id);
      setTimeout(() => {
        onTakeUpdated(take.id, {
          status: "rendered",
          fullImageUrl: `https://picsum.photos/seed/${take.seed}/2048/1152` // 2x Mock
        });
      }, 3000);
      return;
    }

    try {
      // Mocking the upscale endpoint for SiliconFlow/generic provider
      const response = await fetch(`${SILICON_FLOW_URL}/images/upscale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          image_url: take.fullImageUrl,
          scale: 2,
          model: "RealESRGAN_x4plus"
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      
      const data = await response.json();
      if (data.url) {
        onTakeUpdated(take.id, { status: "rendered", fullImageUrl: data.url });
      } else {
        throw new Error("No upscaled image returned");
      }
    } catch (err) {
      console.error(err);
      onTakeUpdated(take.id, { status: "failed" });
    }
  }
}
