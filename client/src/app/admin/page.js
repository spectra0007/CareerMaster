'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Video as VideoIcon, Upload } from 'lucide-react';

export default function AdminDashboard() {
    const { getToken, isLoaded } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [videoData, setVideoData] = useState({ title: '', description: '', is_premium: true });
    const [uploading, setUploading] = useState(false);

    // Check admin role
    useEffect(() => {
        if (isLoaded && user?.publicMetadata?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        async function fetchData() {
            if (!isLoaded || user?.publicMetadata?.role !== 'admin') return;
            try {
                const token = await getToken();
                setAuthToken(token);
                const userRes = await api.get('/admin/users');
                setUsers(userRes.users || []);
            } catch (err) {
                console.error("Failed to load admin data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [getToken, isLoaded, user]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a video file');

        setUploading(true);
        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', videoData.title);
        formData.append('description', videoData.description);
        formData.append('is_premium', videoData.is_premium);

        try {
            const token = await getToken();
            setAuthToken(token);

            // We can't use the standard configured api client easily for FormData because of Content-Type 
            // which axios handles automatically if we let it, but it's simpler to use fetch sometimes.
            // We will override headers here:
            await api.post('/admin/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Video uploaded successfully!');
            setFile(null);
            setVideoData({ title: '', description: '', is_premium: true });
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    if (!isLoaded || loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
            <div className="flex items-center mb-8">
                <button onClick={() => router.push('/dashboard')} className="mr-4 text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-500">Manage users and upload content.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" /> Registered Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 top-0 sticky">
                                    <tr>
                                        <th className="px-4 py-2 font-medium">Email</th>
                                        <th className="px-4 py-2 font-medium">Role</th>
                                        <th className="px-4 py-2 font-medium">Subscription</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td className="px-4 py-3">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {u.subscription_status === 'active'
                                                    ? <span className="text-green-600 font-medium">Pro</span>
                                                    : <span className="text-gray-400">Free</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Upload Video */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" /> Upload Video
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={e => setFile(e.target.files[0])}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-200 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    value={videoData.title}
                                    onChange={e => setVideoData({ ...videoData, title: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="e.g., Scaling Databases"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={videoData.description}
                                    onChange={e => setVideoData({ ...videoData, description: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="premium"
                                    checked={videoData.is_premium}
                                    onChange={e => setVideoData({ ...videoData, is_premium: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="premium" className="text-sm font-medium text-gray-700">Premium Video (Requires Pro)</label>
                            </div>
                            <Button type="submit" disabled={uploading || !file} className="w-full mt-4">
                                {uploading ? 'Uploading to Cloudinary...' : 'Upload Video'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
