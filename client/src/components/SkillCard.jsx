import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentMilestone, completeMilestone, getSkill } from "../api/skills"
import { getActiveRoutine, generateRoutine } from "../api/routines";

const SkillCard = ({ skill }) => {
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
        mutationFn: () => completeMilestone(skill.id, milestone.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['milestone', skill.id] }),
                queryClient.invalidateQueries({ queryKey: ['routine', skill.id] })
        }
    })

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black text-white">{skill.name}</h2>
                    {skillDetail && milestone && (
                        <p className="text-zinc-500 text-sm mt-1">
                            Step {milestone.sequence} of {skillDetail.milestones.length}
                        </p>
                    )}
                </div>
            </div>

            {milestone && (
                <div className="bg-zinc-800 rounded-xl p-4 mb-6">
                    <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Current Milestone</p>
                    <p className="text-white font-bold text-lg">{milestone.name}</p>
                    {milestone.hold_time_seconds && (
                        <p className="text-zinc-400 text-sm mt-1">Target: {milestone.hold_time_seconds}s hold</p>
                    )}
                    {milestone.reps_required && (
                        <p className="text-zinc-400 text-sm mt-1">Target: {milestone.reps_required} reps</p>
                    )}
                    <button
                        onClick={() => complete()}
                        disabled={isCompleting}
                        className="mt-4 bg-white text-zinc-950 font-bold px-4 py-2 rounded-lg text-sm hover:bg-zinc-200 transition disabled:opacity-50"
                    >
                        {isCompleting ? 'Completing...' : '✓ Complete Milestone'}
                    </button>
                </div>
            )}

            {routine ? (
                <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Today's Routine</p>
                    <div className="flex flex-col gap-2">
                        {routine.exercises.map(ex => (
                            <div key={ex.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                                <div>
                                    <p className="text-white text-sm font-medium">{ex.exercise_name}</p>
                                    <p className="text-zinc-500 text-xs">{ex.category}</p>
                                </div>
                                <p className="text-zinc-400 text-sm text-right">
                                    {ex.sets} sets
                                    {ex.reps ? ` × ${ex.reps}` : ''}
                                    {ex.hold_time_seconds ? ` × ${ex.hold_time_seconds}s` : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => generate()}
                    disabled={isGenerating}
                    className="w-full border border-zinc-700 text-zinc-300 font-medium py-3 rounded-xl hover:border-zinc-500 hover:text-white transition disabled:opacity-50 text-sm"
                >
                    {isGenerating ? 'Generating...' : '+ Generate Routine'}
                </button>
            )}
        </div>
    )
}
export default SkillCard;