import { Scene, Shot } from "../types";

/**
 * Mocks downloading the sequence as an OpenTimelineIO (.otio) or EDL file.
 * For now, this just exports a structured JSON representation of the approved takes.
 */
export function downloadOTIO(scenes: Scene[], shots: Record<string, Shot>) {
  const sequence = scenes.map(scene => ({
    id: scene.id,
    title: scene.title,
    shots: scene.shotIds.map(shotId => {
      const shot = shots[shotId];
      const approvedTake = shot?.approvedTakeId 
        ? shot.takes.find(t => t.id === shot.approvedTakeId) 
        : null;

      return {
        id: shot?.id,
        title: shot?.title,
        prompt: shot?.rawPrompt,
        approvedTakeUrl: approvedTake?.videoUrl || approvedTake?.fullImageUrl || null,
        metadata: approvedTake?.metadata || null,
      };
    })
  }));

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
    schema: "Cinematic.AI v5.0 Sequence",
    timestamp: new Date().toISOString(),
    sequence
  }, null, 2));

  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "sequence_export.json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
