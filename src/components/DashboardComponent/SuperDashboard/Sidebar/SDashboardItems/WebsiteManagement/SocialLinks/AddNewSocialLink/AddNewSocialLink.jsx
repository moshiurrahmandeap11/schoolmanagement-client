import { useEffect, useState } from 'react';
import { FaArrowLeft, FaFacebook, FaInstagram, FaLink, FaLinkedin, FaSave, FaTwitter, FaYoutube } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';


const AddNewSocialLink = ({ editingSocialLink, onBack }) => {
    const [formData, setFormData] = useState({
        platform: 'facebook',
        url: ''
    });
    
    const [loading, setLoading] = useState(false);

    // Set form data when editing
    useEffect(() => {
        if (editingSocialLink) {
            setFormData({
                platform: editingSocialLink.platform || 'facebook',
                url: editingSocialLink.url || ''
            });
        }
    }, [editingSocialLink]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    };

    const getPlatformPlaceholder = (platform) => {
        switch (platform) {
            case 'facebook':
                return 'https://facebook.com/your-page';
            case 'youtube':
                return 'https://youtube.com/c/your-channel';
            case 'twitter':
                return 'https://twitter.com/your-profile';
            case 'linkedin':
                return 'https://linkedin.com/company/your-company';
            case 'instagram':
                return 'https://instagram.com/your-profile';
            default:
                return 'https://example.com';
        }
    };

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'facebook':
                return <FaFacebook className="text-blue-600 text-lg" />;
            case 'youtube':
                return <FaYoutube className="text-red-600 text-lg" />;
            case 'twitter':
                return <FaTwitter className="text-blue-400 text-lg" />;
            case 'linkedin':
                return <FaLinkedin className="text-blue-700 text-lg" />;
            case 'instagram':
                return <FaInstagram className="text-pink-600 text-lg" />;
            default:
                return <FaLink className="text-gray-600 text-lg" />;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.url.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter social media URL'
            });
            return;
        }

        // URL validation
        if (!validateUrl(formData.url)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid URL'
            });
            return;
        }

        // Platform-specific URL validation
        const url = formData.url.toLowerCase();
        const platform = formData.platform;

        if (platform === 'facebook' && !url.includes('facebook.com')) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid Facebook URL'
            });
            return;
        }

        if (platform === 'youtube' && !url.includes('youtube.com')) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid YouTube URL'
            });
            return;
        }

        if (platform === 'twitter' && !url.includes('twitter.com') && !url.includes('x.com')) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid Twitter/X URL'
            });
            return;
        }

        if (platform === 'linkedin' && !url.includes('linkedin.com')) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid LinkedIn URL'
            });
            return;
        }

        if (platform === 'instagram' && !url.includes('instagram.com')) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid Instagram URL'
            });
            return;
        }

        try {
            setLoading(true);

            let response;
            if (editingSocialLink) {
                // Update existing social link
                response = await axiosInstance.put(`/social-links/${editingSocialLink._id}`, formData);
            } else {
                // Create new social link
                response = await axiosInstance.post('/social-links', formData);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: editingSocialLink ? 'Social link updated successfully!' : 'Social link created successfully!'
                });
                
                // Reset form and go back
                setFormData({
                    platform: 'facebook',
                    url: ''
                });
                
                if (onBack) {
                    onBack();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: response.data.message || 'Failed to save social link'
                });
            }
        } catch (error) {
            console.error('Error saving social link:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to save social link'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            platform: 'facebook',
            url: ''
        });
    };

    const platformOptions = [
        { value: 'facebook', label: 'ফেসবুক', icon: FaFacebook },
        { value: 'youtube', label: 'ইউটিউব', icon: FaYoutube },
        { value: 'twitter', label: 'টুইটার', icon: FaTwitter },
        { value: 'linkedin', label: 'লিংকডিন', icon: FaLinkedin },
        { value: 'instagram', label: 'ইনস্টাগ্রাম', icon: FaInstagram }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 sm:p-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">
                            {editingSocialLink ? 'এডিট সোশ্যাল লিংক' : 'নতুন সোশ্যাল লিংক'}
                        </h1>
                        <p className="text-gray-600 text-sm">
                            {editingSocialLink ? 'সোশ্যাল লিংক আপডেট করুন' : 'নতুন সোশ্যাল লিংক তৈরি করুন'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Platform Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    সোশ্যাল মিডিয়া প্ল্যাটফর্ম *
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {platformOptions.map((platform) => (
                                        <label
                                            key={platform.value}
                                            className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                formData.platform === platform.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="platform"
                                                value={platform.value}
                                                checked={formData.platform === platform.value}
                                                onChange={handleInputChange}
                                                className="absolute opacity-0"
                                            />
                                            <platform.icon className={`text-2xl ${
                                                formData.platform === platform.value
                                                    ? platform.value === 'facebook' ? 'text-blue-600' :
                                                      platform.value === 'youtube' ? 'text-red-600' :
                                                      platform.value === 'twitter' ? 'text-blue-400' :
                                                      platform.value === 'linkedin' ? 'text-blue-700' :
                                                      'text-pink-600'
                                                    : 'text-gray-400'
                                            }`} />
                                            <span className="text-xs font-medium mt-2 text-center">
                                                {platform.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* URL Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    লিংক URL *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {getPlatformIcon(formData.platform)}
                                    </div>
                                    <input
                                        type="url"
                                        name="url"
                                        value={formData.url}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder={getPlatformPlaceholder(formData.platform)}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.platform === 'twitter' 
                                        ? 'Twitter/X URL (https://twitter.com/... or https://x.com/...)'
                                        : `Valid ${formData.platform} URL required`
                                    }
                                </p>
                            </div>

                            {/* Preview */}
                            {formData.url && validateUrl(formData.url) && (
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                                    <div className="flex items-center gap-2">
                                        {getPlatformIcon(formData.platform)}
                                        <a 
                                            href={formData.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-800 break-all"
                                        >
                                            {formData.url}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                                >
                                    <FaSave className="text-sm" />
                                    {loading 
                                        ? (editingSocialLink ? 'Updating...' : 'Creating...') 
                                        : (editingSocialLink ? 'Update Link' : 'Create Link')
                                    }
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={loading}
                                    className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium text-sm"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={loading}
                                    className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewSocialLink;