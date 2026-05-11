export function newId(prefix = "id"): string {
  const cryptoObj =
    typeof globalThis !== "undefined" ? globalThis.crypto ?? null : null;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
