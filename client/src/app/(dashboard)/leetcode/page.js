'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import api, { setAuthToken } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils'; // Make sure this utility exists or remove if not needed. Make sure to define cn if needed.

export default function LeetcodePage() {
    const { getToken, isLoaded } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            if (!isLoaded) return;
            try {
                const token = await getToken();
                setAuthToken(token);

                // Fetch plans + user progress (combining for demo purposes, backend returns separately)
                // In reality, you'd fetch both and map them. Since backend is stubbed, we'll make the calls.
                const [plansRes, progressRes] = await Promise.all([
                    api.get('/leetcode'),
                    api.get('/leetcode/progress')
                ]);

                const plansData = plansRes.plans || [];
                const progressData = progressRes.progress || [];

                const mappedPlans = plansData.map(plan => {
                    const prog = progressData.find(p => p.plan_id === plan.id);
                    return { ...plan, status: prog?.status || 'not_started', notes: prog?.notes || '' };
                });

                setPlans(mappedPlans);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [getToken, isLoaded]);

    const toggleStatus = async (planId, currentStatus) => {
        const nextStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
        try {
            // Optmistic UI update
            setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: nextStatus } : p));

            const token = await getToken();
            setAuthToken(token);
            await api.put(`/leetcode/${planId}/progress`, { status: nextStatus });
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert on error
            setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: currentStatus } : p));
        }
    };

    if (loading) return <div className="p-8">Loading plans...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">LeetCode Tracker</h1>
                <p className="text-gray-500 mt-2">Track your progress through the curated Blind 75 and NeetCode 150.</p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Problem</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Difficulty</th>
                                <th className="px-6 py-4 font-medium text-gray-500 relative hidden md:table-cell">Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {plans.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No problems have been added by the admin yet.</td>
                                </tr>
                            ) : (
                                plans.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(p.id, p.status)}
                                                className="flex items-center justify-center rounded-full hover:bg-gray-100 p-1 transition"
                                            >
                                                {p.status === 'completed'
                                                    ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                    : <Circle className="w-6 h-6 text-gray-300" />
                                                }
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <a href={p.leetcode_url} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                                                {p.leetcode_number}. {p.title}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                                p.difficulty === 'easy' && "bg-green-100 text-green-700",
                                                p.difficulty === 'medium' && "bg-yellow-100 text-yellow-700",
                                                p.difficulty === 'hard' && "bg-red-100 text-red-700"
                                            )}>
                                                {p.difficulty?.charAt(0).toUpperCase() + p.difficulty?.slice(1) || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{p.category}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
