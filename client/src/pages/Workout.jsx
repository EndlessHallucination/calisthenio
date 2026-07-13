import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuery } from '@tanstack/react-query'

import { getActiveSkills } from "../api/skills"
import { getActiveRoutine } from '../api/routines'
import { createWorkout, logExercises } from '../api/workouts'

export default function Workout() {
    const [selectedSkillId, setSelectedSkillId] = useState(null)
    const [exerciseLogs, setExerciseLogs] = useState([])
    const navigate = useNavigate()


    const { data: skills = [], isLoading, error } = useQuery({
        queryKey: ['activeSkills'],
        queryFn: getActiveSkills
    })

    const { data: routine } = useQuery({
        queryKey: ['routine', selectedSkillId],
        queryFn: () => getActiveRoutine(selectedSkillId),
        enabled: !!selectedSkillId
    })

    useEffect(() => {
        if (!routine) return;

        setExerciseLogs(
            routine.exercises.map(exercise => ({
                routine_exercise_id: exercise.id,
                actual_sets: exercise.sets,
                actual_reps: exercise.reps,
                actual_hold_time_seconds: exercise.hold_time_seconds,
                completed: true
            }))
        );
    }, [routine]);

    const handleChange = (index, field, value) => {
        setExerciseLogs(prev => prev.map((log, i) =>
            i === index ? { ...log, [field]: value } : log
        ))
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const workout = await createWorkout(selectedSkillId);
            await logExercises(workout.id, exerciseLogs);
            navigate('/')
        } catch (err) {
            alert("Failed to save workout: " + err.message);
        }
    };

    if (isLoading) return <p>Loading...</p>;

    if (error) return <p>Something went wrong.</p>;
    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black text-white mb-2">Log Workout</h1>
            <p className="text-zinc-500 text-sm mb-8">Select a skill and log what you did.</p>

            <div className="flex gap-3 mb-8">
                {skills.map(skill => (
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

            {routine && exerciseLogs.length > 0 && (
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4 mb-8">
                        {exerciseLogs.map((log, index) => (
                            <div key={log.routine_exercise_id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                                <h3 className="text-white font-bold mb-4">
                                    {routine.exercises[index].exercise_name}
                                </h3>
                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-1 flex-1">
                                        <label className="text-zinc-500 text-xs">Sets</label>
                                        <input
                                            type="number"
                                            value={log.actual_sets}
                                            onChange={(e) => handleChange(index, "actual_sets", Number(e.target.value))}
                                            className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                                        />
                                    </div>

                                    {routine.exercises[index].reps !== null && (
                                        <div className="flex flex-col gap-1 flex-1">
                                            <label className="text-zinc-500 text-xs">Reps</label>
                                            <input
                                                type="number"
                                                value={log.actual_reps ?? ''}
                                                onChange={(e) => handleChange(index, "actual_reps", Number(e.target.value))}
                                                className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                                            />
                                        </div>
                                    )}

                                    {routine.exercises[index].hold_time_seconds !== null && (
                                        <div className="flex flex-col gap-1 flex-1">
                                            <label className="text-zinc-500 text-xs">Hold (seconds)</label>
                                            <input
                                                type="number"
                                                value={log.actual_hold_time_seconds ?? ''}
                                                onChange={(e) => handleChange(index, "actual_hold_time_seconds", Number(e.target.value))}
                                                className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white text-zinc-950 font-bold py-4 rounded-xl hover:bg-zinc-200 transition"
                    >
                        Submit Workout
                    </button>
                </form>
            )}
        </div>
    )
} 
