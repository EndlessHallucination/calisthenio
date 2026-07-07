import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentMilestone, completeMilestone } from "../api/skills"
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
        <div>
            <h1>{skill.name}</h1>
            {milestone &&
                <div>
                    <h2>Current milestone: {milestone.name}</h2>
                    <button
                        onClick={() => complete()}
                        disabled={isCompleting}
                    >
                        {isCompleting ? 'Completing...' : 'Complete Milestone'}
                    </button>
                </div>
            }
            {routine
                ? routine.exercises.map(ex => (
                    <div key={ex.id}>
                        <h2>{ex.exercise_name}</h2>
                        <p>{ex.category}</p>
                    </div>
                ))
                :
                <button onClick={() => generate()} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Generate Routine'}
                </button>
            }
        </div>
    )
}
export default SkillCard;