import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getActiveSkills } from "../api/skills"
import { getActiveRoutine } from '../api/routines'
import { createWorkout, logExercises } from '../api/workouts'

export default function Workout() {
    const [exerciseLogs, setExerciseLogs] = useState([])
    const [timeLeft, setTimeLeft] = useState(0)
    const [isResting, setIsResting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [restOverrides, setRestOverrides] = useState({})
    const [warning, setWarning] = useState(null)

    const [searchParams] = useSearchParams()
    const preSelectedSkillId = searchParams.get('skill_id')
    const [selectedSkillId, setSelectedSkillId] = useState(
        preSelectedSkillId ? Number(preSelectedSkillId) : null
    )

    const intervalRef = useRef(null)
    const timerRef = useRef(null)
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
        if (!routine) return
        setExerciseLogs(
            routine.exercises.map(exercise => ({
                routine_exercise_id: exercise.id,
                actual_sets: exercise.sets,
                actual_reps: exercise.reps,
                actual_hold_time_seconds: exercise.hold_time_seconds,
                completed: true
            }))
        )
    }, [routine])

    const handleSkillSelect = (skillId) => {
        if (skillId === selectedSkillId) return

        setSelectedSkillId(skillId)
        setExerciseLogs([])
        setRestOverrides({})
        navigate(`/workout?skill_id=${skillId}`, { replace: true })
    }

    const handleChange = (index, field, value) => {
        setExerciseLogs(prev => prev.map((log, i) =>
            i === index ? { ...log, [field]: value } : log
        ))
    }

    const getRestSeconds = (index) => {
        if (restOverrides[index] !== undefined) return restOverrides[index]
        return routine?.exercises[index]?.rest_seconds || 60
    }

    const adjustRest = (index, delta) => {
        const current = getRestSeconds(index)
        const newVal = Math.max(10, current + delta)
        setRestOverrides(prev => ({ ...prev, [index]: newVal }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const workout = await createWorkout(selectedSkillId)
            if (workout.alreadyLoggedToday) {
                setWarning('You already logged a workout for this skill today.')
            }
            await logExercises(workout.id, exerciseLogs)
            setSubmitted(true)
            setTimeout(() => navigate('/dashboard'), 1500)
        } catch (err) {
            setIsSubmitting(false)
            alert("Failed to save workout: " + err.message)
        }
    }

    const startTimer = (seconds) => {
        clearInterval(intervalRef.current)
        setTimeLeft(seconds)
        setIsResting(true)
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current)
                    setIsResting(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        setTimeout(() => {
            timerRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
    }

    if (isLoading) return <p className="text-white p-6">Loading...</p>
    if (error) return <p className="text-red-400 p-6">Something went wrong.</p>

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black text-white mb-2">Log Workout</h1>
            <p className="text-zinc-500 text-sm mb-8">Select a skill and log what you did.</p>

            <div className="flex gap-3 mb-8">
                {skills.map(skill => (
                    <button
                        key={skill.id}
                        onClick={() => handleSkillSelect(skill.id)}
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
                    {isResting && (
                        <div ref={timerRef} className="bg-zinc-800 rounded-xl p-4 text-center mb-6">
                            <p className="text-zinc-400 text-sm mb-1">Rest Time</p>
                            <p className="text-4xl font-black text-white">{timeLeft}s</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 mb-8">
                        {exerciseLogs.map((log, index) => {
                            const exercise = routine.exercises[index]
                            if (!exercise) return null

                            return (
                                <div key={log.routine_exercise_id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                                    <h3 className="text-white font-bold mb-4">
                                        {exercise.exercise_name}
                                    </h3>

                                    <div className="flex gap-4">
                                        <div className="flex flex-col gap-1 flex-1">
                                            <label className="text-zinc-500 text-xs">Sets</label>
                                            <input
                                                type="text"
                                                value={log.actual_sets}
                                                onChange={(e) => handleChange(index, "actual_sets", Number(e.target.value))}
                                                className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                                            />
                                        </div>

                                        {exercise.reps !== null && (
                                            <div className="flex flex-col gap-1 flex-1">
                                                <label className="text-zinc-500 text-xs">Reps</label>
                                                <input
                                                    type="text"
                                                    value={log.actual_reps ?? ''}
                                                    onChange={(e) => handleChange(index, "actual_reps", e.target.value)}
                                                    className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                                                />
                                            </div>
                                        )}

                                        {exercise.hold_time_seconds !== null && (
                                            <div className="flex flex-col gap-1 flex-1">
                                                <label className="text-zinc-500 text-xs">Hold (s)</label>
                                                <input
                                                    type="number"
                                                    value={log.actual_hold_time_seconds ?? ''}
                                                    onChange={(e) => handleChange(index, "actual_hold_time_seconds", Number(e.target.value))}
                                                    className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {exercise.rest_seconds &&
                                        exercise.section !== 'Cooldown' && (
                                            <div className="flex items-center gap-3 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => adjustRest(index, -15)}
                                                    className="w-7 h-7 flex items-center justify-center bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm transition"
                                                >−</button>
                                                <button
                                                    type="button"
                                                    onClick={() => startTimer(getRestSeconds(index))}
                                                    className="flex-1 text-center bg-zinc-800 border border-zinc-700 text-white text-xs py-2 rounded-lg hover:bg-zinc-700 transition font-medium"
                                                >
                                                    ⏱ Rest {getRestSeconds(index)}s
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => adjustRest(index, 15)}
                                                    className="w-7 h-7 flex items-center justify-center bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm transition"
                                                >+</button>
                                            </div>
                                        )}
                                </div>
                            )
                        })}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-zinc-950 font-bold py-4 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Submit Workout'}
                    </button>
                </form>
            )}

            {submitted && (
                <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/80">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                        <p className="text-4xl mb-3">✓</p>
                        <p className="text-white font-bold text-xl">Workout Logged</p>
                        {warning && (
                            <p className="text-yellow-400 text-sm mt-2">{warning}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}