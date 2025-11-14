import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';


const NewVideo = ({ video, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(true);
    const [teachersLoading, setTeachersLoading] = useState(true);
    
    // Form state
    const [formData, setFormData] = useState({
        videoTitle: '',
        videoLink: '',
        videoId: '',
        isPremium: false,
        playlistId: '',
        playlistName: '',
        teacherId: '',
        teacherName: '',
        tags: ''
    });

    // Fetch playlists and teachers
    const fetchData = async () => {
        try {
            setPlaylistsLoading(true);
            setTeachersLoading(true);
            
            const [playlistsRes, teachersRes] = await Promise.all([
                axiosInstance.get('/playlists'),
                axiosInstance.get('/teacher-list')
            ]);

            if (playlistsRes.data?.success) setPlaylists(playlistsRes.data.data || []);
            if (teachersRes.data?.success) setTeachers(teachersRes.data.data || []);

        } catch (err) {
            console.error('Error fetching data:', err);
            Swal.fire('Error!', 'ডেটা লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setPlaylistsLoading(false);
            setTeachersLoading(false);
        }
    };

    // যদি এডিট মোডে থাকে, ফর্ম ডেটা সেট করুন
    useEffect(() => {
        if (video) {
            setFormData({
                videoTitle: video.videoTitle || '',
                videoLink: video.videoLink || '',
                videoId: video.videoId || '',
                isPremium: video.isPremium || false,
                playlistId: video.playlistId || '',
                playlistName: video.playlistName || '',
                teacherId: video.teacherId || '',
                teacherName: video.teacherName || '',
                tags: video.tags ? video.tags.join(', ') : ''
            });
        }
    }, [video]);

    useEffect(() => {
        fetchData();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle playlist selection
    const handlePlaylistChange = (e) => {
        const selectedPlaylistId = e.target.value;
        const selectedPlaylist = playlists.find(playlist => playlist._id === selectedPlaylistId);
        
        if (selectedPlaylist) {
            setFormData(prev => ({
                ...prev,
                playlistId: selectedPlaylist._id,
                playlistName: selectedPlaylist.name
            }));
        }
    };

    // Handle teacher selection
    const handleTeacherChange = (e) => {
        const selectedTeacherId = e.target.value;
        const selectedTeacher = teachers.find(teacher => teacher._id === selectedTeacherId);
        
        if (selectedTeacher) {
            setFormData(prev => ({
                ...prev,
                teacherId: selectedTeacher._id,
                teacherName: selectedTeacher.name
            }));
        }
    };

    // Extract video ID from YouTube link
    const extractVideoId = (link) => {
        try {
            const url = new URL(link);
            if (url.hostname.includes('youtube.com')) {
                return url.searchParams.get('v');
            } else if (url.hostname.includes('youtu.be')) {
                return url.pathname.slice(1);
            }
            return '';
        } catch {
            return '';
        }
    };

    // Auto-fill video ID when video link changes
    useEffect(() => {
        if (formData.videoLink && !formData.videoId) {
            const extractedId = extractVideoId(formData.videoLink);
            if (extractedId) {
                setFormData(prev => ({
                    ...prev,
                    videoId: extractedId
                }));
            }
        }
    }, [formData.videoLink]);

    // Reset form
    const resetForm = () => {
        setFormData({
            videoTitle: '',
            videoLink: '',
            videoId: '',
            isPremium: false,
            playlistId: '',
            playlistName: '',
            teacherId: '',
            teacherName: '',
            tags: ''
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.videoTitle.trim()) {
            Swal.fire('Error!', 'ভিডিও শিরোনাম প্রয়োজন', 'error');
            return;
        }

        if (!formData.videoLink.trim()) {
            Swal.fire('Error!', 'ভিডিও লিংক প্রয়োজন', 'error');
            return;
        }

        if (!formData.videoId.trim()) {
            Swal.fire('Error!', 'ভিডিও আইডি প্রয়োজন', 'error');
            return;
        }

        // YouTube link validation
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeRegex.test(formData.videoLink)) {
            Swal.fire('Error!', 'সঠিক ইউটিউব ভিডিও লিংক দিন', 'error');
            return;
        }

        // Title length validation
        if (formData.videoTitle.trim().length < 2) {
            Swal.fire('Error!', 'ভিডিও শিরোনাম কমপক্ষে ২ অক্ষরের হতে হবে', 'error');
            return;
        }

        if (formData.videoTitle.trim().length > 200) {
            Swal.fire('Error!', 'ভিডিও শিরোনাম ২০০ অক্ষরের বেশি হতে পারবে না', 'error');
            return;
        }

        setLoading(true);

        try {
            let response;
            if (video) {
                // Edit mode
                response = await axiosInstance.put(`/institute-video/${video._id}`, formData);
            } else {
                // Add mode
                response = await axiosInstance.post('/institute-video', formData);
            }

            if (response.data && response.data.success) {
                Swal.fire('Success!', 
                    video ? 'ভিডিও সফলভাবে আপডেট হয়েছে' : 'ভিডিও সফলভাবে তৈরি হয়েছে', 
                    'success'
                );
                resetForm();
                if (onClose) {
                    onClose();
                }
            } else {
                Swal.fire('Error!', response.data?.message || 'সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error saving video:', error);
            
            // Handle duplicate video error
            if (error.response?.data?.message?.includes('ইতিমধ্যে')) {
                Swal.fire('Error!', error.response.data.message, 'error');
            } else {
                Swal.fire('Error!', 
                    video ? 'ভিডিও আপডেট করতে সমস্যা হয়েছে' : 'ভিডিও তৈরি করতে সমস্যা হয়েছে', 
                    'error'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Cancel form
    const handleCancel = () => {
        resetForm();
        if (onClose) {
            onClose();
        }
    };

    // Generate slug preview
    const generateSlug = (title) => {
        return title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            {video ? 'ভিডিও এডিট করুন' : 'নতুন ভিডিও যোগ করুন'}
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            {video ? 'ভিডিওর তথ্য আপডেট করুন' : 'নতুন ভিডিও তৈরি করুন'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Video Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Video Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="videoTitle"
                                value={formData.videoTitle}
                                onChange={handleInputChange}
                                placeholder="ভিডিওর শিরোনাম লিখুন"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                required
                                maxLength={200}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    কমপক্ষে ২ অক্ষর, সর্বোচ্চ ২০০ অক্ষর
                                </p>
                                <span className="text-xs text-gray-500">
                                    {formData.videoTitle.length}/200
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Video Link */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video Link <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    name="videoLink"
                                    value={formData.videoLink}
                                    onChange={handleInputChange}
                                    placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    ইউটিউব ভিডিওর সম্পূর্ণ লিংক
                                </p>
                            </div>

                            {/* Video ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="videoId"
                                    value={formData.videoId}
                                    onChange={handleInputChange}
                                    placeholder="xxxxxxxxxxx"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    ভিডিও আইডি অটোমেটিকভাবে ভরা হবে
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Playlist Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Playlist <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.playlistId}
                                    onChange={handlePlaylistChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    required
                                    disabled={playlistsLoading}
                                >
                                    <option value="">প্লেলিস্ট নির্বাচন করুন</option>
                                    {playlists.map(playlist => (
                                        <option key={playlist._id} value={playlist._id}>
                                            {playlist.name}
                                        </option>
                                    ))}
                                </select>
                                {playlistsLoading && (
                                    <p className="text-xs text-gray-500 mt-1">লোড হচ্ছে...</p>
                                )}
                            </div>

                            {/* Teacher Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teacher <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.teacherId}
                                    onChange={handleTeacherChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    required
                                    disabled={teachersLoading}
                                >
                                    <option value="">শিক্ষক নির্বাচন করুন</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher._id} value={teacher._id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                                {teachersLoading && (
                                    <p className="text-xs text-gray-500 mt-1">লোড হচ্ছে...</p>
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="ট্যাগগুলি কমা দ্বারা আলাদা করুন (উদাহরণ: math, algebra, tutorial)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                ট্যাগগুলি কমা (,) দ্বারা আলাদা করুন
                            </p>
                        </div>

                        {/* Premium Checkbox */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isPremium"
                                checked={formData.isPremium}
                                onChange={handleInputChange}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                id="isPremium"
                            />
                            <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-700">
                                প্রিমিয়াম ভিডিও
                            </label>
                        </div>

                        {/* Slug Preview */}
                        {formData.videoTitle && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Preview
                                </label>
                                <p className="text-sm text-gray-600 break-all">
                                    {generateSlug(formData.videoTitle)}
                                </p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 font-medium"
                                disabled={loading}
                            >
                                বাতিল
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {video ? 'আপডেট হচ্ছে...' : 'তৈরি হচ্ছে...'}
                                    </span>
                                ) : (
                                    video ? 'আপডেট করুন' : 'ভিডিও তৈরি করুন'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewVideo;