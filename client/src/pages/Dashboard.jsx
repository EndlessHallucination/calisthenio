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
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
            <div className="text-center">
                <p className="text-zinc-500 mb-4">No active skills yet.</p>
                <button
                    onClick={() => navigate('/skills')}
                    className="bg-white text-zinc-950 font-bold px-6 py-3 rounded-xl hover:bg-zinc-200 transition"
                >
                    Pick a skill
                </button>
            </div>
        </div>
    )
    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black text-white mb-8">Your Training</h1>
            <div className="flex flex-col gap-6">
                {skills.map(skill => (
                    <SkillCard key={skill.id} skill={skill} />
                ))}
            </div>
        </div>
    )
}