import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getActiveSkills } from "../api/skills";
import { getWorkouts } from "../api/workouts";

export default function History() {
    const [selectedSkillId, setSelectedSkillId] = useState(null);

    const {
        data: skills = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["activeSkills"],
        queryFn: getActiveSkills,
    });

    const {
        data: workouts = [],
        isLoading: workoutsLoading,
    } = useQuery({
        queryKey: ["workoutHistory", selectedSkillId],
        queryFn: () => getWorkouts(selectedSkillId),
        enabled: !!selectedSkillId,
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Something went wrong.</p>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black text-white mb-2">History</h1>
            <p className="text-zinc-500 text-sm mb-8">Review your past training sessions.</p>

            <div className="flex gap-3 mb-8">
                {skills.map((skill) => (
                    <button
                        key={skill.id}
                        onClick={() => setSelectedSkillId(skill.id)}
                        className={`px-5 py-2 rounded-xl font-medium text-sm transition
                        ${selectedSkillId === skill.id
                                ? 'bg-white text-zinc-950'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        {skill.name}
                    </button>
                ))}
            </div>

            {workoutsLoading && (
                <p className="text-zinc-500 text-sm">Loading workouts...</p>
            )}

            {workouts.length === 0 && selectedSkillId && !workoutsLoading && (
                <p className="text-zinc-500 text-sm">No workouts logged yet for this skill.</p>
            )}

            <div className="flex flex-col gap-4">
                {workouts.map((workout) => (
                    <div key={workout.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-bold">
                                {new Date(workout.workout_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </h3>
                            {workout.duration_minutes && (
                                <span className="text-zinc-500 text-sm">{workout.duration_minutes} min</span>
                            )}
                        </div>
                        {workout.notes && (
                            <p className="text-zinc-400 text-sm">{workout.notes}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}