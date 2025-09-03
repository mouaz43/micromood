export type MoodKind = 'HAPPY'|'SAD'|'STRESSED'|'CALM'|'ENERGIZED'|'TIRED';

export type PulseDTO = {
  id: string;
  lat: number;
  lng: number;
  mood: MoodKind;
  energy: number;
  text: string | null;
  createdAt: string;
};

export function isMood(x: string): x is MoodKind {
  return ['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED'].includes(x.toUpperCase());
}
