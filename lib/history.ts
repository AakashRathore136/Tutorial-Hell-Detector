import { UserStats } from './scoring';

export interface HistoryEntry {
  id: string;
  date: string;
  stats: UserStats;
  scores: any;
  diagnosis: any;
}

export function saveHistory(entry: Omit<HistoryEntry, 'id' | 'date'>) {
  if (typeof window === 'undefined') return;
  const existing = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString()
  };
  localStorage.setItem('thd_history', JSON.stringify([newEntry, ...existing]));
  return newEntry;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('thd_history');
  return data ? JSON.parse(data) : [];
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('thd_history');
}

export function deleteHistoryEntry(id: string) {
  if (typeof window === 'undefined') return;
  const existing = getHistory();
  localStorage.setItem('thd_history', JSON.stringify(existing.filter(e => e.id !== id)));
}
