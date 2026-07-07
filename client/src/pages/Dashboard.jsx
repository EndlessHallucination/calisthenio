import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";


import { getActiveSkills } from "../api/skills"

import SkillCard from '../components/SkillCard'

export default function Dashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: skills, isLoading } = useQuery({
        queryKey: ['skills/active'],
        queryFn: getActiveSkills,
        retry: false,
        throwOnError: false
    })

    if (isLoading) return <div>Loading...</div>;

    if (!skills || skills.length === 0) return (
        <div>
            <p>No active skills yet.</p>
            <button onClick={() => navigate('/skills')}>Pick a skill</button>
        </div>
    )
    return (
        <div>
            <h1>Dashboard</h1>
            {skills.map(skill => (
                <SkillCard key={skill.id} skill={skill} />
            ))}
        </div>
    )
}