import { useMemo, useState } from "react";
import { findSubtopic, type LearningNote } from "../../data/learningPath";
import { useLearningStore } from "../../state/learningStore";
import { LearningHeader } from "./LearningHeader";
import { PathFormModal } from "./PathFormModal";
import { ModuleOutline } from "./ModuleOutline";
import { TopicDetail } from "./TopicDetail";
import { NotesPanel } from "./NotesPanel";
import { useUIStore } from "../../state/uiStore";
import { PanelRightClose } from "lucide-react";

export function LearningPathPage() {
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen);
  const toggleRightSidebar = useUIStore((s) => s.toggleRightSidebar);
  const paths = useLearningStore((s) => s.paths);
  const activePathId = useLearningStore((s) => s.activePathId);
  const path = useMemo(
    () => paths.find((p) => p.id === activePathId),
    [paths, activePathId]
  );
  const expandedModuleIds = useLearningStore((s) => s.expandedModuleIds);
  const selectedSubtopicId = useLearningStore((s) => s.selectedSubtopicId);
  const notesSubtopicId = useLearningStore((s) => s.notesSubtopicId);
  const activeRightTab = useLearningStore((s) => s.activeRightTab);
  const viewMode = useLearningStore((s) => s.viewMode);
  const overviewVisible = useLearningStore((s) => s.overviewVisible);
  const outlineVisible = useLearningStore((s) => s.outlineVisible);

  const toggleModule = useLearningStore((s) => s.toggleModule);
  const expandAll = useLearningStore((s) => s.expandAll);
  const collapseAll = useLearningStore((s) => s.collapseAll);
  const selectSubtopic = useLearningStore((s) => s.selectSubtopic);
  const setNotesSubtopic = useLearningStore((s) => s.setNotesSubtopic);
  const setActiveTab = useLearningStore((s) => s.setActiveTab);
  const setViewMode = useLearningStore((s) => s.setViewMode);
  const toggleOverview = useLearningStore((s) => s.toggleOverview);
  const toggleOutline = useLearningStore((s) => s.toggleOutline);
  const appendUserParagraph = useLearningStore((s) => s.appendUserParagraph);
  const updateUserParagraph = useLearningStore((s) => s.updateUserParagraph);
  const removeUserParagraph = useLearningStore((s) => s.removeUserParagraph);
  const updateNote = useLearningStore((s) => s.updateNote);
  const initializeNote = useLearningStore((s) => s.initializeNote);

  const selectedTopic = useMemo(
    () => (path ? findSubtopic(path, selectedSubtopicId) : null),
    [path, selectedSubtopicId]
  );
  const notesSubtopic = useMemo(
    () => (path ? findSubtopic(path, notesSubtopicId) : null),
    [path, notesSubtopicId]
  );

  const [pathModalOpen, setPathModalOpen] = useState(false);

  if (!path) {
    return (
      <main className="min-w-0 flex flex-col overflow-hidden items-center justify-center p-8">
        <p className="text-text-muted mb-4">No learning path selected.</p>
        <button
          onClick={() => setPathModalOpen(true)}
          className="px-4 py-2 bg-brand-purple text-white rounded-lg"
        >
          Create Path
        </button>
        {pathModalOpen && (
          <PathFormModal open={pathModalOpen} onClose={() => setPathModalOpen(false)} />
        )}
      </main>
    );
  }

  const isNotesPrimary = !outlineVisible && !overviewVisible;

  let outlineColumnClass = "flex flex-1 min-h-0";
  if (outlineVisible && overviewVisible) {
    outlineColumnClass = "grid grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] flex-1 min-h-0";
  }

  return (
    <>
      <main className="min-w-0 flex flex-col overflow-hidden">
        <LearningHeader
          path={path}
          paths={paths}
          onCreatePath={() => setPathModalOpen(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          overviewVisible={overviewVisible}
          onToggleOverview={toggleOverview}
          outlineVisible={outlineVisible}
          onToggleOutline={toggleOutline}
        />

        <div className={outlineColumnClass}>
          {outlineVisible && (
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
          )}

          {overviewVisible && (
            <div className="overflow-y-auto scrollbar-thin p-6 flex-1">
              <TopicDetail
                topic={selectedTopic}
                notesSubtopicId={notesSubtopicId}
                onSelectChild={setNotesSubtopic}
                onHideOverview={toggleOverview}
              />
            </div>
          )}

          {isNotesPrimary && (
            <div className="overflow-y-auto scrollbar-thin p-6 flex-1 max-w-3xl mx-auto w-full">
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
            </div>
          )}
        </div>
      </main>

      {rightSidebarOpen && !isNotesPrimary && (
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

      {pathModalOpen && (
        <PathFormModal open={pathModalOpen} onClose={() => setPathModalOpen(false)} />
      )}
    </>
  );
}
