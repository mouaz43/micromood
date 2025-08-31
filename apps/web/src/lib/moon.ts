// simple phase fraction: 0=new, 1=full, 2=new
export function phaseFraction(date = new Date()): number {
  const synodic = 29.53058867; // days
  const knownNew = Date.UTC(2000, 0, 6, 18, 14); // reference new moon
  const days = (date.getTime() - knownNew) / (1000 * 60 * 60 * 24);
  const cycle = (days % synodic + synodic) % synodic;
  return (cycle / synodic) * 2;
}

// map mood → phase aesthetic
export function phaseForMood(mood: string): number {
  switch (mood) {
    case "happy":
      return 1.0; // full
    case "sad":
      return 0.0; // new
    case "stressed":
      return 1.6; // waning crescent
    case "calm":
      return 0.4; // waxing crescent
    case "energized":
      return 0.85; // gibbous
    case "tired":
      return 1.5; // last quarter-ish
    default:
      return phaseFraction();
  }
}
