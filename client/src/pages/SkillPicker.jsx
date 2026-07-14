import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

import { getSkills, startSkill, getActiveSkills } from "../api/skills"


export default function SkillPicker() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: skills, isLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: getSkills,
        retry: false,
        throwOnError: false
    })

    const { data: activeSkills } = useQuery({
        queryKey: ['skills/active'],
        queryFn: getActiveSkills
    })


    const [error, setError] = useState(null)

    const { mutate, isPending } = useMutation({
        mutationFn: startSkill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skills/active'] })
            navigate('/dashboard')
        },
        onError: (err) => {
            setError(err.response?.data?.error || 'Failed to start skill')
        }
    })


    const handleStart = (skillId) => {
        mutate(skillId)
    }


    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black text-white mb-2">Choose a Skill</h1>
            <p className="text-zinc-500 text-sm mb-8">Pick a movement to start training toward.</p>

            {error && (
                <p className="text-red-400 text-sm mb-6">{error}</p>
            )}

            <div className="grid grid-cols-1 gap-4">
                {skills && skills.map(skill => {
                    const isActive = activeSkills?.some(s => s.id === skill.id)
                    return (
                        <div
                            key={skill.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between"
                        >
                            <div>
                                <h2 className="text-white font-bold text-lg">{skill.name}</h2>
                                <p className="text-zinc-500 text-sm capitalize">{skill.difficulty}</p>
                            </div>
                            <button
                                onClick={() => handleStart(skill.id)}
                                disabled={isActive || isPending}
                                className={`px-5 py-2 rounded-xl font-medium text-sm transition
                                ${isActive
                                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        : 'bg-white text-zinc-950 hover:bg-zinc-200'
                                    }`}
                            >
                                {isActive ? 'In Progress' : 'Start Learning'}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}