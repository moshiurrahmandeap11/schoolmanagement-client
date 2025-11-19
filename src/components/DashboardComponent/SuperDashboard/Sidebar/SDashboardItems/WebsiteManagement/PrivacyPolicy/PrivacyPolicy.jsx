import { useEffect, useState } from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import RichTextEditor from '../../../../../../sharedItems/RichTextEditor/RichTextEditor';


const PrivacyPolicy = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [existingPolicy, setExistingPolicy] = useState(null);

    // Fetch privacy policy
    useEffect(() => {
        fetchPrivacyPolicy();
    }, []);

    const fetchPrivacyPolicy = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/privacy-policy');
            
            if (response.data.success && response.data.data) {
                setExistingPolicy(response.data.data);
                setContent(response.data.data.content || '');
            } else {
                setContent('');
            }
        } catch (error) {
            console.error('Error fetching privacy policy:', error);
            showSweetAlert('error', 'Failed to load privacy policy: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const showSweetAlert = (icon, title, text = '') => {
        Swal.fire({
            icon,
            title,
            text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    const handleContentChange = (newContent) => {
        setContent(newContent);
    };

    const handleSave = async () => {
        if (!content.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter privacy policy content'
            });
            return;
        }

        try {
            setSaving(true);

            let response;
            if (existingPolicy) {
                // Update existing privacy policy
                response = await axiosInstance.put(`/privacy-policy/${existingPolicy._id}`, {
                    content: content
                });
            } else {
                // Create new privacy policy
                response = await axiosInstance.post('/privacy-policy', {
                    content: content
                });
            }

            if (response.data.success) {
                showSweetAlert('success', 'Privacy policy saved successfully!');
                fetchPrivacyPolicy(); // Refresh data
            } else {
                showSweetAlert('error', response.data.message || 'Failed to save privacy policy');
            }
        } catch (error) {
            console.error('Error saving privacy policy:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to save privacy policy'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (existingPolicy) {
            setContent(existingPolicy.content);
        } else {
            setContent('');
        }
    };

    // Format last updated time
    const formatLastUpdated = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            গোপনীয়তা নীতি ব্যবস্থাপনা
                        </h1>
                    </div>

                    {/* Last Updated Info */}
                    {existingPolicy && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <p className="text-sm font-medium text-[#1e90c9]">
                                        Last Updated
                                    </p>
                                    <p className="text-sm text-[#1e90c9]">
                                        {formatLastUpdated(existingPolicy.updatedAt)}
                                    </p>
                                </div>
                                <div className="text-sm text-[#1e90c9]">
                                    Created: {formatLastUpdated(existingPolicy.createdAt)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Editor */}
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <Loader></Loader>
                        )}

                        {/* Editor Content */}
                        {!loading && (
                            <div className="p-6">
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        প্রাইভেসি পলিসি *
                                    </label>
                                    <RichTextEditor
                                        value={content}
                                        onChange={handleContentChange}
                                        placeholder="আপনার ওয়েবসাইটের গোপনীয়তা নীতি লিখুন..."
                                        height="500px"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        ব্যবহারকারীদের ডাটা সংগ্রহ, ব্যবহার, এবং সুরক্ষা সম্পর্কিত বিস্তারিত নীতি লিখুন
                                    </p>
                                </div>

                                {/* Character Count */}
                                <div className="mb-6 p-3 bg-gray-50 rounded-lg border">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Content Statistics
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Characters: {content.length} | Words: {content.split(/\s+/).filter(word => word.length > 0).length}
                                            </p>
                                        </div>
                                        {!content.trim() && (
                                            <p className="text-sm text-red-600 font-medium">
                                                Please enter privacy policy content
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                                    <MainButton
                                        onClick={handleSave}
                                        disabled={saving || !content.trim()}
                                        className="flex-1 px-6 py-3 text-white rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave />
                                                {existingPolicy ? 'Update Policy' : 'Save Policy'}
                                            </>
                                        )}
                                    </MainButton>
                                    <button
                                        onClick={handleReset}
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                                    >
                                        Reset Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Guidelines */}
                    <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                            গোপনীয়তা নীতি লেখার নির্দেশিকা
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
                            <div className="space-y-2">
                                <p><strong>ডাটা সংগ্রহ:</strong> কোন তথ্য সংগ্রহ করা হয় এবং কেন</p>
                                <p><strong>ডাটা ব্যবহার:</strong> সংগ্রহকৃত তথ্য কীভাবে ব্যবহার করা হয়</p>
                                <p><strong>ডাটা সুরক্ষা:</strong> তথ্য সুরক্ষার ব্যবস্থা</p>
                            </div>
                            <div className="space-y-2">
                                <p><strong>তৃতীয় পক্ষ:</strong> অন্য কোম্পানির সাথে তথ্য শেয়ার</p>
                                <p><strong>কুকিজ:</strong> কুকিজ ব্যবহার সম্পর্কে তথ্য</p>
                                <p><strong>ব্যবহারকারীর অধিকার:</strong> তথ্য মুছে ফেলার অধিকার</p>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {content.trim() && (
                        <div className="mt-8">
                            <div className="bg-white rounded-lg shadow border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        প্রিভিউ
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        গোপনীয়তা নীতি কীভাবে দেখাবে তার প্রিভিউ
                                    </p>
                                </div>
                                <div className="p-6">
                                    <div 
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: content }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;