'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Timestamp } from 'firebase/firestore';
import { PhotoUpload } from '../common/PhotoUpload';
import { ImportantPerson } from '@/lib/models/ImportantPerson';

interface ImportantPersonFormProps {
    person?: {
        id: string;
        name: string;
        description: string;
        relationship: string;
        birthdate?: Timestamp;
        tags: string[];
        reminderFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
        photoUrl?: string;
    };
    onSubmit: (data: SubmitData) => Promise<void>;
    onCancel?: () => void;
}

interface FormData {
    name: string;
    description: string;
    relationship: string;
    birthdate?: string;
    tags: string;
    reminderFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface SubmitData extends Omit<FormData, 'birthdate' | 'tags'> {
    photoUrl?: string;
    birthdate?: Timestamp;
    tags: string[];
}

export function ImportantPersonForm({ person, onSubmit, onCancel }: ImportantPersonFormProps) {
    const [photoUrl, setPhotoUrl] = useState<string | undefined>(person?.photoUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: person ? {
            name: person.name,
            description: person.description,
            relationship: person.relationship,
            birthdate: person.birthdate ? new Date(person.birthdate.seconds * 1000).toISOString().split('T')[0] : undefined,
            tags: person.tags.join(', '),
            reminderFrequency: person.reminderFrequency,
        } : undefined
    });

    const onSubmitHandler = async (data: FormData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            // Convert birthdate string to Timestamp if provided and valid
            const birthdate = data.birthdate && data.birthdate.trim() !== ''
                ? Timestamp.fromDate(new Date(data.birthdate))
                : undefined;

            // Convert tags string to array, default to empty array if no tags
            const tags = data.tags
                ? data.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0)
                : [];

            // Base data with required fields
            const submitData: SubmitData = {
                name: data.name,
                description: data.description,
                relationship: data.relationship,
                tags,
            };

            // Add optional fields only if they have values
            if (birthdate) {
                submitData.birthdate = birthdate;
            }

            if (photoUrl) {
                submitData.photoUrl = photoUrl;
            }

            if (data.reminderFrequency && data.reminderFrequency.trim() !== '') {
                submitData.reminderFrequency = data.reminderFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly';
            }

            await onSubmit(submitData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Photo</label>
                <div className="mt-1">
                    <PhotoUpload
                        currentPhotoUrl={photoUrl}
                        onPhotoUploaded={url => setPhotoUrl(url)}
                        onPhotoRemoved={() => setPhotoUrl(undefined)}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    {errors.name && (
                        <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
                    Relationship
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        id="relationship"
                        {...register('relationship', { required: 'Relationship is required' })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    {errors.relationship && (
                        <p className="mt-2 text-sm text-red-600">{errors.relationship.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <div className="mt-1">
                    <textarea
                        id="description"
                        rows={3}
                        {...register('description', { required: 'Description is required' })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    {errors.description && (
                        <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                    Birthdate
                </label>
                <div className="mt-1">
                    <input
                        type="date"
                        id="birthdate"
                        {...register('birthdate')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        id="tags"
                        {...register('tags')}
                        placeholder="family, friend, work"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="reminderFrequency" className="block text-sm font-medium text-gray-700">
                    Reminder Frequency
                </label>
                <div className="mt-1">
                    <select
                        id="reminderFrequency"
                        {...register('reminderFrequency')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">No reminders</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : person ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
} 