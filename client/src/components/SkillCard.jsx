import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentMilestone, completeMilestone, getSkill } from "../api/skills"
import { getActiveRoutine, generateRoutine } from "../api/routines";

const SkillCard = ({ skill }) => {
    const [expanded, setExpanded] = useState(false)
    const navigate = useNavigate()

    const queryClient = useQueryClient()

    const { data: milestone } = useQuery({
        queryKey: ['milestone', skill.id],
        queryFn: () => getCurrentMilestone(skill.id)
    })

    const { data: routine } = useQuery({
        queryKey: ['routine', skill.id],
        queryFn: () => getActiveRoutine(skill.id)
    })

    const { data: skillDetail } = useQuery({
        queryKey: ['skill', skill.id],
        queryFn: () => getSkill(skill.id)
    })

    const { mutate: generate, isPending: isGenerating } = useMutation({
        mutationFn: () => generateRoutine(skill.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routine', skill.id] })
        }
    })

    const { mutate: complete, isPending: isCompleting } = useMutation({
        mutationFn: () => completeMilestone(skill.id, milestone?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['milestone', skill.id] })
            queryClient.invalidateQueries({ queryKey: ['routine', skill.id] })
        }
    })

    const sections = routine?.exercises?.reduce((acc, ex) => {
        const section = ex.section || 'Other'
        if (!acc[section]) acc[section] = []
        acc[section].push(ex)
        return acc
    }, {}) || {}

    const totalMilestones = skillDetail?.milestones?.length || 0
    const currentSequence = milestone?.sequence || 0
    const progress = totalMilestones > 0 ? ((currentSequence - 1) / totalMilestones) * 100 : 0

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

            {/* Header — always visible */}
            <div
                className="p-6 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-black text-white">{skill.name}</h2>
                    <span className="text-zinc-500 text-sm">{expanded ? '▲' : '▼'}</span>
                </div>

                {/* Progress bar */}
                {totalMilestones > 0 && (
                    <div className="mb-3">
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                            <span>Step {currentSequence} of {totalMilestones}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Current milestone — compact */}
                {milestone && (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-500 text-xs">Current</p>
                            <p className="text-white text-sm font-medium">{milestone.name}</p>
                        </div>
                        {milestone.hold_time_seconds && (
                            <span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-1 rounded-lg">
                                {milestone.hold_time_seconds}s hold
                            </span>
                        )}
                        {milestone.reps_required && (
                            <span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-1 rounded-lg">
                                {milestone.reps_required} reps
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="border-t border-zinc-800 p-6">
                    {routine ? (
                        <>
                            {/* Primary action */}
                            <button
                                onClick={() => navigate(`/workout?skill_id=${skill.id}`)}
                                className="w-full mb-3 bg-white text-zinc-950 font-bold py-3 rounded-xl hover:bg-zinc-200 transition text-sm"
                            >
                                → Start Workout
                            </button>

                            {/* Secondary action */}
                            {milestone && (
                                <button
                                    onClick={() => complete()}
                                    disabled={isCompleting}
                                    className="w-full mb-6 border border-zinc-700 text-zinc-400 font-medium py-3 rounded-xl hover:border-white hover:text-white transition disabled:opacity-50 text-sm"
                                >
                                    {isCompleting ? 'Completing...' : '✓ Complete Milestone'}
                                </button>
                            )}

                            {/* Routine display */}
                            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Today's Routine</p>
                            {Object.entries(sections).map(([sectionName, sectionExercises]) => (
                                <div key={sectionName} className="mb-4">
                                    <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">{sectionName}</p>
                                    {sectionExercises.map(ex => (
                                        <div key={ex.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                                            <div>
                                                <p className="text-white text-sm font-medium">{ex.exercise_name}</p>
                                                <p className="text-zinc-600 text-xs">{ex.category}</p>
                                            </div>
                                            <p className="text-zinc-400 text-sm text-right">
                                                {ex.sets} sets
                                                {ex.reps ? ` × ${ex.reps}` : ''}
                                                {ex.hold_time_seconds ? ` × ${ex.hold_time_seconds}s` : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {routine.coach_notes && (
                                <div className="mt-4 pt-4 border-t border-zinc-800">
                                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Coach Notes</p>
                                    <p className="text-zinc-300 text-sm leading-relaxed">{routine.coach_notes}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={() => generate()}
                            disabled={isGenerating}
                            className="w-full bg-white text-zinc-950 font-bold py-3 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 text-sm"
                        >
                            {isGenerating ? 'Generating...' : '+ Generate Routine'}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default SkillCard