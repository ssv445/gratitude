import { useState, useMemo, useEffect } from 'react';
import { useImportantPeople } from '@/contexts/ImportantPeopleContext';
import { ImportantPerson } from '@/lib/models/ImportantPerson';
import { ImportantPersonForm } from './ImportantPersonForm';
import { Modal } from '../Modal';

interface FilterOptions {
    searchQuery: string;
    relationship?: string;
    tag?: string;
}

export function ImportantPeopleGallery() {
    const { people, loading, error, deletePerson, loadPeople, addPerson, updatePerson } = useImportantPeople();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<ImportantPerson | null>(null);
    const [filters, setFilters] = useState<FilterOptions>({
        searchQuery: '',
    });

    useEffect(() => {
        loadPeople();
    }, [loadPeople]);

    // Get unique relationships and tags for filters
    const { relationships, tags } = useMemo(() => {
        const relationshipSet = new Set<string>();
        const tagSet = new Set<string>();

        people?.forEach(person => {
            relationshipSet.add(person.relationship);
            person.tags.forEach(tag => tagSet.add(tag));
        });

        return {
            relationships: Array.from(relationshipSet),
            tags: Array.from(tagSet),
        };
    }, [people]);

    // Filter and search people
    const filteredPeople = useMemo(() => {
        if (!people) return [];

        return people.filter(person => {
            const matchesSearch = filters.searchQuery
                ? person.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                person.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
                : true;

            const matchesRelationship = filters.relationship
                ? person.relationship === filters.relationship
                : true;

            const matchesTag = filters.tag
                ? person.tags.includes(filters.tag)
                : true;

            return matchesSearch && matchesRelationship && matchesTag;
        });
    }, [people, filters]);

    const handleDelete = async (person: ImportantPerson) => {
        if (window.confirm(`Are you sure you want to delete ${person.name}?`)) {
            await deletePerson(person.id);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error as string}</div>;

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={filters.relationship || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, relationship: e.target.value || undefined }))}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">All Relationships</option>
                    {relationships.map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                    ))}
                </select>
                <select
                    value={filters.tag || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value || undefined }))}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">All Tags</option>
                    {tags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Add Person
                </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPeople.map(person => (
                    <div
                        key={person.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                        <div className="relative aspect-square">
                            {person.photoUrl ? (
                                <img
                                    src={person.photoUrl}
                                    alt={person.name}
                                    className="w-full h-full object-cover rounded-t-lg"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                                    <span className="text-4xl">👤</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold">{person.name}</h3>
                            <p className="text-gray-600 text-sm">{person.relationship}</p>
                            <p className="text-gray-500 mt-2 line-clamp-2">{person.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {person.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    onClick={() => setSelectedPerson(person)}
                                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(person)}
                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <Modal onClose={() => setIsAddModalOpen(false)}>
                    <ImportantPersonForm
                        person={selectedPerson || undefined}
                        onSubmit={async (data) => {
                            try {
                                if (selectedPerson) {
                                    await updatePerson(selectedPerson.id, data);
                                } else {
                                    await addPerson(data);
                                }
                                setIsAddModalOpen(false);
                                setSelectedPerson(null);
                            } catch (err) {
                                console.error('Error saving person:', err);
                            }
                        }}
                        onCancel={() => {
                            setIsAddModalOpen(false);
                            setSelectedPerson(null);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
} 