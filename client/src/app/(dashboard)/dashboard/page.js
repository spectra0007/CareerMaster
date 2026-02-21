'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarDays, Trophy, Flame, Crown } from 'lucide-react';

export default function DashboardPage() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Welcome back, {user?.firstName || 'Engineer'}!
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Here's what happening with your career prep today.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Problems Solved</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12 / 150</div>
                        <p className="text-xs text-gray-500 mt-1">Keep up the good work!</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Current Streak</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3 Days</div>
                        <p className="text-xs text-gray-500 mt-1">Personal best: 7 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Upcoming Mock Interview</CardTitle>
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">In 2 days</div>
                        <p className="text-xs text-blue-600 font-medium mt-1 hover:underline cursor-pointer">Reschedule</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recommended Pathway</CardTitle>
                        <CardDescription>Your personalized guide to landing your dream role.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            <li className="flex gap-4 items-start">
                                <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Master Data Structures</h4>
                                    <p className="text-sm text-gray-500">Review Arrays, HashMaps, and Linked Lists.</p>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">System Design Basics</h4>
                                    <p className="text-sm text-gray-500">Watch the "Scaling from Zero to Millions" video.</p>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                <div>
                                    <h4 className="font-semibold text-gray-500">Mock Interview</h4>
                                    <p className="text-sm text-gray-400">Schedule your first technical round.</p>
                                </div>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Temporary Placeholder for recent videos */}
                <Card className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
                    <CardHeader>
                        <CardTitle className="text-white">Premium Content</CardTitle>
                        <CardDescription className="text-slate-300">Unlock advanced system design lectures.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <Crown className="w-12 h-12 text-yellow-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
                        <p className="text-slate-300 mb-6 max-w-sm">Get access to 50+ hours of exclusive video content from FAANG engineers.</p>
                        <button className="bg-white text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-slate-100 transition">View Plans</button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
