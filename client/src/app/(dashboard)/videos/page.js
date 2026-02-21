'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import api, { setAuthToken } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, Lock } from 'lucide-react';

export default function VideoLibraryPage() {
    const { getToken, isLoaded } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVideos() {
            if (!isLoaded) return;
            try {
                const token = await getToken();
                setAuthToken(token);
                const res = await api.get('/videos');
                setVideos(res.videos || []);
            } catch (err) {
                console.error("Failed to fetch videos", err);
            } finally {
                setLoading(false);
            }
        }
        fetchVideos();
    }, [getToken, isLoaded]);

    if (loading) return <div className="p-8">Loading videos...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Video Library</h1>
                <p className="text-gray-500 mt-2">Master system design and behavioral interviews with our curated lectures.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.length === 0 ? (
                    <p className="text-gray-500">No videos available.</p>
                ) : (
                    videos.map((vid) => (
                        <Link href={`/videos/${vid.id}`} key={vid.id} className="group cursor-pointer">
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white pb-4 rounded-xl border-gray-200">
                                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                    <img src={vid.thumbnail_url} alt={vid.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {vid.is_premium ? (
                                            <Lock className="w-12 h-12 text-white" />
                                        ) : (
                                            <PlayCircle className="w-12 h-12 text-white" />
                                        )}
                                    </div>
                                    {vid.is_premium && (
                                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                            PRO
                                        </div>
                                    )}
                                    {vid.duration && (
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                            {Math.floor(vid.duration / 60)}:{String(vid.duration % 60).padStart(2, '0')}
                                        </div>
                                    )}
                                </div>
                                <CardContent className="pt-4 px-4 pb-0">
                                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{vid.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{vid.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
