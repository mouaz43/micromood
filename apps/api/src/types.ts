export type MoodName =
  | 'happy'
  | 'sad'
  | 'stressed'
  | 'calm'
  | 'energized'
  | 'tired';

export interface NewPulseInput {
  mood: MoodName;
  energy: number;        // 1..5
  text?: string;         // <=150
  lat: number;
  lng: number;
}

export interface PulseDTO {
  id: string;
  mood: MoodName;
  energy: number;
  text?: string;
  lat: number;
  lng: number;
  createdAt: string;   // ISO
}
