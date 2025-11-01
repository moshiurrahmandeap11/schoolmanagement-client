import React, { useState, useEffect } from 'react';

import Swal from 'sweetalert2';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';

const VideoGalleryAdmin = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        caption: '',
        youtubeUrl: ''
    });

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/gallery/videos');
            if (response.data.success) {
                setVideos(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            Swal.fire('Error!', 'ভিডিও লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    const extractVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.caption || !formData.youtubeUrl) {
            Swal.fire('Error!', 'সব ফিল্ড পূরণ করুন', 'error');
            return;
        }

        const videoId = extractVideoId(formData.youtubeUrl);
        if (!videoId) {
            Swal.fire('Error!', 'সঠিক YouTube URL দিন', 'error');
            return;
        }

        try {
            const response = await axiosInstance.post('/gallery/videos', {
                caption: formData.caption,
                youtubeUrl: formData.youtubeUrl,
                videoId: videoId
            });

            if (response.data.success) {
                Swal.fire('Success!', 'ভিডিও সফলভাবে যুক্ত হয়েছে', 'success');
                setShowAddModal(false);
                setFormData({ caption: '', youtubeUrl: '' });
                fetchVideos();
            }
        } catch (error) {
            console.error('Error adding video:', error);
            Swal.fire('Error!', 'ভিডিও যুক্ত করতে সমস্যা হয়েছে', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত করুন',
            text: 'আপনি কি এই ভিডিও ডিলিট করতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন',
            cancelButtonText: 'না'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/gallery/videos/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'ভিডিও ডিলিট হয়েছে', 'success');
                    fetchVideos();
                }
            } catch (error) {
                console.error('Error deleting video:', error);
                Swal.fire('Error!', 'ভিডিও ডিলিট করতে সমস্যা হয়েছে', 'error');
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/gallery/videos/${id}/toggle`);
            if (response.data.success) {
                Swal.fire('Success!', response.data.message, 'success');
                fetchVideos();
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            Swal.fire('Error!', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Video Gallery</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        + Add New Video
                    </button>
                </div>

                {/* Videos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Video Thumbnail */}
                            <div className="relative aspect-video">
                                <img
                                    src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                                    alt={video.caption}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <a
                                        href={video.youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-red-600 text-white rounded-full p-4 hover:bg-red-700 transition-colors"
                                    >
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Video Info */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{video.caption}</h3>
                                
                                <div className="flex items-center justify-between mt-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        video.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {video.isActive ? 'Active' : 'Inactive'}
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleStatus(video._id, video.isActive)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                        >
                                            Toggle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(video._id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {videos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">কোন ভিডিও পাওয়া যায়নি</p>
                    </div>
                )}

                {/* Add Video Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Add New Video</h2>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">Caption</label>
                                    <input
                                        type="text"
                                        value={formData.caption}
                                        onChange={(e) => setFormData({...formData, caption: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter video caption"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">YouTube URL</label>
                                    <input
                                        type="text"
                                        value={formData.youtubeUrl}
                                        onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                    >
                                        Add Video
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setFormData({ caption: '', youtubeUrl: '' });
                                        }}
                                        className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGalleryAdmin;