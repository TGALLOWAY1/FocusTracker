import { Card, CardHeader } from "../ui/Card";

function PhasePlaceholder({
  title,
  trailing,
  phase,
  minHeight = 160,
}: {
  title: string;
  trailing?: string;
  phase: string;
  minHeight?: number;
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        trailing={
          trailing ? (
            <span className="text-xs text-text-muted">{trailing}</span>
          ) : undefined
        }
      />
      <div
        className="mt-4 rounded-xl border border-dashed border-border-subtle bg-bg-base/40 flex items-center justify-center text-xs text-text-muted"
        style={{ minHeight }}
      >
        {phase}
      </div>
    </Card>
  );
}

export function RightPanel() {
  return (
    <aside className="hidden lg:flex flex-col gap-5 border-l border-border-subtle p-6 min-h-0 overflow-y-auto scrollbar-thin">
      <PhasePlaceholder
        title="Focus Ladder"
        trailing="View All"
        phase="Tier progression arrives in Phase 3"
        minHeight={220}
      />
      <PhasePlaceholder
        title="Focus Stats"
        trailing="This Week"
        phase="Stats + chart arrive in Phase 6"
        minHeight={220}
      />
      <PhasePlaceholder
        title="Active Projects"
        trailing="Manage"
        phase="Project list arrives in Phase 4"
        minHeight={200}
      />
    </aside>
  );
}
