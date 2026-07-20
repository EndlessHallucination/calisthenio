import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getActiveSkills, getCompletedSkills } from "../api/skills"
import { getProfile } from "../api/profile";
import SkillCard from '../components/SkillCard'

export default function Dashboard() {
    const navigate = useNavigate();

    const { data: activeSkills = [], isLoading } = useQuery({
        queryKey: ['skills/active'],
        queryFn: getActiveSkills,
        retry: false,
        throwOnError: false
    })

    const { data: completedSkills = [], isLoading: completedLoading } = useQuery({
        queryKey: ['skills/completed'],
        queryFn: getCompletedSkills,
        retry: false,
        throwOnError: false
    })

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        retry: false,
        throwOnError: false
    })

    useEffect(() => {
        if (!profileLoading && !profile) {
            navigate('/setup')
        }
    }, [profile, profileLoading, navigate])

    if (isLoading) return <div>Loading...</div>

    if (activeSkills.length === 0 && completedSkills.length === 0) return (
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

            {activeSkills.length === 0 && (
                <div className="mb-8 text-center">
                    <p className="text-zinc-500 mb-4">No active skills.</p>
                    <button
                        onClick={() => navigate('/skills')}
                        className="bg-white text-zinc-950 font-bold px-6 py-3 rounded-xl hover:bg-zinc-200 transition"
                    >
                        Pick a skill
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-6">
                {activeSkills.map(skill => (
                    <SkillCard key={skill.id} skill={skill} />
                ))}
            </div>

            {completedSkills.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Completed</h2>
                    <div className="flex flex-col gap-3">
                        {completedSkills.map(skill => (
                            <div key={skill.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-white font-bold">{skill.name}</p>
                                    <p className="text-zinc-500 text-xs mt-1">Completed</p>
                                </div>
                                <span className="text-green-500 text-sm">✓</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}