/** Max persisted fitness JSON blob size (~2 MB). */
export const MAX_FITNESS_PAYLOAD_BYTES = 2 * 1024 * 1024;

export function fitnessPayloadByteLength(payload: unknown): number {
  return new TextEncoder().encode(JSON.stringify(payload)).length;
}

export function isFitnessPayloadTooLarge(payload: unknown): boolean {
  return fitnessPayloadByteLength(payload) > MAX_FITNESS_PAYLOAD_BYTES;
}
