import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';

import { createProfile, getProfile } from '../api/profile'


export default function Setup() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        retry: false,
        throwOnError: false
    })

    useEffect(() => {
        if (profile) {
            navigate("/dashboard");
        }
    }, [profile, navigate]);


    const [formData, setFormData] = useState({
        experience: '',
        days_per_week: '',
        session_duration_minutes: '',
        height_cm: '',
        weight_kg: '',
        age: ''
    });

    const { mutate, isPending } = useMutation({
        mutationFn: createProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            navigate('/dashboard')
        },
        onError: (error) => {
            console.error("Failed to save profile:", error);
        }
    })


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        mutate(formData)
    }

    if (isLoading) return <div>Loading...</div>;

    if (profile) return null;

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <h2 className="text-3xl font-black text-white mb-2">Set up your profile</h2>
                <p className="text-zinc-500 text-sm mb-8">Tell us about yourself so we can build the right plan.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 text-sm">Experience Level</label>
                        <select
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            required
                            className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600"
                        >
                            <option value="">Select level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 text-sm">Training Days Per Week</label>
                        <input
                            type="number" name="days_per_week"
                            value={formData.days_per_week}
                            onChange={handleChange}
                            min={1} max={7} required
                            disabled={isPending}
                            className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-zinc-400 text-sm">Session Duration (minutes)</label>
                        <input
                            type="number" name="session_duration_minutes"
                            value={formData.session_duration_minutes}
                            onChange={handleChange} required
                            disabled={isPending}
                            className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-zinc-400 text-sm">Height (cm)</label>
                            <input
                                type="number" name="height_cm"
                                value={formData.height_cm}
                                onChange={handleChange}
                                disabled={isPending}
                                className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-zinc-400 text-sm">Weight (kg)</label>
                            <input
                                type="number" name="weight_kg"
                                value={formData.weight_kg}
                                onChange={handleChange}
                                disabled={isPending}
                                className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-zinc-400 text-sm">Age</label>
                            <input
                                type="number" name="age"
                                value={formData.age}
                                onChange={handleChange}
                                disabled={isPending}
                                className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="mt-2 bg-white text-zinc-950 font-bold py-4 rounded-xl hover:bg-zinc-200 transition"
                    >
                        {isPending ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    )
}