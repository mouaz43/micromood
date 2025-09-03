export type NewPulse = {
  lat: number;
  lng: number;
  mood: 'HAPPY' | 'SAD' | 'STRESSED' | 'CALM' | 'ENERGIZED' | 'TIRED';
  energy: number; // 1-5
  text?: string;
};

export type PulseDTO = {
  id: number | string;
  lat: number;
  lng: number;
  mood: NewPulse['mood'];
  energy: number;
  text?: string | null;
  createdAt: string;
};
