import { useState, useEffect } from 'react';
import { journalService } from '../services/journal.service';
import { useAuth } from '../context/AuthContext';
import type { JournalEntry, CreateJournalEntry, UpdateJournalEntry } from '../types/journal';

export const useJournal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await journalService.getUserJournalEntries(user.id);
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [user]);

  const createEntry = async (entry: CreateJournalEntry) => {
    if (!user) throw new Error('Must be logged in');

    const newEntry = await journalService.createJournalEntry(user.id, entry);
    setEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const updateEntry = async (entryId: string, updates: UpdateJournalEntry) => {
    const updatedEntry = await journalService.updateJournalEntry(entryId, updates);
    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? updatedEntry : entry))
    );
    return updatedEntry;
  };

  const deleteEntry = async (entryId: string) => {
    await journalService.deleteJournalEntry(entryId);
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refresh: loadEntries,
  };
};
