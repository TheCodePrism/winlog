export function formatDate(dateString: string): string {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return dateTimeString;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysRemaining(dueDateString?: string): { days: number; text: string; urgent: boolean } | null {
  if (!dueDateString) return null;
  const dueDate = new Date(dueDateString);
  if (isNaN(dueDate.getTime())) return null;

  // Set times to midnight for accurate day calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { days: 0, text: 'Due today', urgent: true };
  } else if (diffDays === 1) {
    return { days: 1, text: 'Due tomorrow', urgent: true };
  } else if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return { days: diffDays, text: `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`, urgent: true };
  } else {
    return { days: diffDays, text: `${diffDays} days left`, urgent: diffDays <= 3 };
  }
}

export function getCurrentISODate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentISODateTime(): string {
  return new Date().toISOString();
}
