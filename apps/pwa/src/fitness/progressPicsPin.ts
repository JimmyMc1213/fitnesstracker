/** Client-side obscurity for progress-pic gallery lock (not server auth). */
export function isValidProgressPicsPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function hashProgressPicsPin(pin: string): string {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) + h) ^ pin.charCodeAt(i);
  }
  return `pp${(h >>> 0).toString(36)}`;
}

export function verifyProgressPicsPin(pin: string, pinHash: string): boolean {
  if (!isValidProgressPicsPin(pin)) return false;
  return hashProgressPicsPin(pin) === pinHash;
}
