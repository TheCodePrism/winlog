export interface Dream {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: "active" | "paused" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  dreamId?: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: "not_started" | "in_progress" | "completed" | "paused";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  status: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
  relatedDreamId?: string;
  relatedGoalId?: string;
  createdAt: string;
}

export interface Reflection {
  id: string;
  title?: string;
  content: string;
  mood?: string;
  relatedDreamId?: string;
  relatedGoalId?: string;
  createdAt: string;
  updatedAt: string;
}
