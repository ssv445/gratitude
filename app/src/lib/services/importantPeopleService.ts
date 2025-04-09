import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    getFirestore,
} from 'firebase/firestore';
import { app } from '../firebase';
import {
    ImportantPerson,
    CreateImportantPersonInput,
    UpdateImportantPersonInput,
} from '../models/ImportantPerson';

const db = getFirestore(app);
const COLLECTION_NAME = 'importantPeople';

export const importantPeopleService = {
    async create(userId: string, data: CreateImportantPersonInput): Promise<ImportantPerson> {
        const now = Timestamp.now();
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            userId,
            createdAt: now,
            updatedAt: now,
            tags: data.tags || [],
        });

        const newDoc = await getDoc(docRef);
        return {
            id: newDoc.id,
            ...newDoc.data(),
        } as ImportantPerson;
    },

    async update(id: string, userId: string, data: UpdateImportantPersonInput): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Person not found');
        }

        if (docSnap.data()?.userId !== userId) {
            throw new Error('Not authorized');
        }

        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now(),
        });
    },

    async delete(id: string, userId: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Person not found');
        }

        if (docSnap.data()?.userId !== userId) {
            throw new Error('Not authorized');
        }

        await deleteDoc(docRef);
    },

    async getById(id: string, userId: string): Promise<ImportantPerson> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Person not found');
        }

        const data = docSnap.data();
        if (data?.userId !== userId) {
            throw new Error('Not authorized');
        }

        return {
            id: docSnap.id,
            ...data,
        } as ImportantPerson;
    },

    async getAllByUser(userId: string): Promise<ImportantPerson[]> {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as ImportantPerson[];
    },

    async getUpcomingReminders(userId: string): Promise<ImportantPerson[]> {
        const now = Timestamp.now();
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('nextReminderDate', '<=', now),
            orderBy('nextReminderDate', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as ImportantPerson[];
    },
}; 