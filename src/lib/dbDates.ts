export function epochMsToIso(ms: number): string {
  return new Date(ms).toISOString();
}

export function isoToEpochMs(iso: string): number {
  return Date.parse(iso);
}
