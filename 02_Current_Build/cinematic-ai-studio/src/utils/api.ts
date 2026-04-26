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

    // Frame chaining: Get init_image from previous shot's approved take
    let initImageUrl: string | undefined;
    if (shot.usePreviousFrameAsInit && state.shots) {
      // Find previous shot in sequence order
      const currentScene = state.scenes.find(s => s.id === shot.sceneId);
      if (currentScene) {
        const currentIndex = currentScene.shotIds.indexOf(shot.id);
        if (currentIndex > 0) {
          const prevShotId = currentScene.shotIds[currentIndex - 1];
          const prevShot = state.shots[prevShotId];
          if (prevShot?.approvedTakeId) {
            const prevTake = prevShot.takes.find(t => t.id === prevShot.approvedTakeId);
            if (prevTake?.fullImageUrl || prevTake?.videoUrl) {
              initImageUrl = prevTake.fullImageUrl || prevTake.videoUrl;
              console.log(`[FrameChain] Using init_image from shot "${prevShot.title}" (take: ${prevShot.approvedTakeId.slice(0,6)})`);
            }
          }
        }
      }
    }

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
        aspectRatio: settings.aspectRatio,
        initImageUrl: initImageUrl, // Store reference for debugging
      }
    };

    const takeId = Math.random().toString(36).slice(2, 11);
    onTakeCreated(takeId);

    // Simulated mode (no API key)
    if (!apiKey) {
      console.log("No API key provided. Simulating generation...\nPrompt:", finalPrompt.substring(0, 200) + "...");
      this.simulateProgress(takeId, onTakeUpdated, initImageUrl);
      return;
    }

    // Real SiliconFlow API call
    try {
      const payload: any = {
        model: settings.model,
        prompt: finalPrompt,
        negative_prompt: settings.negativePrompt,
        image_size: imageSize,
        batch_size: 1,
        seed: seed,
        num_inference_steps: settings.steps,
        guidance_scale: settings.cfgScale
      };
      
      // Add init_image if frame chaining is active
      if (initImageUrl) {
        payload.image_url = initImageUrl;  // SiliconFlow param name
        // If using init_image, increase denoising slightly for creative variation
        payload.denoising_strength = 0.4; 
      }

      const response = await fetch(`${SILICON_FLOW_URL}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API Error ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      
      if (data.images && data.images[0]) {
        onTakeUpdated(takeId, {
          status: "rendered",
          thumbUrl: data.images[0].url,
          fullImageUrl: data.images[0].url,
        });
      } else {
        throw new Error("No image returned from API");
      }
    } catch (err: any) {
      console.error("[GenerationAPI]", err);
      onTakeUpdated(takeId, { 
        status: "failed",
        error: err.message 
      });
    }
  }

  /** Simulates generation progress for demo mode */
  private static simulateProgress(
    takeId: string, 
    onTakeUpdated: (takeId: string, updates: Partial<Take>) => void,
    initImageUrl?: string
  ) {
    let progress = 0;
    const steps = [25, 50, 75, 100];
    let stepIdx = 0;
    
    const interval = setInterval(() => {
      if (stepIdx >= steps.length) {
        clearInterval(interval);
        onTakeUpdated(takeId, {
          status: "rendered",
          thumbUrl: `https://picsum.photos/seed/${Math.random().toString(36).slice(3,9)}/1024/576`,
          fullImageUrl: `https://picsum.photos/seed/${Math.random().toString(36).slice(3,9)}/1024/576`,
        });
        return;
      }
      
      progress = steps[stepIdx];
      onTakeUpdated(takeId, { 
        progress,
        status: "rendering" as const
      });
      stepIdx++;
    }, 800); // ~3.2s total
  }
        }
      }
    }

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
        aspectRatio: settings.aspectRatio,
        initImageUrl
      }
    };

    // Trigger state update to add take
    const id = Math.random().toString(36).slice(2, 11);
    onTakeCreated(id);

    // If no API key, simulate success after 3 seconds
    if (!apiKey) {
      console.log("No API key provided. Simulating generation...\nPrompt:", finalPrompt);
      if (initImageUrl) console.log("Using Init Image:", initImageUrl);
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
      const payload: any = {
        model: settings.model,
        prompt: finalPrompt,
        negative_prompt: settings.negativePrompt,
        image_size: imageSize,
        batch_size: 1,
        seed: seed,
        num_inference_steps: settings.steps,
        guidance_scale: settings.cfgScale
      };

      if (initImageUrl) {
        payload.image_url = initImageUrl;
        payload.strength = 0.35; 
      }

      const response = await fetch(`${SILICON_FLOW_URL}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
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

  static async inpaintTake(
    take: Take,
    maskBase64: string,
    prompt: string,
    state: CinematicState,
    onTakeUpdated: (takeId: string, updates: Partial<Take>) => void
  ) {
    const apiKey = state.apiKeys.siliconFlow;
    onTakeUpdated(take.id, { status: "rendering" });

    if (!apiKey) {
      console.log("Simulating Inpaint for take", take.id);
      setTimeout(() => {
        onTakeUpdated(take.id, {
          status: "rendered",
          fullImageUrl: `https://picsum.photos/seed/${Math.random()}/1024/576` 
        });
      }, 4000);
      return;
    }

    try {
      const response = await fetch(`${SILICON_FLOW_URL}/images/inpainting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "black-forest-labs/FLUX.1-schnell", 
          image_url: take.fullImageUrl,
          mask_url: maskBase64,
          prompt: prompt,
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      
      const data = await response.json();
      if (data.images && data.images[0]) {
        onTakeUpdated(take.id, { status: "rendered", fullImageUrl: data.images[0].url });
      } else {
        throw new Error("No image returned");
      }
    } catch (err) {
      console.error(err);
      onTakeUpdated(take.id, { status: "failed" });
    }
  }

  static async renderAudio(
    shot: Shot,
    takeId: string,
    state: CinematicState,
    onTakeUpdated: (takeId: string, updates: Partial<Take>) => void
  ) {
    const apiKey = state.apiKeys.siliconFlow;
    const prompt = shot.ambientSoundPrompt || `Cinematic ambient sound for: ${shot.rawPrompt}`;
    
    onTakeUpdated(takeId, { status: "rendering" });

    if (!apiKey) {
      console.log("Simulating Audio generation for", prompt);
      setTimeout(() => {
        onTakeUpdated(takeId, {
          status: "rendered",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Mock audio
        });
      }, 3000);
      return;
    }

    try {
      // Using a hypothetical SiliconFlow audio generation endpoint or similar
      const response = await fetch(`${SILICON_FLOW_URL}/audio/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "stabilityai/stable-audio-open-1.0",
          prompt: prompt,
          duration: shot.duration || 5.0
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      
      const data = await response.json();
      if (data.audio_url) {
        onTakeUpdated(takeId, { status: "rendered", audioUrl: data.audio_url });
      } else {
        throw new Error("No audio URL returned");
      }
    } catch (err) {
      console.error(err);
      onTakeUpdated(takeId, { status: "failed" });
    }
  }
}
