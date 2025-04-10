'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ImportantPeopleGallery } from '@/components/important-people/ImportantPeopleGallery';

export default function ImportantPeoplePage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold">Important People</h1>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <ImportantPeopleGallery />
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
} 