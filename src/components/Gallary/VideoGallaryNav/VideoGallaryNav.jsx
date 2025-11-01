import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../components/sharedItems/Loader/Loader';

const VideoGallaryNav = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const videosPerPage = 6;

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/gallery/videos');
            if (response.data.success) {
                const activeVideos = (response.data.data || []).filter(v => v.isActive);
                setVideos(activeVideos);
            } else {
                setError('Failed to load videos');
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            setError('Failed to load video gallery');
        } finally {
            setLoading(false);
        }
    };

    // Pagination Logic
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);
    const totalPages = Math.ceil(videos.length / videosPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Modal
    const openModal = (video) => setSelectedVideo(video);
    const closeModal = () => setSelectedVideo(null);

    // Fallback thumbnail
    const getThumbnail = (videoId) => {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
                        <div className="text-red-500 text-6xl mb-4">Warning</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button onClick={fetchVideos} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="text-6xl mb-4">No Video</div>
                        <h3 className="text-xl font-semibold text-gray-800">কোনো ভিডিও পাওয়া যায়নি</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        ভিডিও গ্যালারি
                    </h1>
                    <div className="w-32 h-1 bg-black mx-auto"></div>
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {currentVideos.map((video) => (
                        <div
                            key={video._id}
                            onClick={() => openModal(video)}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-gray-200">
                                <img
                                    src={getThumbnail(video.videoId)}
                                    alt={video.caption}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = `https://img.youtube.com/vi/${video.videoId}/default.jpg`;
                                    }}
                                />
                                {/* Play Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
                                    <div className="bg-red-600 text-white rounded-full p-3 shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Caption */}
                            <div className="p-4">
                                <p className="text-sm md:text-base font-medium text-gray-800 line-clamp-2 text-center">
                                    {video.caption}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 flex-wrap">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            Previous
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    currentPage === i + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 bg-black/40 bg-opacity-90 flex items-center justify-center z-50 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="relative w-full max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-400 transition"
                        >
                            ×
                        </button>
                        <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-2xl">
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
                                title={selectedVideo.caption}
                                className="absolute top-0 left-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <p className="text-white text-center mt-4 text-lg font-medium">
                            {selectedVideo.caption}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGallaryNav;