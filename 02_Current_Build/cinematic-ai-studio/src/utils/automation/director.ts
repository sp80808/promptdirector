import { CinematicState, Shot, Take } from "../../types";
import { GenerationAPI } from "../api";
import { useStore } from "../../store";

export class AutoDirector {
  static async produceScene(sceneId: string, store: any) {
    const state: CinematicState = store.getState();
    const scene = state.scenes.find(s => s.id === sceneId);
    
    if (!scene) return;

    console.log(`[AutoDirector] Starting production for Scene: ${scene.title}`);

    for (const shotId of scene.shotIds) {
      const shot = store.getState().shots[shotId];
      if (!shot) continue;

      console.log(`[AutoDirector] Directing Shot: ${shot.title}`);

      // 1. Generate Visuals
      const takeId = await this.generateVisual(shot, store);
      if (!takeId) {
        console.error(`[AutoDirector] Failed to generate visual for ${shot.title}`);
        continue;
      }

      // 2. Approve the Take automatically
      store.getState().approveTake(shotId, takeId);
      console.log(`[AutoDirector] Approved take ${takeId} for shot ${shot.title}`);

      // Re-fetch take after approval
      const approvedTake = store.getState().shots[shotId].takes.find((t: Take) => t.id === takeId);

      // 3. Generate Audio / Foley
      if (shot.ambientSoundPrompt) {
        await this.generateFoley(shot, takeId, store);
      }

      // 4. Generate Dialogue & Lip Sync
      if (shot.dialogue && shot.speakingCharacterId) {
        const char = state.characters.find(c => c.id === shot.speakingCharacterId);
        const voiceId = char?.voiceId || "default_voice";
        
        await this.generateSpeechAndSync(shot, approvedTake, voiceId, store);
      }
    }
    
    console.log(`[AutoDirector] Scene ${scene.title} production complete!`);
    alert(`Auto-Director has finished producing scene: ${scene.title}`);
  }

  private static generateVisual(shot: Shot, store: any): Promise<string | null> {
    return new Promise(async (resolve) => {
      let createdTakeId: string | null = null;
      let isResolved = false;

      await GenerationAPI.renderShot(
        shot,
        store.getState(),
        (takeId) => {
          createdTakeId = takeId;
          store.getState().addTake(shot.id, { 
            id: takeId, 
            shotId: shot.id, 
            seed: 0, 
            status: "rendering", 
            rating: 0, 
            createdAt: Date.now() 
          });
        },
        (takeId, updates) => {
          store.getState().updateTake(shot.id, takeId, updates);
          if (updates.status === "rendered" || updates.status === "failed") {
            if (!isResolved) {
              isResolved = true;
              resolve(updates.status === "rendered" ? takeId : null);
            }
          }
        }
      );
    });
  }

  private static generateFoley(shot: Shot, takeId: string, store: any): Promise<void> {
    return new Promise(async (resolve) => {
      let isResolved = false;
      await GenerationAPI.renderAudio(
        shot,
        takeId,
        store.getState(),
        (tid, updates) => {
          store.getState().updateTake(shot.id, tid, updates);
          if (updates.status === "rendered" || updates.status === "failed") {
             if (!isResolved) {
               isResolved = true;
               resolve();
             }
          }
        }
      );
    });
  }

  private static generateSpeechAndSync(shot: Shot, take: Take, voiceId: string, store: any): Promise<void> {
    return new Promise(async (resolve) => {
      let isResolved = false;
      
      // 1. Generate Speech
      await GenerationAPI.generateSpeech(
        shot.dialogue!,
        voiceId,
        store.getState(),
        async (tid, updates) => {
          store.getState().updateTake(shot.id, tid, updates);
          
          if (updates.speechUrl) {
            // 2. Once speech is ready, trigger Lip Sync
            await GenerationAPI.generateLipSync(
              take,
              updates.speechUrl,
              store.getState(),
              (syncTid, syncUpdates) => {
                store.getState().updateTake(shot.id, syncTid, syncUpdates);
                if (syncUpdates.status === "rendered" || syncUpdates.status === "failed") {
                  if (!isResolved) {
                    isResolved = true;
                    resolve();
                  }
                }
              }
            );
          } else if (updates.status === "failed") {
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          }
        },
        take.id
      );
    });
  }
}
