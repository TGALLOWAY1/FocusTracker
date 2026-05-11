export function formatRelativeDate(timestamp: number, now: number = Date.now()): string {
  const diffMs = Math.max(0, now - timestamp);
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 24) return "Today";
  if (diffHours < 48) return "Yesterday";
  const days = Math.floor(diffHours / 24);
  return `${days}d ago`;
}
