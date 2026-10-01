// Welke geluiden echt zijn opgenomen, volgens bronbestanden/audio-manifest*.json (alleen
// regels die met verwerk-opname.py zijn ingesproken en geknipt). Zo speelt een scherm
// alleen af wat bestaat, zonder 404's voor nog niet ingesproken zinnen.
type ManifestRegel = { path: string };
const manifesten = import.meta.glob<ManifestRegel[]>('../../bronbestanden/audio-manifest*.json', {
  eager: true,
  import: 'default',
});

const OPGENOMEN = new Set(
  Object.values(manifesten)
    .flat()
    .map((regel) => regel.path.replace(/^public\//, '')),
);

// pad zoals de app het gebruikt, bv. 'assets/audio/woorden/vis.mp3'
export function isOpgenomen(pad: string): boolean {
  return OPGENOMEN.has(pad);
}
