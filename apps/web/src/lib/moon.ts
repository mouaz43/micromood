// apps/web/src/lib/moon.ts
// Generate realistic moon phases as inline SVG

export function energyToPhaseFraction(energy: number): number {
  // map 1..5 energy to 0..1 (new → full)
  return (energy - 1) / 4;
}

export function energyTint(energy: number): string {
  const shades = ["#222831", "#393E46", "#6B7280", "#E5E7EB", "#F9FAFB"];
  return shades[energy - 1] || "#E5E7EB";
}

export function makeMoonSVG({
  phaseFrac,
  tint,
  size = 32,
}: {
  phaseFrac: number; // 0..1 (0=new, 0.5=full, 1=new again)
  tint: string;
  size?: number;
}): string {
  const r = size / 2;
  const cx = r;
  const cy = r;

  // illumination offset (how much shadow)
  const offset = Math.cos(phaseFrac * 2 * Math.PI) * r;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="moon-clip">
          <circle cx="${cx}" cy="${cy}" r="${r}" />
        </clipPath>
      </defs>
      <!-- full moon background -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${tint}" />
      <!-- shadow disk shifted horizontally -->
      <circle cx="${cx + offset}" cy="${cy}" r="${r}" fill="black" clip-path="url(#moon-clip)" />
    </svg>
  `;
}
