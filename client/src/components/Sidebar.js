'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileCode2, Video, Settings, Crown, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useClerk } from '@clerk/nextjs';

const navItems = [
    { name: 'Roadmap', href: '/dashboard', icon: LayoutDashboard },
    { name: 'LeetCode Tracker', href: '/leetcode', icon: FileCode2 },
    { name: 'Video Library', href: '/videos', icon: Video },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const { signOut } = useClerk();

    const isAdmin = user?.publicMetadata?.role === 'admin';

    return (
        <div className="flex flex-col w-64 bg-slate-900 h-screen py-8 px-4 border-r border-slate-800 text-slate-300">
            <div className="flex items-center justify-center mb-10">
                <h2 className="text-2xl font-bold text-white tracking-tight">Career<span className="text-blue-500">Master</span></h2>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium',
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}

                <Link
                    href="/pricing"
                    className="flex items-center gap-3 px-4 py-3 mt-8 rounded-lg transition-colors text-sm font-medium text-yellow-400 hover:bg-slate-800"
                >
                    <Crown className="w-5 h-5" />
                    Upgrade to Premium
                </Link>
            </nav>

            <div className="mt-auto space-y-2">
                {isAdmin && (
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium hover:bg-slate-800 hover:text-white"
                    >
                        <Settings className="w-5 h-5" />
                        Admin Panel
                    </Link>
                )}
                <button
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className="flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
