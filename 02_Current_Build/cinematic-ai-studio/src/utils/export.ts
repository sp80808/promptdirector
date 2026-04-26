import { Scene, Shot } from "../types";
export function downloadProductionBible(state: {
  characters: any[],
  locations: any[],
  scenes: any[],
  shots: Record<string, any>
}) {
  let md = `# PRODUCTION BIBLE: CINEMATIC.AI v5.0\n\n`;
  md += `Generated on: ${new Date().toLocaleString()}\n\n`;

  md += `## 👥 CHARACTER BIBLE\n\n`;
  state.characters.forEach(c => {
    md += `### ${c.displayName} (@${c.name})\n`;
    md += `- **Traits**: ${c.traits}\n`;
    md += `- **Seed**: ${c.seed}\n`;
    md += `- **Outfits**: ${c.outfits.map((o: any) => o.name).join(", ") || 'None'}\n\n`;
  });

  md += `## 📍 LOCATION SCOUT\n\n`;
  state.locations.forEach(l => {
    md += `### ${l.name}\n`;
    md += `- **Description**: ${l.description}\n`;
    md += `- **Lighting**: ${l.lightingMood} (${l.timeOfDay})\n\n`;
  });

  md += `## 🎬 SEQUENCE BREAKDOWN\n\n`;
  state.scenes.forEach(scene => {
    md += `### SCENE: ${scene.title}\n\n`;
    scene.shotIds.forEach((sid: string, idx: number) => {
      const shot = state.shots[sid];
      if (!shot) return;
      md += `#### SHOT ${idx + 1}: ${shot.title}\n`;
      md += `- **Prompt**: ${shot.rawPrompt}\n`;
      md += `- **Optics**: ${shot.optics || 'Not specified'}\n`;
      md += `- **Motion**: ${shot.motion || 'Not specified'}\n`;
      md += `- **Approved Take**: ${shot.approvedTakeId ? 'YES' : 'NONE'}\n\n`;
    });
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = "Production_Bible.md";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function saveProjectFile(state: any) {
  const projectData = {
    schema: "Cinematic.AI v5.0 Project",
    timestamp: new Date().toISOString(),
    characters: state.characters,
    locations: state.locations,
    props: state.props,
    scenes: state.scenes,
    shots: state.shots
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `Cinematic_Project_${Date.now()}.cai`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

/**
 * Mocks downloading the sequence as an OpenTimelineIO (.otio) or EDL file.
...
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
