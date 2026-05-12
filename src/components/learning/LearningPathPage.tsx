import { useMemo } from "react";
import { findSubtopic } from "../../data/learningPath";
import { useLearningStore } from "../../state/learningStore";
import { LearningHeader } from "./LearningHeader";
import { ModuleOutline } from "./ModuleOutline";
import { TopicDetail } from "./TopicDetail";
import { NotesPanel } from "./NotesPanel";

export function LearningPathPage() {
  const path = useLearningStore((s) => s.path);
  const expandedModuleIds = useLearningStore((s) => s.expandedModuleIds);
  const selectedSubtopicId = useLearningStore((s) => s.selectedSubtopicId);
  const notesSubtopicId = useLearningStore((s) => s.notesSubtopicId);
  const activeRightTab = useLearningStore((s) => s.activeRightTab);
  const viewMode = useLearningStore((s) => s.viewMode);

  const toggleModule = useLearningStore((s) => s.toggleModule);
  const selectSubtopic = useLearningStore((s) => s.selectSubtopic);
  const setNotesSubtopic = useLearningStore((s) => s.setNotesSubtopic);
  const setActiveTab = useLearningStore((s) => s.setActiveTab);
  const setViewMode = useLearningStore((s) => s.setViewMode);
  const appendUserParagraph = useLearningStore((s) => s.appendUserParagraph);

  const selectedTopic = useMemo(
    () => findSubtopic(path, selectedSubtopicId),
    [path, selectedSubtopicId]
  );
  const notesSubtopic = useMemo(
    () => findSubtopic(path, notesSubtopicId),
    [path, notesSubtopicId]
  );

  return (
    <>
      <main className="min-w-0 flex flex-col overflow-hidden">
        <LearningHeader
          title={path.title}
          subtitle={path.subtitle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="grid grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] flex-1 min-h-0">
          <div className="border-r border-border-subtle overflow-y-auto scrollbar-thin p-4">
            <ModuleOutline
              modules={path.modules}
              expandedModuleIds={expandedModuleIds}
              selectedSubtopicId={selectedSubtopicId}
              onToggleModule={toggleModule}
              onSelectSubtopic={selectSubtopic}
            />
          </div>

          <div className="overflow-y-auto scrollbar-thin p-6">
            <TopicDetail
              topic={selectedTopic}
              notesSubtopicId={notesSubtopicId}
              onSelectChild={setNotesSubtopic}
            />
          </div>
        </div>
      </main>

      <aside className="hidden lg:flex flex-col border-l border-border-subtle p-5 min-h-0">
        <NotesPanel
          subtopic={notesSubtopic}
          activeTab={activeRightTab}
          onTabChange={setActiveTab}
          onAppendNote={appendUserParagraph}
        />
      </aside>
    </>
  );
}
