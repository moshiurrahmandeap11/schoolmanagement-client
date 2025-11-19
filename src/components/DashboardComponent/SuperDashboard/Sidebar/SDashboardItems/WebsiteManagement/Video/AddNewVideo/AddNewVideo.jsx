import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../../sharedItems/Mainbutton/Mainbutton';


const AddNewVideo = ({ editingVideo, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        videoLink: '',
        videoId: '',
        isPremium: false,
        playlist: '',
        teacher: '',
        tags: ''
    });

    useEffect(() => {
        fetchPlaylists();
        fetchTeachers();
        
        if (editingVideo) {
            setFormData({
                title: editingVideo.title || '',
                videoLink: editingVideo.videoLink || '',
                videoId: editingVideo.videoId || '',
                isPremium: editingVideo.isPremium || false,
                playlist: editingVideo.playlist || '',
                teacher: editingVideo.teacher || '',
                tags: editingVideo.tags || ''
            });
        }
    }, [editingVideo]);

    const fetchPlaylists = async () => {
        try {
            const response = await axiosInstance.get('/playlists');
            if (response.data.success) {
                setPlaylists(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await axiosInstance.get('/teacher-list');
            if (response.data.success) {
                setTeachers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.videoLink || !formData.videoId) {
            Swal.fire('Error!', 'ভিডিও শিরোনাম, লিংক এবং আইডি আবশ্যক', 'error');
            return;
        }

        setLoading(true);

        try {
            let response;
            if (editingVideo) {
                response = await axiosInstance.put(`/videos/${editingVideo._id}`, formData);
            } else {
                response = await axiosInstance.post('/videos', formData);
            }

            if (response.data.success) {
                Swal.fire('Success!', 
                    editingVideo ? 'ভিডিও সফলভাবে আপডেট হয়েছে' : 'ভিডিও সফলভাবে তৈরি হয়েছে', 
                    'success'
                );
                onBack();
            }
        } catch (error) {
            console.error('Error saving video:', error);
            const errorMessage = error.response?.data?.message || 
                (editingVideo ? 'ভিডিও আপডেট করতে সমস্যা হয়েছে' : 'ভিডিও তৈরি করতে সমস্যা হয়েছে');
            Swal.fire('Error!', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {editingVideo ? 'ভিডিও এডিট করুন' : 'নতুন ভিডিও তৈরি করুন'}
                        </h1>
                        <button
                            onClick={onBack}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium text-sm"
                        >
                            ভিডিও তালিকায় ফিরে যান
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Video Title */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                ভিডিও শিরোনাম <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                placeholder="ভিডিওর শিরোনাম লিখুন"
                                required
                            />
                        </div>

                        {/* Video Link */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                ভিডিও লিংক <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                name="videoLink"
                                value={formData.videoLink}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                placeholder="https://example.com/video"
                                required
                            />
                        </div>

                        {/* Video ID */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                ভিডিও আইডি <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="videoId"
                                value={formData.videoId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                placeholder="ভিডিওর ইউনিক আইডি"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Playlist */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">প্লেলিস্ট</label>
                                <select
                                    name="playlist"
                                    value={formData.playlist}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                >
                                    <option value="">প্লেলিস্ট নির্বাচন করুন</option>
                                    {playlists.map(playlist => (
                                        <option key={playlist._id} value={playlist._id}>
                                            {playlist.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Teacher */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">শিক্ষক</label>
                                <select
                                    name="teacher"
                                    value={formData.teacher}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                >
                                    <option value="">শিক্ষক নির্বাচন করুন</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher._id} value={teacher._id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Is Premium */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isPremium"
                                checked={formData.isPremium}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-[#1e90c9] border-gray-300 rounded focus:ring-[#1e90c9]"
                                id="isPremium"
                            />
                            <label htmlFor="isPremium" className="ml-2 text-gray-700 font-medium">
                                Premium ভিডিও
                            </label>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">ট্যাগস (Enter দ্বারা আলাদা করুন)</label>
                            <textarea
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                placeholder="প্রতিটি ট্যাগ Enter চাপে আলাদা করুন"
                                rows="3"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <MainButton
                                type="submit"
                                className='flex-1 flex items-center justify-center rounded-md'
                                disabled={loading}
                            >
                                {loading 
                                    ? (editingVideo ? 'আপডেট হচ্ছে...' : 'তৈরি হচ্ছে...') 
                                    : (editingVideo ? 'ভিডিও আপডেট করুন' : 'ভিডিও তৈরি করুন')
                                }
                            </MainButton>
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-medium text-lg transition-colors"
                            >
                                বাতিল করুন
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewVideo;