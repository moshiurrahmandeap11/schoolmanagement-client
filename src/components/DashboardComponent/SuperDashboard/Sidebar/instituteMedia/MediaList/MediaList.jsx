import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import NewMedia from '../NewMedia/NewMedia';


const MediaList = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMedia, setEditingMedia] = useState(null);

    // Fetch media
    const fetchMedia = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/institute-media');
            if (response.data && response.data.success) {
                setMedia(response.data.data || []);
            } else {
                setError('মিডিয়া লোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('মিডিয়া লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching media:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    // Handle delete media
    const handleDeleteMedia = async (id) => {
        if (!window.confirm('আপনি কি এই মিডিয়া ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/institute-media/${id}`);
            if (response.data && response.data.success) {
                fetchMedia(); // Refresh list
            } else {
                setError('মিডিয়া ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('মিডিয়া ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting media:', err);
        }
    };

    // Handle edit media
    const handleEditMedia = (mediaItem) => {
        setEditingMedia(mediaItem);
        setShowAddForm(true);
    };

    // Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingMedia(null);
        fetchMedia(); // Refresh list
    };

    // Format YouTube link for display
    const formatYouTubeLink = (link) => {
        if (!link) return '';
        // Extract channel name or video ID for display
        try {
            const url = new URL(link);
            if (url.hostname.includes('youtube.com')) {
                if (url.pathname.includes('/channel/')) {
                    return `Channel: ${url.pathname.split('/').pop()}`;
                } else if (url.pathname.includes('/c/')) {
                    return `Channel: ${url.pathname.split('/').pop()}`;
                } else if (url.searchParams.get('v')) {
                    return `Video: ${url.searchParams.get('v')}`;
                }
            } else if (url.hostname.includes('youtu.be')) {
                return `Video: ${url.pathname.slice(1)}`;
            }
            return link;
        } catch {
            return link;
        }
    };

    // Format date in Bengali
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // যদি ফর্ম শো করতে হয়
    if (showAddForm) {
        return (
            <NewMedia 
                media={editingMedia}
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
                                মিডিয়া ব্যবস্থাপনা
                            </h1>
                        </div>
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>New Media</span>
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
                        ) : media.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন মিডিয়া নেই</h3>
                                <p className="text-gray-500 mb-4">এখনও কোন মিডিয়া যোগ করা হয়নি</p>
                                <MainButton
                                    onClick={() => setShowAddForm(true)}
                                >
                                    প্রথম মিডিয়া যোগ করুন
                                </MainButton>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                মিডিয়ার নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ইউটিউব চ্যানেলের লিংক
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                বৈশিষ্ট্যযুক্ত ভিডিও লিঙ্ক
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তৈরি হয়েছে
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কাজ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {media.map((mediaItem) => (
                                            <tr key={mediaItem._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {mediaItem.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        <a 
                                                            href={mediaItem.youtubeChannelLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-900 underline flex items-center space-x-1"
                                                        >
                                                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                                            </svg>
                                                            <span className="truncate max-w-xs">
                                                                {formatYouTubeLink(mediaItem.youtubeChannelLink)}
                                                            </span>
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {mediaItem.featuredVideoLink ? (
                                                            <a 
                                                                href={mediaItem.featuredVideoLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-900 underline flex items-center space-x-1"
                                                            >
                                                                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                                                </svg>
                                                                <span className="truncate max-w-xs">
                                                                    {formatYouTubeLink(mediaItem.featuredVideoLink)}
                                                                </span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">নেই</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(mediaItem.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => handleEditMedia(mediaItem)}
                                                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-1 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                                        >
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMedia(mediaItem._id)}
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
                        {media.length > 0 && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">{media.length}</div>
                                        <div className="text-gray-600">মোট মিডিয়া</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {media.filter(m => m.featuredVideoLink).length}
                                        </div>
                                        <div className="text-gray-600">ফিচার্ড ভিডিও</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {new Set(media.map(m => m.youtubeChannelLink)).size}
                                        </div>
                                        <div className="text-gray-600">ইউনিক চ্যানেল</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {Math.ceil(media.reduce((acc, m) => acc + m.name.length, 0) / media.length) || 0}
                                        </div>
                                        <div className="text-gray-600">গড় নামের দৈর্ঘ্য</div>
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

export default MediaList;