'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import api, { setAuthToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export default function VideoPlayerPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getToken, isLoaded } = useAuth();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchVideo() {
            if (!isLoaded || !id) return;
            try {
                const token = await getToken();
                setAuthToken(token);
                const res = await api.get(`/videos/${id}`);
                setVideo(res.video);
            } catch (err) {
                setError(err.message === 'Premium subscription required' ? 'premium' : err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchVideo();
    }, [id, getToken, isLoaded]);

    if (loading) return <div className="p-8">Loading player...</div>;

    if (error === 'premium') {
        return (
            <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Lock className="w-16 h-16 text-yellow-500 mb-6" />
                <h2 className="text-3xl font-bold mb-4">Premium Content Locked</h2>
                <p className="text-gray-500 mb-8 max-w-md">You need an active Pro subscription to access this video lecture. Upgrade now to unlock all content.</p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                    <Button asChild><Link href="/pricing">View Plans</Link></Button>
                </div>
            </div>
        );
    }

    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
    if (!video) return <div className="p-8">Video not found.</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
            </button>

            <div className="bg-black aspect-video w-full rounded-2xl overflow-hidden shadow-2xl mb-8">
                <video
                    controls
                    className="w-full h-full object-contain"
                    poster={video.thumbnail_url}
                >
                    <source src={video.cloudinary_url} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{video.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b pb-6">
                    <span>{video.category || 'General'}</span>
                    <span>•</span>
                    <span>{Math.floor(video.duration / 60)} mins</span>
                    {video.is_premium && (
                        <>
                            <span>•</span>
                            <span className="bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded text-xs">Premium</span>
                        </>
                    )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{video.description}</p>
            </div>
        </div>
    );
}
