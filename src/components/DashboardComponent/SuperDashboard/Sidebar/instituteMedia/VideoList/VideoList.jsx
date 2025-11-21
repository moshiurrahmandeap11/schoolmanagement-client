import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import NewVideo from '../NewVideo/NewVideo';

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // Fetch playlists and teachers
    const fetchPlaylistsAndTeachers = async () => {
        try {
            const [playlistsRes, teachersRes] = await Promise.all([
                axiosInstance.get('/playlists'),
                axiosInstance.get('/teacher-list')
            ]);

            if (playlistsRes.data?.success) setPlaylists(playlistsRes.data.data || []);
            if (teachersRes.data?.success) setTeachers(teachersRes.data.data || []);

        } catch (err) {
            console.error('Error fetching playlists and teachers:', err);
        }
    };

    // Fetch videos with names
    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/institute-video');
            
            if (response.data && response.data.success) {
                let videosData = response.data.data || [];
                
                // Fetch playlists and teachers first if not already fetched
                if (playlists.length === 0 || teachers.length === 0) {
                    await fetchPlaylistsAndTeachers();
                }

                // Map playlist and teacher names to videos
                const videosWithNames = videosData.map(video => {
                    const playlist = playlists.find(p => p._id === video.playlistId);
                    const teacher = teachers.find(t => t._id === video.teacherId);
                    
                    return {
                        ...video,
                        playlistName: playlist?.name || 'N/A',
                        teacherName: teacher?.name || 'N/A'
                    };
                });

                setVideos(videosWithNames);
            } else {
                setError('ভিডিও লোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('ভিডিও লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching videos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    // Handle delete video
    const handleDeleteVideo = async (id) => {
        if (!window.confirm('আপনি কি এই ভিডিও ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/institute-video/${id}`);
            if (response.data && response.data.success) {
                fetchVideos(); // Refresh list
            } else {
                setError('ভিডিও ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('ভিডিও ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting video:', err);
        }
    };

    // Handle edit video
    const handleEditVideo = (video) => {
        setEditingVideo(video);
        setShowAddForm(true);
    };

    // Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingVideo(null);
        fetchVideos(); // Refresh list
    };

    // Truncate title for table view
    const truncateTitle = (title) => {
        return title.length > 50 
            ? title.substring(0, 50) + '...' 
            : title;
    };

    // যদি ফর্ম শো করতে হয়
    if (showAddForm) {
        return (
            <NewVideo 
                video={editingVideo}
                onClose={handleFormClose}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold ">
                                ভিডিও তালিকা
                            </h1>
                        </div>
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>New Video</span>
                        </MainButton>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ভিডিও নেই</h3>
                                <p className="text-gray-500 mb-4">এখনও কোন ভিডিও যোগ করা হয়নি</p>
                                <MainButton
                                    onClick={() => setShowAddForm(true)}
                                >
                                    প্রথম ভিডিও যোগ করুন
                                </MainButton>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ভিডিও শিরোনাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Premium/Free
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                প্লেলিস্ট
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিক্ষক
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ট্যাগ
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কাজ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {videos.map((video) => (
                                            <tr key={video._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="shrink-0">
                                                            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {truncateTitle(video.videoTitle)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                ID: {video.videoId}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        video.isPremium 
                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {video.isPremium ? 'Premium' : 'Free'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {video.playlistName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {video.teacherName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs">
                                                        {video.tags && video.tags.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {video.tags.slice(0, 3).map((tag, index) => (
                                                                    <span 
                                                                        key={index}
                                                                        className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                                {video.tags.length > 3 && (
                                                                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                                        +{video.tags.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">নেই</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => handleEditVideo(video)}
                                                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-1 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                                        >
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteVideo(video._id)}
                                                            className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-3 py-1 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                                                        >
                                                            ডিলিট
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Summary */}
                        {videos.length > 0 && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">{videos.length}</div>
                                        <div className="text-gray-600">মোট ভিডিও</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {videos.filter(v => v.isPremium).length}
                                        </div>
                                        <div className="text-gray-600">Premium</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {videos.filter(v => !v.isPremium).length}
                                        </div>
                                        <div className="text-gray-600">Free</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {new Set(videos.map(v => v.teacherName).filter(name => name !== 'N/A')).size}
                                        </div>
                                        <div className="text-gray-600">শিক্ষক</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoList;