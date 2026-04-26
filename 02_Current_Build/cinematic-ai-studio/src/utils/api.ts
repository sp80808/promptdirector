import { CinematicState, Shot, Take } from "../types";
import { PromptOrchestrator } from "./orchestrator";
import { auditTake } from "../services/ai";

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
    const googleKey = state.apiKeys.google;
    
    const finalPrompt = PromptOrchestrator.buildGenerationPayload(shot, state);
    const { settings } = shot;

    // Frame chaining: Get init_image from previous shot's approved take
    let initImageUrl: string | undefined;
    if (shot.usePreviousFrameAsInit) {
      const currentScene = state.scenes.find(s => s.id === shot.sceneId);
      if (currentScene) {
        const currentIndex = currentScene.shotIds.indexOf(shot.id);
        if (currentIndex > 0) {
          const prevShotId = currentScene.shotIds[currentIndex - 1];
          const prevShot = state.shots[prevShotId];
          if (prevShot?.approvedTakeId) {
            const prevTake = prevShot.takes.find(t => t.id === prevShot.approvedTakeId);
            if (prevTake?.fullImageUrl) {
              initImageUrl = prevTake.fullImageUrl;
            }
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
    const takeId = Math.random().toString(36).slice(2, 11);

    onTakeCreated(takeId);

    // Simulated mode (no API key)
    if (!apiKey) {
      console.log("No API key provided. Simulating generation...\nPrompt:", finalPrompt.substring(0, 100) + "...");
      this.simulateProgress(takeId, onTakeUpdated);
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
      
      if (initImageUrl) {
        payload.image_url = initImageUrl;
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

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      
      if (data.images && data.images[0]) {
        const imageUrl = data.images[0].url;
        onTakeUpdated(takeId, {
          status: "rendered",
          thumbUrl: imageUrl,
          fullImageUrl: imageUrl,
        });

        // Trigger VLM Audit in the background
        if (googleKey) {
          const charDetails = shot.characterIds.map(cid => {
             const c = state.characters.find(char => char.id === cid);
             return c ? `${c.displayName}: ${c.traits}` : '';
          }).join(", ");
          
          auditTake(googleKey, imageUrl, finalPrompt, charDetails)
            .then(analysis => {
              onTakeUpdated(takeId, { vlmAnalysis: analysis });
              
              // Auto-Approval Logic
              const config = state.automationConfig?.autoApproval;
              if (config?.enabled && analysis.consistencyScore >= (config.minScore * 10)) {
                console.log(`[VLM Audit] Score ${analysis.consistencyScore}% meets threshold. Auto-approving take ${takeId}.`);
                state.approveTake(shot.id, takeId);
              }
            })
            .catch(e => console.error("Audit background error:", e));
        }
      } else {
        throw new Error("No image returned from API");
      }
    } catch (err: any) {
      console.error("[GenerationAPI]", err);
      onTakeUpdated(takeId, { status: "failed" });
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
      setTimeout(() => {
        onTakeUpdated(take.id, {
          status: "rendered",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" 
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
          prompt: take.metadata?.prompt || "Cinematic motion",
          seed: Math.floor(Math.random() * 999999999)
        })
      });

      const data = await response.json();
      if (data.video_url) onTakeUpdated(take.id, { status: "rendered", videoUrl: data.video_url });
    } catch (err) {
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
      setTimeout(() => {
        onTakeUpdated(take.id, {
          status: "rendered",
          fullImageUrl: `https://picsum.photos/seed/${take.seed}/2048/1152`
        });
      }, 3000);
      return;
    }

    try {
      const response = await fetch(`${SILICON_FLOW_URL}/images/upscale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ image_url: take.fullImageUrl, scale: 2 })
      });
      const data = await response.json();
      if (data.url) onTakeUpdated(take.id, { status: "rendered", fullImageUrl: data.url });
    } catch (err) {
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
      const data = await response.json();
      if (data.images && data.images[0]) onTakeUpdated(take.id, { status: "rendered", fullImageUrl: data.images[0].url });
    } catch (err) {
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
    onTakeUpdated(takeId, { status: "rendering" });

    if (!apiKey) {
      setTimeout(() => {
        onTakeUpdated(takeId, {
          status: "rendered",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        });
      }, 3000);
      return;
    }

    try {
      const response = await fetch(`${SILICON_FLOW_URL}/audio/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "stabilityai/stable-audio-open-1.0",
          prompt: shot.ambientSoundPrompt,
          duration: shot.duration || 5.0
        })
      });
      const data = await response.json();
      if (data.audio_url) onTakeUpdated(takeId, { status: "rendered", audioUrl: data.audio_url });
    } catch (err) {
      onTakeUpdated(takeId, { status: "failed" });
    }
  }

  static async generateSpeech(
    text: string,
    voiceId: string,
    state: CinematicState,
    onTakeUpdated: (takeId: string, updates: Partial<Take>) => void,
    takeId: string
  ) {
    const apiKey = state.apiKeys.siliconFlow;
    onTakeUpdated(takeId, { status: "rendering" });

    if (!apiKey) {
      setTimeout(() => {
        onTakeUpdated(takeId, {
          speechUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" // Mock speech
        });
      }, 2000);
      return;
    }

    try {
      const response = await fetch(`${SILICON_FLOW_URL}/audio/speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "fishaudio/fish-speech-1.4",
          input: text,
          voice: voiceId
        })
      });
      const data = await response.json();
      if (data.audio_url) onTakeUpdated(takeId, { speechUrl: data.audio_url });
    } catch (err) {
      console.error(err);
    }
  }

  static async generateLipSync(
    take: Take,
    audioUrl: string,
    state: CinematicState,
    onTakeUpdated: (takeId: string, updates: Partial<Take>) => void
  ) {
    const apiKey = state.apiKeys.siliconFlow;
    onTakeUpdated(take.id, { status: "rendering" });

    if (!apiKey) {
      setTimeout(() => {
        onTakeUpdated(take.id, {
          status: "rendered",
          lipSyncUrl: "https://www.w3schools.com/html/mov_bbb.mp4" // Mock lip-sync
        });
      }, 4000);
      return;
    }

    try {
      const response = await fetch(`${SILICON_FLOW_URL}/video/lipsync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "tencent/LivePortrait",
          source_url: take.fullImageUrl || take.videoUrl,
          audio_url: audioUrl
        })
      });
      const data = await response.json();
      if (data.video_url) onTakeUpdated(take.id, { status: "rendered", lipSyncUrl: data.video_url });
    } catch (err) {
      onTakeUpdated(take.id, { status: "failed" });
    }
  }

  private static simulateProgress(takeId: string, onTakeUpdated: (takeId: string, updates: Partial<Take>) => void) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        onTakeUpdated(takeId, {
          status: "rendered",
          thumbUrl: `https://picsum.photos/seed/${Math.random()}/1024/576`,
          fullImageUrl: `https://picsum.photos/seed/${Math.random()}/1024/576`,
        });
      } else {
        onTakeUpdated(takeId, { progress, status: "rendering" });
      }
    }, 800);
  }
}
