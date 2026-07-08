import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuery } from '@tanstack/react-query'

import { getActiveSkills } from "../api/skills"
import { getActiveRoutine } from '../api/routines'
import { createWorkout, logExercises } from '../api/workout'

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
        <div>
            <h2>Select a skill</h2>

            {skills.map(skill => (
                <button
                    key={skill.id}
                    onClick={() => setSelectedSkillId(skill.id)}
                    style={{ fontWeight: selectedSkillId === skill.id ? 'bold' : 'normal' }}
                >
                    {skill.name}
                </button>
            ))}
            {routine && exerciseLogs.length > 0 && (
                <div>
                    <h2>Log Workout</h2>
                    <form onSubmit={handleSubmit}>
                        {exerciseLogs.map((log, index) => (
                            <div key={log.routine_exercise_id}><h3>{routine.exercises[index].exercise_name}</h3>

                                <label>Sets
                                    <input
                                        type="number"
                                        value={log.actual_sets}
                                        onChange={(e) => handleChange(index, "actual_sets", Number(e.target.value))}
                                    />
                                </label>

                                {routine.exercises[index].reps !== null && (
                                    <label>Reps
                                        <input
                                            type="number"
                                            value={log.actual_reps ?? ''}
                                            onChange={(e) => handleChange(index, "actual_reps", Number(e.target.value))}
                                        />
                                    </label>
                                )}

                                {routine.exercises[index].hold_time_seconds !== null && (
                                    <label>Hold (seconds)
                                        <input
                                            type="number"
                                            value={log.actual_hold_time_seconds ?? ''}
                                            onChange={(e) => handleChange(index, "actual_hold_time_seconds", Number(e.target.value))}
                                        />
                                    </label>
                                )}
                            </div>
                        ))}
                        <button>Submit Workout</button>
                    </form>
                </div>
            )}
        </div>
    );
} 
