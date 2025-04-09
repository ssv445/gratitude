import { useState, useEffect } from 'react';
import { useImportantPeople } from '@/contexts/ImportantPeopleContext';
import { Timestamp } from 'firebase/firestore';

interface NextAction {
    personId: string;
    personName: string;
    actionType: 'reminder' | 'birthday' | 'check_in';
    dueDate: Date;
    description: string;
}

export function NextActions() {
    const { people, loading, error } = useImportantPeople();
    const [actions, setActions] = useState<NextAction[]>([]);

    useEffect(() => {
        if (!people) return;

        const now = new Date();
        const nextActions: NextAction[] = [];

        // Process each person
        people.forEach(person => {
            // Add birthday reminder if birthdate exists
            if (person.birthdate) {
                const birthdate = person.birthdate.toDate();
                const nextBirthday = new Date(
                    now.getFullYear(),
                    birthdate.getMonth(),
                    birthdate.getDate()
                );

                // If birthday has passed this year, set for next year
                if (nextBirthday < now) {
                    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
                }

                nextActions.push({
                    personId: person.id,
                    personName: person.name,
                    actionType: 'birthday',
                    dueDate: nextBirthday,
                    description: `${person.name}'s birthday`
                });
            }

            // Add reminder based on reminderFrequency
            if (person.reminderFrequency) {
                const nextReminderDate = person.nextReminderDate?.toDate() || now;
                let dueDate = new Date(nextReminderDate);

                switch (person.reminderFrequency) {
                    case 'daily':
                        dueDate.setDate(dueDate.getDate() + 1);
                        break;
                    case 'weekly':
                        dueDate.setDate(dueDate.getDate() + 7);
                        break;
                    case 'monthly':
                        dueDate.setMonth(dueDate.getMonth() + 1);
                        break;
                    case 'yearly':
                        dueDate.setFullYear(dueDate.getFullYear() + 1);
                        break;
                }

                nextActions.push({
                    personId: person.id,
                    personName: person.name,
                    actionType: 'check_in',
                    dueDate,
                    description: `Check in with ${person.name}`
                });
            }
        });

        // Sort actions by due date
        nextActions.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        setActions(nextActions);
    }, [people]);

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error as string}</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Next Actions</h2>
            {actions.length === 0 ? (
                <p className="text-gray-500">No upcoming actions</p>
            ) : (
                <div className="space-y-2">
                    {actions.map((action, index) => (
                        <div
                            key={`${action.personId}-${action.actionType}-${index}`}
                            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-lg">{action.description}</h3>
                                    <p className="text-gray-600">
                                        Due: {action.dueDate.toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {action.actionType === 'birthday' && (
                                        <span className="p-2 bg-blue-100 text-blue-800 rounded-full">
                                            🎂
                                        </span>
                                    )}
                                    {action.actionType === 'check_in' && (
                                        <span className="p-2 bg-green-100 text-green-800 rounded-full">
                                            👋
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 