import Dexie, { type Table } from 'dexie';
import type { Dream, Goal, Milestone, Achievement, Reflection } from '../types';


export class WinlogDatabase extends Dexie {
  dreams!: Table<Dream, string>;
  goals!: Table<Goal, string>;
  milestones!: Table<Milestone, string>;
  achievements!: Table<Achievement, string>;
  reflections!: Table<Reflection, string>;

  constructor() {
    super('WinlogDatabase');
    this.version(1).stores({
      dreams: 'id, status, createdAt',
      goals: 'id, dreamId, status, priority, targetDate',
      milestones: 'id, goalId, status, dueDate',
      achievements: 'id, date, category, relatedDreamId, relatedGoalId',
      reflections: 'id, relatedDreamId, relatedGoalId, createdAt',
    });
  }
}

export const db = new WinlogDatabase();
