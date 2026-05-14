export type SubtopicStatus = "not-started" | "in-progress" | "completed";

export type LearningResourceKind = "video" | "book" | "pdf" | "article";

export type LearningResource = {
  id: string;
  title: string;
  kind: LearningResourceKind;
  meta?: string;
  url?: string;
};

export type LearningTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type LearningNote = {
  subtopicId: string;
  heading: string;
  intro: string;
  bullets: string[];
  insight: string;
  code: { language: string; source: string };
  userParagraphs: string[];
  attachments?: { id: string; dataUrl: string; name?: string }[];
};

export type LearningSubtopic = {
  id: string;
  numericLabel: string;
  title: string;
  description?: string;
  status: SubtopicStatus;
  progress?: number;
  resources?: LearningResource[];
  tasks?: LearningTask[];
  children?: LearningSubtopic[];
  note?: LearningNote;
};

export type LearningModule = {
  id: string;
  numericLabel: string;
  title: string;
  completedCount: number;
  totalCount: number;
  subtopics: LearningSubtopic[];
};

export type LearningPath = {
  id: string;
  title: string;
  subtitle: string;
  modules: LearningModule[];
  notionUrl?: string;
  lastSyncedAt?: number;
};

const ML_WORKFLOW_RESOURCES: LearningResource[] = [
  {
    id: "res-andrew-ng",
    title: "Andrew Ng — ML Course",
    kind: "video",
    meta: "Coursera",
  },
  {
    id: "res-hands-on-ml",
    title: "Hands-On ML — Chapter 1 & 2",
    kind: "book",
    meta: "Géron",
  },
  {
    id: "res-workflow-cheatsheet",
    title: "ML Workflow Cheatsheet",
    kind: "pdf",
    meta: "Reference",
  },
];

const DATA_PREP_NOTE: LearningNote = {
  subtopicId: "2.6.3",
  heading: "Data Preparation",
  intro:
    "Good data in, good model out. This step determines the quality and reliability of our model.",
  bullets: [
    "Handle missing values",
    "Remove duplicates",
    "Feature encoding",
    "Normalization / Standardization",
    "Train / Validation / Test split",
  ],
  insight:
    "Most ML problems are won or lost in the data preparation stage.",
  code: {
    language: "Python",
    source: `import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv("data.csv")
df = df.dropna()
X = df.drop("target", axis=1)
y = df["target"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)`,
  },
  userParagraphs: [],
};

const ML_WORKFLOW_CHILDREN: LearningSubtopic[] = [
  {
    id: "2.6.1",
    numericLabel: "2.6.1",
    title: "Problem Definition",
    description: "Framing the problem and defining success metrics.",
    status: "completed",
  },
  {
    id: "2.6.2",
    numericLabel: "2.6.2",
    title: "Data Collection",
    description: "Sources of data and data types.",
    status: "completed",
  },
  {
    id: "2.6.3",
    numericLabel: "2.6.3",
    title: "Data Preparation",
    description: "Cleaning, transforming, and splitting data.",
    status: "in-progress",
    progress: 0.6,
    note: DATA_PREP_NOTE,
  },
  {
    id: "2.6.4",
    numericLabel: "2.6.4",
    title: "Model Selection",
    description: "Choosing the right algorithm for the problem.",
    status: "not-started",
  },
  {
    id: "2.6.5",
    numericLabel: "2.6.5",
    title: "Training & Evaluation",
    description: "Training models and evaluating performance.",
    status: "not-started",
  },
  {
    id: "2.6.6",
    numericLabel: "2.6.6",
    title: "Deployment & Monitoring",
    description: "Putting models into production and monitoring.",
    status: "not-started",
  },
];

