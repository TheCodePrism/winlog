# Winlog UI/UX Guidelines

## Product Philosophy

Winlog is not a task manager.

Winlog is a personal success journal that helps users:

- Dream bigger
- Track progress
- Celebrate wins
- Reflect on growth

The experience should feel:

- Encouraging
- Calm
- Clean
- Personal
- Motivating

Avoid making the application feel like corporate project management software.

---

# Design Principles

## 1. Progress Over Productivity

Focus on:

- Growth
- Momentum
- Consistency

Avoid:

- Pressure
- Overwhelming metrics
- Productivity guilt

---

## 2. Celebrate Wins

Completed milestones and achievements should feel rewarding.

Examples:

- Success badges
- Achievement cards
- Completion animations
- Positive microcopy

Examples:

- "Nice work!"
- "Another milestone completed."
- "You're making progress."

---

## 3. Minimize Friction

Users should be able to:

- Add dreams quickly
- Log achievements quickly
- Record reflections quickly

Target:

- New dream in <30 seconds
- New achievement in <15 seconds

---

## 4. Mobile First

Primary usage is expected on:

- Mobile phones
- Tablets
- Laptops

Design mobile-first.

---

# Visual Style

## Theme

Modern and minimal.

Keywords:

- Clean
- Focused
- Positive
- Spacious

---

## Colors

### Primary

Indigo / Blue

Purpose:

- Navigation
- Primary buttons
- Progress indicators

### Success

Green

Purpose:

- Completed milestones
- Achievements

### Warning

Amber

Purpose:

- Upcoming deadlines

### Neutral

Gray

Purpose:

- Secondary UI elements

---

# Layout

## Desktop

Sidebar + Content

```text
+----------------+
| Sidebar        |
|                |
| Dashboard      |
| Dreams         |
| Goals          |
| Milestones     |
| Achievements   |
| Reflections    |
| Settings       |
+----------------+
```

---

## Mobile

Bottom navigation

```text
Dashboard
Dreams
Goals
Achievements
Settings
```

---

# Dashboard

Must show:

- Total Dreams
- Active Goals
- Completed Milestones
- Recent Achievements
- Progress Summary

Order:

1. Welcome Section
2. Progress Cards
3. Upcoming Milestones
4. Recent Wins
5. Reflection Prompt

---

# Cards

Use cards extensively.

Examples:

- Dream Card
- Goal Card
- Achievement Card
- Reflection Card

Card style:

- Rounded corners
- Soft shadows
- Spacious padding

---

# Empty States

Every page must have a meaningful empty state.

Example:

Dreams Page

"No dreams added yet.

Start with a dream you'd love to achieve in the future."

Include CTA button.

---

# Forms

Keep forms simple.

Prefer:

- Single column
- Large inputs
- Clear labels

Avoid:

- Complex modals
- Multi-step wizards

---

# Accessibility

Requirements:

- Keyboard navigation
- Proper labels
- ARIA support
- Color contrast compliance
- Screen reader friendly

---

# Future UI Enhancements

- Dark mode
- Achievement badges
- Progress charts
- Timeline view
- PWA install prompt
- Personal dashboard customization
