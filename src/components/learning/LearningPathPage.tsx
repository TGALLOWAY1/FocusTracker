import { useMemo } from "react";
import { findSubtopic, type LearningNote } from "../../data/learningPath";
import { useLearningStore } from "../../state/learningStore";
import { LearningHeader } from "./LearningHeader";
import { ModuleOutline } from "./ModuleOutline";
import { TopicDetail } from "./TopicDetail";
import { NotesPanel } from "./NotesPanel";
import { useUIStore } from "../../state/uiStore";
import { PanelRightClose } from "lucide-react";

export function LearningPathPage() {
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen);
  const toggleRightSidebar = useUIStore((s) => s.toggleRightSidebar);
  const path = useLearningStore((s) => s.path);
  const expandedModuleIds = useLearningStore((s) => s.expandedModuleIds);
  const selectedSubtopicId = useLearningStore((s) => s.selectedSubtopicId);
  const notesSubtopicId = useLearningStore((s) => s.notesSubtopicId);
  const activeRightTab = useLearningStore((s) => s.activeRightTab);
  const viewMode = useLearningStore((s) => s.viewMode);
  const overviewVisible = useLearningStore((s) => s.overviewVisible);

  const toggleModule = useLearningStore((s) => s.toggleModule);
  const expandAll = useLearningStore((s) => s.expandAll);
  const collapseAll = useLearningStore((s) => s.collapseAll);
  const selectSubtopic = useLearningStore((s) => s.selectSubtopic);
  const setNotesSubtopic = useLearningStore((s) => s.setNotesSubtopic);
  const setActiveTab = useLearningStore((s) => s.setActiveTab);
  const setViewMode = useLearningStore((s) => s.setViewMode);
  const toggleOverview = useLearningStore((s) => s.toggleOverview);
  const appendUserParagraph = useLearningStore((s) => s.appendUserParagraph);
  const updateUserParagraph = useLearningStore((s) => s.updateUserParagraph);
  const removeUserParagraph = useLearningStore((s) => s.removeUserParagraph);
  const updateNote = useLearningStore((s) => s.updateNote);
  const initializeNote = useLearningStore((s) => s.initializeNote);

  const selectedTopic = useMemo(
    () => findSubtopic(path, selectedSubtopicId),
    [path, selectedSubtopicId]
  );
  const notesSubtopic = useMemo(
    () => findSubtopic(path, notesSubtopicId),
    [path, notesSubtopicId]
  );

  const outlineColumnClass = overviewVisible
    ? "grid grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] flex-1 min-h-0"
    : "flex flex-1 min-h-0";

  return (
    <>
      <main className="min-w-0 flex flex-col overflow-hidden">
        <LearningHeader
          title={path.title}
          subtitle={path.subtitle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          overviewVisible={overviewVisible}
          onToggleOverview={toggleOverview}
        />

        <div className={outlineColumnClass}>
          <div
            className={[
              "border-r border-border-subtle overflow-y-auto scrollbar-thin p-4",
              overviewVisible ? "" : "flex-1 max-w-2xl",
            ].join(" ")}
          >
            <ModuleOutline
              modules={path.modules}
              expandedModuleIds={expandedModuleIds}
              selectedSubtopicId={selectedSubtopicId}
              onToggleModule={toggleModule}
              onSelectSubtopic={selectSubtopic}
              onExpandAll={expandAll}
              onCollapseAll={collapseAll}
            />
          </div>

          {overviewVisible && (
            <div className="overflow-y-auto scrollbar-thin p-6">
              <TopicDetail
                topic={selectedTopic}
                notesSubtopicId={notesSubtopicId}
                onSelectChild={setNotesSubtopic}
                onHideOverview={toggleOverview}
              />
            </div>
          )}
        </div>
      </main>

      {rightSidebarOpen && (
        <aside className="relative hidden lg:flex flex-col border-l border-border-subtle p-5 min-h-0">
          <button
            onClick={toggleRightSidebar}
            className="absolute top-3 right-3 z-10 p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-md transition-colors"
            title="Collapse side panel"
          >
            <PanelRightClose size={16} />
          </button>
          <NotesPanel
            subtopic={notesSubtopic}
            activeTab={activeRightTab}
            onTabChange={setActiveTab}
            onAppendNote={appendUserParagraph}
            onUpdateUserParagraph={updateUserParagraph}
            onRemoveUserParagraph={removeUserParagraph}
            onUpdateNote={(partial: Partial<LearningNote>) => {
              if (notesSubtopic) updateNote(notesSubtopic.id, partial);
            }}
            onStartNote={() => {
              if (notesSubtopic) initializeNote(notesSubtopic.id);
            }}
          />
        </aside>
      )}
    </>
  );
}
