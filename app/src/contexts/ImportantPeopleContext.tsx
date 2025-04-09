'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { importantPeopleService } from '@/lib/services/importantPeopleService';
import {
    ImportantPerson,
    CreateImportantPersonInput,
    UpdateImportantPersonInput,
} from '@/lib/models/ImportantPerson';

interface ImportantPeopleContextType {
    people: ImportantPerson[];
    loading: boolean;
    error: string | null;
    loadPeople: () => Promise<void>;
    addPerson: (data: CreateImportantPersonInput) => Promise<ImportantPerson>;
    updatePerson: (id: string, data: UpdateImportantPersonInput) => Promise<void>;
    deletePerson: (id: string) => Promise<void>;
    getUpcomingReminders: () => Promise<ImportantPerson[]>;
}

const ImportantPeopleContext = createContext<ImportantPeopleContextType | null>(null);

export function useImportantPeople() {
    const context = useContext(ImportantPeopleContext);
    if (!context) {
        throw new Error('useImportantPeople must be used within an ImportantPeopleProvider');
    }
    return context;
}

export function ImportantPeopleProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [people, setPeople] = useState<ImportantPerson[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPeople = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const data = await importantPeopleService.getAllByUser(user.uid);
            setPeople(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load important people');
            console.error('Error loading important people:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const addPerson = useCallback(async (data: CreateImportantPersonInput) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            const newPerson = await importantPeopleService.create(user.uid, data);
            setPeople(prev => [newPerson, ...prev]);
            return newPerson;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add person');
            console.error('Error adding person:', err);
            throw err;
        }
    }, [user]);

    const updatePerson = useCallback(async (id: string, data: UpdateImportantPersonInput) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            await importantPeopleService.update(id, user.uid, data);
            setPeople(prev => prev.map(person =>
                person.id === id ? { ...person, ...data } : person
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update person');
            console.error('Error updating person:', err);
            throw err;
        }
    }, [user]);

    const deletePerson = useCallback(async (id: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            await importantPeopleService.delete(id, user.uid);
            setPeople(prev => prev.filter(person => person.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete person');
            console.error('Error deleting person:', err);
            throw err;
        }
    }, [user]);

    const getUpcomingReminders = useCallback(async () => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            return await importantPeopleService.getUpcomingReminders(user.uid);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load reminders');
            console.error('Error loading reminders:', err);
            throw err;
        }
    }, [user]);

    const value = {
        people,
        loading,
        error,
        loadPeople,
        addPerson,
        updatePerson,
        deletePerson,
        getUpcomingReminders,
    };

    return (
        <ImportantPeopleContext.Provider value={value}>
            {children}
        </ImportantPeopleContext.Provider>
    );
} 