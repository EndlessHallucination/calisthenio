import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getActiveSkills } from "../api/skills";
import { getWorkouts, getWorkoutExercises, deleteWorkout } from "../api/workouts";

export default function History() {
    const [selectedSkillId, setSelectedSkillId] = useState(null);
    const [selectedWorkoutId, setSelectedWorkoutId] = useState(null)
    const queryClient = useQueryClient()


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

    const { mutate: removeWorkout } = useMutation({
        mutationFn: deleteWorkout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workoutHistory', selectedSkillId] })
            setSelectedWorkoutId(null)
        }
    })

    const { data: workoutExercises = [] } = useQuery({
        queryKey: ['workoutExercises', selectedWorkoutId],
        queryFn: () => getWorkoutExercises(selectedWorkoutId),
        enabled: !!selectedWorkoutId
    })

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
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setSelectedWorkoutId(
                                selectedWorkoutId === workout.id ? null : workout.id
                            )}
                        >
                            <h3 className="text-white font-bold">
                                {new Date(workout.workout_date).toLocaleDateString('en-US', {
                                    weekday: 'long', month: 'short', day: 'numeric'
                                })}
                            </h3>
                            <div className="flex items-center gap-3">
                                {workout.duration_minutes && (
                                    <span className="text-zinc-500 text-sm">{workout.duration_minutes} min</span>
                                )}
                                <span className="text-zinc-500 text-sm">
                                    {selectedWorkoutId === workout.id ? '▲' : '▼'}
                                </span>
                            </div>

                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Delete this workout?')) removeWorkout(workout.id)
                            }}
                            className="text-zinc-600 hover:text-red-400 text-xs transition"
                        >
                            Delete
                        </button>

                        {selectedWorkoutId === workout.id && (
                            <div className="mt-4 border-t border-zinc-800 pt-4">
                                {workoutExercises.map(ex => (
                                    <div key={ex.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                                        <div>
                                            <p className="text-white text-sm font-medium">{ex.exercise_name}</p>
                                            <p className="text-zinc-500 text-xs">{ex.category}</p>
                                        </div>
                                        <p className="text-zinc-400 text-sm">
                                            {ex.actual_sets} sets
                                            {ex.actual_reps ? ` × ${ex.actual_reps}` : ''}
                                            {ex.actual_hold_time_seconds ? ` × ${ex.actual_hold_time_seconds}s` : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}