const CORE_CONCEPTS_SUBTOPICS: LearningSubtopic[] = [
  {
    id: "2.1",
    numericLabel: "2.1",
    title: "What is Machine Learning?",
    status: "completed",
  },
  {
    id: "2.2",
    numericLabel: "2.2",
    title: "Types of ML",
    status: "completed",
  },
  {
    id: "2.3",
    numericLabel: "2.3",
    title: "Supervised Learning",
    status: "completed",
  },
  {
    id: "2.4",
    numericLabel: "2.4",
    title: "Unsupervised Learning",
    status: "not-started",
  },
  {
    id: "2.5",
    numericLabel: "2.5",
    title: "Reinforcement Learning",
    status: "not-started",
  },
  {
    id: "2.6",
    numericLabel: "2.6",
    title: "ML Workflow Overview",
    description:
      "Understand the end-to-end workflow of a machine learning project.",
    status: "in-progress",
    progress: 0.5,
    resources: ML_WORKFLOW_RESOURCES,
    children: ML_WORKFLOW_CHILDREN,
  },
];

const FOUNDATIONS_SUBTOPICS: LearningSubtopic[] = [
  { id: "1.1", numericLabel: "1.1", title: "Math Refresher", status: "completed" },
  { id: "1.2", numericLabel: "1.2", title: "Python for ML", status: "completed" },
  { id: "1.3", numericLabel: "1.3", title: "Numpy & Pandas", status: "completed" },
  { id: "1.4", numericLabel: "1.4", title: "Data Visualization", status: "not-started" },
  { id: "1.5", numericLabel: "1.5", title: "Notebooks & Tooling", status: "not-started" },
];

const ADVANCED_SUBTOPICS: LearningSubtopic[] = [
  { id: "3.1", numericLabel: "3.1", title: "Neural Networks", status: "completed" },
  { id: "3.2", numericLabel: "3.2", title: "Deep Learning Basics", status: "completed" },
  { id: "3.3", numericLabel: "3.3", title: "Convolutional Networks", status: "not-started" },
  { id: "3.4", numericLabel: "3.4", title: "Recurrent Networks", status: "not-started" },
  { id: "3.5", numericLabel: "3.5", title: "Transformers", status: "not-started" },
  { id: "3.6", numericLabel: "3.6", title: "Reinforcement Learning Deep Dive", status: "not-started" },
];

const SPECIALIZATION_SUBTOPICS: LearningSubtopic[] = [
  { id: "4.1", numericLabel: "4.1", title: "Computer Vision", status: "not-started" },
  { id: "4.2", numericLabel: "4.2", title: "Natural Language Processing", status: "not-started" },
  { id: "4.3", numericLabel: "4.3", title: "Time Series Forecasting", status: "not-started" },
  { id: "4.4", numericLabel: "4.4", title: "Recommender Systems", status: "not-started" },
  { id: "4.5", numericLabel: "4.5", title: "MLOps", status: "not-started" },
];

export const MACHINE_LEARNING_PATH: LearningPath = {
  id: "machine-learning",
  title: "Machine Learning Path",
  subtitle: "Your personalized roadmap to mastery.",
  modules: [
    {
      id: "foundations",
      numericLabel: "1",
      title: "Foundations",
      completedCount: 3,
      totalCount: 5,
      subtopics: FOUNDATIONS_SUBTOPICS,
    },
    {
      id: "core-concepts",
      numericLabel: "2",
      title: "Core Concepts",
      completedCount: 4,
      totalCount: 6,
      subtopics: CORE_CONCEPTS_SUBTOPICS,
    },
    {
      id: "advanced-topics",
      numericLabel: "3",
      title: "Advanced Topics",
      completedCount: 2,
      totalCount: 6,
      subtopics: ADVANCED_SUBTOPICS,
    },
    {
      id: "specialization",
      numericLabel: "4",
      title: "Specialization",
      completedCount: 0,
      totalCount: 5,
      subtopics: SPECIALIZATION_SUBTOPICS,
    },
  ],
};

export function findSubtopic(
  path: LearningPath,
  id: string
): LearningSubtopic | null {
  for (const module of path.modules) {
    const found = findInList(module.subtopics, id);
    if (found) return found;
  }
  return null;
}

function findInList(
  list: LearningSubtopic[],
  id: string
): LearningSubtopic | null {
  for (const item of list) {
    if (item.id === id) return item;
    if (item.children) {
      const nested = findInList(item.children, id);
      if (nested) return nested;
    }
  }
  return null;
}
