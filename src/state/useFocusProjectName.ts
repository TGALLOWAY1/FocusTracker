import { useFocusStore } from "./focusStore";
import { useProjectStore } from "./projectStore";

const UNKNOWN_PROJECT = "Unknown Project";

// Resolves the *currently active* project's display name. Live — a
// rename in projectStore propagates to every consumer of this hook.
// For historical labels in the session log, read `session.projectName`
// (an immutable snapshot taken at completion time) instead.
export function useFocusProjectName(): string {
  const projectId = useFocusStore((s) => s.projectId);
  const projects = useProjectStore((s) => s.projects);
  return projects.find((p) => p.id === projectId)?.name ?? UNKNOWN_PROJECT;
}
