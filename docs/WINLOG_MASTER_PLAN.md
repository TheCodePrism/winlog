# Web App Plan: Milestones, Achievements, Dreams & Success Tracker

## 1. App Goal

Build a private-first web app that helps users track:

- Dreams
- Goals
- Milestones
- Achievements
- Progress notes
- Reflections
- Success stories

The app should work offline using IndexedDB and allow users to export/import their data as a backup file.

---

## 2. Core Features

### 2.1 Dashboard

Show a quick overview of:

- Total dreams
- Active goals
- Completed milestones
- Recent achievements
- Progress this week/month
- Motivational summary

### 2.2 Dreams

A dream is a big long-term aspiration.

Fields:

```ts
Dream {
  id: string
  title: string
  description?: string
  category?: string
  status: "active" | "paused" | "completed" | "archived"
  createdAt: string
  updatedAt: string
}
```

Features:

- Create dream
- Edit dream
- Archive dream
- Mark dream as completed
- Link goals to a dream

---

### 2.3 Goals

A goal is a concrete objective connected to a dream.

```ts
Goal {
  id: string
  dreamId?: string
  title: string
  description?: string
  targetDate?: string
  status: "not_started" | "in_progress" | "completed" | "paused"
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}
```

Features:

- Create goal
- Edit goal
- Set priority
- Set target date
- Mark as completed
- Link milestones to goals

---

### 2.4 Milestones

A milestone is a meaningful checkpoint.

```ts
Milestone {
  id: string
  goalId?: string
  title: string
  description?: string
  dueDate?: string
  completedAt?: string
  status: "pending" | "completed"
  createdAt: string
  updatedAt: string
}
```

Features:

- Add milestone
- Mark milestone complete
- View upcoming milestones
- View completed milestones

---

### 2.5 Achievements

Achievements are wins the user wants to remember.

```ts
Achievement {
  id: string
  title: string
  description?: string
  date: string
  category?: string
  relatedDreamId?: string
  relatedGoalId?: string
  createdAt: string
}
```

Features:

- Add achievement
- Attach achievement to dream or goal
- View achievement timeline
- Filter by category/date

---

### 2.6 Reflections / Journal Notes

Users can write reflections about their journey.

```ts
Reflection {
  id: string
  title?: string
  content: string
  mood?: string
  relatedDreamId?: string
  relatedGoalId?: string
  createdAt: string
  updatedAt: string
}
```

Features:

- Add reflection
- Edit reflection
- Filter by dream, goal, mood, or date

---

## 3. Storage Plan

Use IndexedDB for browser-based local storage.

Recommended library:

```bash
npm install dexie
```

Use Dexie as a wrapper around IndexedDB.

Database structure:

```ts
db.version(1).stores({
  dreams: "id, status, createdAt, updatedAt",
  goals: "id, dreamId, status, priority, targetDate, createdAt",
  milestones: "id, goalId, status, dueDate, createdAt",
  achievements: "id, date, category, relatedDreamId, relatedGoalId",
  reflections: "id, relatedDreamId, relatedGoalId, createdAt",
});
```

---

## 4. Export / Import

### 4.1 Export

Allow user to export all data as JSON.

Export format:

```json
{
  "app": "success-tracker",
  "version": 1,
  "exportedAt": "2026-06-15T00:00:00.000Z",
  "data": {
    "dreams": [],
    "goals": [],
    "milestones": [],
    "achievements": [],
    "reflections": []
  }
}
```

Features:

- Export button
- Download `.json` file
- Filename example: `success-tracker-backup-2026-06-15.json`

---

### 4.2 Import

Allow user to import a previous JSON backup.

Import behavior:

- Validate file format
- Confirm before import
- Option 1: Replace all existing data
- Option 2: Merge imported data with existing data
- Avoid duplicates by checking `id`

Recommended first version:

- Support “replace all data”
- Add merge later

---

## 5. Suggested Tech Stack

Use:

- React
- TypeScript
- Vite
- Dexie for IndexedDB
- Tailwind CSS
- React Router
- Zustand or React Context for app state

Suggested install:

```bash
npm create vite@latest success-tracker -- --template react-ts
cd success-tracker
npm install
npm install dexie zustand react-router-dom
npm install -D tailwindcss postcss autoprefixer
```

---

## 6. App Pages

```txt
/
Dashboard

/dreams
Dream list

/dreams/:id
Dream detail page

/goals
Goal list

/goals/:id
Goal detail page

/milestones
Milestone list

/achievements
Achievement timeline

/reflections
Journal / reflections

/settings
Export, import, reset data
```

---

## 7. Component Structure

```txt
src/
  app/
    App.tsx
    router.tsx

  db/
    db.ts
    exportData.ts
    importData.ts

  features/
    dreams/
      DreamList.tsx
      DreamForm.tsx
      DreamDetail.tsx

    goals/
      GoalList.tsx
      GoalForm.tsx
      GoalDetail.tsx

    milestones/
      MilestoneList.tsx
      MilestoneForm.tsx

    achievements/
      AchievementTimeline.tsx
      AchievementForm.tsx

    reflections/
      ReflectionList.tsx
      ReflectionForm.tsx

    settings/
      SettingsPage.tsx

  components/
    Layout.tsx
    Sidebar.tsx
    Header.tsx
    EmptyState.tsx
    ConfirmDialog.tsx

  types/
    index.ts

  utils/
    dates.ts
    ids.ts
```

---

## 8. UI Ideas

Use a calm, motivational interface.

Dashboard sections:

- “Your Dreams”
- “Goals in Progress”
- “Recent Wins”
- “Upcoming Milestones”
- “Reflection Prompt”

Example reflection prompts:

- What progress did I make today?
- What am I proud of this week?
- What is one small next step?
- What obstacle did I overcome?
- What dream still excites me?

---

## 9. MVP Scope

Build first:

1. IndexedDB setup
2. Dream CRUD
3. Goal CRUD
4. Milestone CRUD
5. Achievement CRUD
6. Dashboard summary
7. Export JSON
8. Import JSON
9. Basic settings page

Avoid initially:

- Login
- Cloud sync
- Sharing
- Notifications
- Complex analytics

---

## 10. Future Features

Possible later improvements:

- Password protection
- Cloud sync
- PWA offline install
- Streak tracking
- Progress charts
- Tags
- Attach images
- Weekly review mode
- Goal templates
- Calendar integration
- AI reflection summaries

---

## 11. Development Order

### Phase 1: Project Setup

- Create Vite React TypeScript app
- Add routing
- Add Tailwind
- Add Dexie
- Create layout

### Phase 2: Database

- Define TypeScript models
- Create Dexie database
- Add helper functions for CRUD

### Phase 3: Dreams

- Dream list
- Dream form
- Dream detail
- Edit/delete/archive

### Phase 4: Goals and Milestones

- Goal list
- Goal form
- Link goal to dream
- Milestone list
- Mark milestone complete

### Phase 5: Achievements and Reflections

- Achievement timeline
- Add achievement
- Reflection journal
- Link reflections to goals/dreams

### Phase 6: Dashboard

- Summary cards
- Recent achievements
- Upcoming milestones
- Active goals

### Phase 7: Export / Import

- Export all IndexedDB data to JSON
- Import JSON backup
- Add confirmation before replacing data

### Phase 8: Polish

- Empty states
- Form validation
- Responsive layout
- Error handling
- Basic accessibility

---

## 12. Success Criteria

The app is successful when the user can:

- Add dreams
- Break dreams into goals
- Add milestones to goals
- Record achievements
- Write reflections
- View progress on dashboard
- Export all data
- Import backup data
- Use the app offline in the browser
