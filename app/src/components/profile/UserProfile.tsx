'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function UserProfile() {
    const { user, updateUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await updateUserProfile(displayName);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4 py-5 sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Update your profile information.
                    </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="space-y-6">
                        {!isEditing ? (
                            <div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Name</h4>
                                        <p className="mt-1 text-sm text-gray-900">{user?.displayName || 'Not set'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-4 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-4 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setDisplayName(user?.displayName || '');
                                            setError(null);
                                        }}
                                        disabled={isLoading}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 