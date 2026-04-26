import { Scene, Shot } from "../types";

/**
 * eCoT: OpenTimelineIO (OTIO) Export Utility
 * Generates a standard OTIO JSON structure for importing into 
 * professional NLEs like DaVinci Resolve or Premiere Pro.
 */

export function generateOTIO(scenes: Scene[], shots: Record<string, Shot>) {
  const clips = scenes.flatMap(scene => 
    scene.shotIds.map(shotId => {
      const shot = shots[shotId];
      // Find the approved take if it exists
      const approvedTake = shot.takes.find(t => t.id === shot.approvedTakeId);
      
      return {
        "OTIO_SCHEMA": "Clip.1",
        "name": shot.title || shot.rawPrompt || shot.id,
        "media_reference": {
          "OTIO_SCHEMA": "ExternalReference.1",
          "target_url": approvedTake?.videoUrl || `placeholder_${shot.id}.mp4`
        },
        "metadata": {
          "cinematic_ai": {
            "prompt": shot.rawPrompt,
            "seed": approvedTake?.seed,
            "scene": scene.title
          }
        }
      };
    })
  );

  const otio = {
    "OTIO_SCHEMA": "Timeline.1",
    "name": "Cinematic.AI Sequence Export",
    "tracks": {
      "OTIO_SCHEMA": "Stack.1",
      "children": [
        {
          "OTIO_SCHEMA": "Track.1",
          "kind": "Video",
          "children": clips
        }
      ]
    }
  };

  return JSON.stringify(otio, null, 2);
}

export function downloadOTIO(scenes: Scene[], shots: Record<string, Shot>) {
  const json = generateOTIO(scenes, shots);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `sequence_${new Date().toISOString().split('T')[0]}.otio`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
