# Winlog Database Schema

Winlog uses **IndexedDB** for private-first, client-side data storage. The browser database is wrapped using **Dexie.js**.

## Database Overview
- **Database Name**: `WinlogDatabase`
- **Current Version**: `1`

---

## Tables and Indices

### 1. `dreams`
Represents high-level, long-term aspirations.

* **Primary Key**: `id` (UUID string)
* **Indexed Fields**: `status`, `createdAt`

| Field | Type | Description | Index |
|---|---|---|---|
| `id` | `string` | Unique identifier (UUID v4) | Primary |
| `title` | `string` | Name of the dream | No |
| `description` | `string` (optional) | Deeper explanation of the dream | No |
| `category` | `string` (optional) | Category (e.g., career, health, personal, travel) | No |
| `status` | `'active' \| 'paused' \| 'completed' \| 'archived'` | Current status of the dream | **Yes** |
| `createdAt` | `string` (ISO datetime) | Creation timestamp | **Yes** |
| `updatedAt` | `string` (ISO datetime) | Last modified timestamp | No |

---

### 2. `goals`
Concrete objectives linked to specific dreams.

* **Primary Key**: `id` (UUID string)
* **Indexed Fields**: `dreamId`, `status`, `priority`, `targetDate`

| Field | Type | Description | Index |
|---|---|---|---|
| `id` | `string` | Unique identifier (UUID v4) | Primary |
| `dreamId` | `string` (optional) | Foreign key pointing to `dreams.id` | **Yes** |
| `title` | `string` | Title of the goal | No |
| `description` | `string` (optional) | Description details | No |
| `targetDate` | `string` (optional, ISO date) | Target date to reach the goal | **Yes** |
| `status` | `'not_started' \| 'in_progress' \| 'completed' \| 'paused'` | Current state of the goal | **Yes** |
| `priority` | `'low' \| 'medium' \| 'high'` | Priority level | **Yes** |
| `createdAt` | `string` (ISO datetime) | Creation timestamp | No |
| `updatedAt` | `string` (ISO datetime) | Last modified timestamp | No |

---

### 3. `milestones`
Measurable checkpoints under a specific goal.

* **Primary Key**: `id` (UUID string)
* **Indexed Fields**: `goalId`, `status`, `dueDate`

| Field | Type | Description | Index |
|---|---|---|---|
| `id` | `string` | Unique identifier (UUID v4) | Primary |
| `goalId` | `string` (optional) | Foreign key pointing to `goals.id` | **Yes** |
| `title` | `string` | Title of the milestone | No |
| `description` | `string` (optional) | Description details | No |
| `dueDate` | `string` (optional, ISO date) | Scheduled completion date | **Yes** |
| `completedAt` | `string` (optional, ISO datetime) | When the milestone was checked off | No |
| `status` | `'pending' \| 'completed'` | Completion status | **Yes** |
| `createdAt` | `string` (ISO datetime) | Creation timestamp | No |
| `updatedAt` | `string` (ISO datetime) | Last modified timestamp | No |

---

### 4. `achievements`
Celebrated wins and successes linked to dreams or goals.

* **Primary Key**: `id` (UUID string)
* **Indexed Fields**: `date`, `category`, `relatedDreamId`, `relatedGoalId`

| Field | Type | Description | Index |
|---|---|---|---|
| `id` | `string` | Unique identifier (UUID v4) | Primary |
| `title` | `string` | Title of the achievement / win | No |
| `description` | `string` (optional) | Context about the win | No |
| `date` | `string` (ISO date) | The date when the win occurred | **Yes** |
| `category` | `string` (optional) | Category classification | **Yes** |
| `relatedDreamId` | `string` (optional) | Foreign key pointing to `dreams.id` | **Yes** |
| `relatedGoalId` | `string` (optional) | Foreign key pointing to `goals.id` | **Yes** |
| `createdAt` | `string` (ISO datetime) | Creation timestamp | No |

---

### 5. `reflections`
Journal entries documenting progress, thoughts, or mood.

* **Primary Key**: `id` (UUID string)
* **Indexed Fields**: `relatedDreamId`, `relatedGoalId`, `createdAt`

| Field | Type | Description | Index |
|---|---|---|---|
| `id` | `string` | Unique identifier (UUID v4) | Primary |
| `title` | `string` (optional) | Title of the journal entry | No |
| `content` | `string` | Body content of the reflection | No |
| `mood` | `string` (optional) | Emoji or text describing mood (e.g. 😊, 🚀, 🧘) | No |
| `relatedDreamId` | `string` (optional) | Foreign key pointing to `dreams.id` | **Yes** |
| `relatedGoalId` | `string` (optional) | Foreign key pointing to `goals.id` | **Yes** |
| `createdAt` | `string` (ISO datetime) | Journal entry date | **Yes** |
| `updatedAt` | `string` (ISO datetime) | Last edit date | No |
