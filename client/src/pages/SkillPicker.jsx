import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getSkills, startSkill, getActiveSkills, getCompletedSkills, restartSkill } from "../api/skills"
import { getProfileEquipment } from '../api/equipment'

export default function SkillPicker() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: skills, isLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: getSkills,
        retry: false,
        throwOnError: false
    })

    const { data: activeSkills = [] } = useQuery({
        queryKey: ['skills/active'],
        queryFn: getActiveSkills
    })

    const { data: completedSkills = [] } = useQuery({
        queryKey: ['skills/completed'],
        queryFn: getCompletedSkills
    })

    const { data: userEquipment = [] } = useQuery({
        queryKey: ['profile/equipment'],
        queryFn: getProfileEquipment
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

    const { mutate: restart, isPending: isRestarting } = useMutation({
        mutationFn: restartSkill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skills/active'] })
            queryClient.invalidateQueries({ queryKey: ['skills/completed'] })
            navigate('/dashboard')
        },
        onError: (err) => {
            setError(err.response?.data?.error || 'Failed to restart skill')
        }
    })

    const handleRestart = (skillId) => {
        restart(skillId)
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
                    const isCompleted = completedSkills?.some(s => s.id === skill.id)
                    const userEquipmentNames = userEquipment.map(e => e.name)
                    const missing = (skill.required_equipment || []).filter(
                        e => !userEquipmentNames.includes(e)
                    )

                    return (
                        <div
                            key={skill.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between"
                        >
                            <div>
                                <h2 className="text-white font-bold text-lg">{skill.name}</h2>
                                <p className="text-zinc-500 text-sm capitalize">{skill.difficulty}</p>
                                {!isActive && missing.length > 0 && (
                                    <p className="text-yellow-400 text-xs mt-1">
                                        ⚠ Requires: {missing.join(', ')}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => isCompleted ? handleRestart(skill.id) : handleStart(skill.id)}
                                disabled={isActive || isPending}
                                className={`px-5 py-2 rounded-xl font-medium text-sm transition
                            ${isActive
                                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        : isCompleted
                                            ? 'bg-zinc-800 text-green-500 hover:text-white hover:bg-zinc-700'
                                            : 'bg-white text-zinc-950 hover:bg-zinc-200'
                                    }`}
                            >
                                {isActive ? 'In Progress' : isCompleted ? '↺ Restart' : 'Start Learning'}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}