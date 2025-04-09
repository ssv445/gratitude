import { Timestamp } from 'firebase/firestore';

export interface ImportantPerson {
    id: string;
    userId: string;
    name: string;
    description: string;
    photoUrl?: string;
    relationship: string;
    birthdate?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    tags: string[];
    reminderFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    lastInteractionDate?: Timestamp;
    nextReminderDate?: Timestamp;
}

export type CreateImportantPersonInput = Omit<
    ImportantPerson,
    'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type UpdateImportantPersonInput = Partial<
    Omit<ImportantPerson, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>; 