import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';


const NewMedia = ({ media, onClose }) => {
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        youtubeChannelLink: '',
        featuredVideoLink: ''
    });

    // যদি এডিট মোডে থাকে, ফর্ম ডেটা সেট করুন
    useEffect(() => {
        if (media) {
            setFormData({
                name: media.name || '',
                youtubeChannelLink: media.youtubeChannelLink || '',
                featuredVideoLink: media.featuredVideoLink || ''
            });
        }
    }, [media]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            youtubeChannelLink: '',
            featuredVideoLink: ''
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim()) {
            Swal.fire('Error!', 'মিডিয়ার নাম প্রয়োজন', 'error');
            return;
        }

        if (!formData.youtubeChannelLink.trim()) {
            Swal.fire('Error!', 'ইউটিউব চ্যানেল লিংক প্রয়োজন', 'error');
            return;
        }

        // YouTube channel link validation
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeRegex.test(formData.youtubeChannelLink)) {
            Swal.fire('Error!', 'সঠিক ইউটিউব চ্যানেল লিংক দিন', 'error');
            return;
        }

        // Featured video link validation (if provided)
        if (formData.featuredVideoLink && formData.featuredVideoLink.trim()) {
            if (!youtubeRegex.test(formData.featuredVideoLink)) {
                Swal.fire('Error!', 'সঠিক ইউটিউব ভিডিও লিংক দিন', 'error');
                return;
            }
        }

        // Name length validation
        if (formData.name.trim().length < 2) {
            Swal.fire('Error!', 'মিডিয়ার নাম কমপক্ষে ২ অক্ষরের হতে হবে', 'error');
            return;
        }

        if (formData.name.trim().length > 100) {
            Swal.fire('Error!', 'মিডিয়ার নাম ১০০ অক্ষরের বেশি হতে পারবে না', 'error');
            return;
        }

        setLoading(true);

        try {
            let response;
            if (media) {
                // Edit mode
                response = await axiosInstance.put(`/institute-media/${media._id}`, formData);
            } else {
                // Add mode
                response = await axiosInstance.post('/institute-media', formData);
            }

            if (response.data && response.data.success) {
                Swal.fire('Success!', 
                    media ? 'মিডিয়া সফলভাবে আপডেট হয়েছে' : 'মিডিয়া সফলভাবে তৈরি হয়েছে', 
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
            console.error('Error saving media:', error);
            
            // Handle duplicate media error
            if (error.response?.data?.message?.includes('ইতিমধ্যে')) {
                Swal.fire('Error!', error.response.data.message, 'error');
            } else {
                Swal.fire('Error!', 
                    media ? 'মিডিয়া আপডেট করতে সমস্যা হয়েছে' : 'মিডিয়া তৈরি করতে সমস্যা হয়েছে', 
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
    const generateSlug = (name) => {
        return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    };

    // Extract YouTube channel ID for preview
    const getYouTubeChannelId = (link) => {
        try {
            const url = new URL(link);
            if (url.hostname.includes('youtube.com')) {
                if (url.pathname.includes('/channel/')) {
                    return url.pathname.split('/').pop();
                } else if (url.pathname.includes('/c/')) {
                    return url.pathname.split('/').pop();
                } else if (url.pathname.includes('/user/')) {
                    return url.pathname.split('/').pop();
                }
            }
            return null;
        } catch {
            return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            {media ? 'মিডিয়া এডিট করুন' : 'নতুন মিডিয়া যোগ করুন'}
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            {media ? 'মিডিয়ার তথ্য আপডেট করুন' : 'নতুন মিডিয়া তৈরি করুন'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Media Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="মিডিয়ার নাম লিখুন"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                required
                                maxLength={100}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    কমপক্ষে ২ অক্ষর, সর্বোচ্চ ১০০ অক্ষর
                                </p>
                                <span className="text-xs text-gray-500">
                                    {formData.name.length}/100
                                </span>
                            </div>
                        </div>

                        {/* YouTube Channel Link */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Youtube channel link <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                name="youtubeChannelLink"
                                value={formData.youtubeChannelLink}
                                onChange={handleInputChange}
                                placeholder="https://www.youtube.com/channel/UCxxxxxxxxxxxxx"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                ইউটিউব চ্যানেলের সম্পূর্ণ লিংক দিন
                            </p>
                            {formData.youtubeChannelLink && getYouTubeChannelId(formData.youtubeChannelLink) && (
                                <p className="text-xs text-green-600 mt-1">
                                    চ্যানেল আইডি: {getYouTubeChannelId(formData.youtubeChannelLink)}
                                </p>
                            )}
                        </div>

                        {/* Featured Video Link */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Featuted video link
                            </label>
                            <input
                                type="url"
                                name="featuredVideoLink"
                                value={formData.featuredVideoLink}
                                onChange={handleInputChange}
                                placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                বৈশিষ্ট্যযুক্ত ভিডিওর লিংক (ঐচ্ছিক)
                            </p>
                        </div>

                        {/* Slug Preview */}
                        {formData.name.trim() && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">স্লাগ প্রিভিউ:</h4>
                                <div className="text-sm text-gray-600 bg-white border border-gray-300 rounded px-3 py-2 font-mono">
                                    {generateSlug(formData.name)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    এই স্লাগটি স্বয়ংক্রিয়ভাবে জেনারেট হবে
                                </p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                বাতিল করুন
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center space-x-2 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{media ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{media ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewMedia;