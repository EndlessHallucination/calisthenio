import { useQuery } from "@tanstack/react-query";
import { getCurrentMilestone } from "../api/skills"
import { getActiveRoutine } from "../api/routines";

const SkillCard = ({ skill }) => {

    const { data: milestone } = useQuery({
        queryKey: ['milestone', skill.id],
        queryFn: () => getCurrentMilestone(skill.id)
    })

    const { data: routine } = useQuery({
        queryKey: ['routine', skill.id],
        queryFn: () => getActiveRoutine(skill.id)
    })

    return (
        <div>
            <h1>{skill.name}</h1>
            {milestone && <h2>Current milestone: {milestone.name}</h2>}
            {routine && routine.exercises.map(ex =>
                <div key={ex.id}>
                    <h2>{ex.exercise_name}</h2>
                    <p>{ex.category}</p>
                    <p>{ex.description}</p>

                </div>
            )}
        </div>
    )
}
export default SkillCard;