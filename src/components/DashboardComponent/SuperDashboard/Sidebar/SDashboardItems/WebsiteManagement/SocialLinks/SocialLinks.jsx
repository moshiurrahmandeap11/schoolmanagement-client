import { useEffect, useState } from 'react';
import { FaEdit, FaFacebook, FaInstagram, FaLink, FaLinkedin, FaPlus, FaTrash, FaTwitter, FaYoutube } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import AddNewSocialLink from './AddNewSocialLink/AddNewSocialLink';


const SocialLinks = () => {
    const [socialLinks, setSocialLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingSocialLink, setEditingSocialLink] = useState(null);

    // Fetch social links
    useEffect(() => {
        fetchSocialLinks();
    }, []);

    const fetchSocialLinks = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/social-links');
            
            if (response.data.success) {
                setSocialLinks(response.data.data);
            } else {
                showSweetAlert('error', response.data.message || 'Failed to load social links');
            }
        } catch (error) {
            console.error('Error fetching social links:', error);
            showSweetAlert('error', 'Failed to load social links: ' + error.message);
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

    const handleAddNew = () => {
        setEditingSocialLink(null);
        setActiveTab('new');
    };

    const handleEdit = (socialLink) => {
        setEditingSocialLink(socialLink);
        setActiveTab('new');
    };

    const handleDelete = async (socialLinkId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/social-links/${socialLinkId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'Social link deleted successfully!');
                    fetchSocialLinks();
                } else {
                    showSweetAlert('error', response.data.message || 'Failed to delete social link');
                }
            } catch (error) {
                console.error('Error deleting social link:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete social link';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingSocialLink(null);
        fetchSocialLinks();
    };

    // Get platform icon
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

    // Get platform name in Bengali
    const getPlatformName = (platform) => {
        switch (platform) {
            case 'facebook':
                return 'ফেসবুক';
            case 'youtube':
                return 'ইউটিউব';
            case 'twitter':
                return 'টুইটার';
            case 'linkedin':
                return 'লিংকডিন';
            case 'instagram':
                return 'ইনস্টাগ্রাম';
            default:
                return platform;
        }
    };

    // Truncate URL for display
    const truncateUrl = (url, length = 30) => {
        if (!url) return 'N/A';
        return url.length > length ? url.substring(0, length) + '...' : url;
    };

    // If activeTab is 'new', show AddNewSocialLink component
    if (activeTab === 'new') {
        return (
            <AddNewSocialLink 
                editingSocialLink={editingSocialLink}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            সামাজিক লিংক ব্যবস্থাপনা
                        </h1>
                        <p className="text-gray-600">
                            আপনার প্রতিষ্ঠানের সামাজিক মিডিয়া লিংক নিয়ন্ত্রণ করুন
                        </p>
                    </div>

                    {/* Add New Button */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleAddNew}
                            className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 text-sm"
                        >
                            <FaPlus className="text-sm" />
                            New Social Link
                        </button>
                    </div>

                    {/* Social Links List */}
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-gray-600 mt-2 text-sm">Loading social links...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && socialLinks.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">🔗</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Social Links Found</h3>
                                <p className="text-gray-600 mb-4 text-sm">Get started by adding your first social media link.</p>
                                <button
                                    onClick={handleAddNew}
                                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                    Add Social Link
                                </button>
                            </div>
                        )}

                        {/* Social Links Table */}
                        {!loading && socialLinks.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">প্ল্যাটফর্ম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">লিংক</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">এডিট / ডিলিট</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {socialLinks.map((link) => (
                                            <tr key={link._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0">
                                                            {getPlatformIcon(link.platform)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">
                                                                {getPlatformName(link.platform)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 capitalize">{link.platform}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <FaLink className="text-gray-400 text-sm" />
                                                        <a 
                                                            href={link.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:text-blue-800 break-all"
                                                            title={link.url}
                                                        >
                                                            {truncateUrl(link.url)}
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(link)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(link._id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaTrash className="text-xs" />
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
                    </div>

                    {/* Summary */}
                    {socialLinks.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            <div className="flex flex-wrap gap-4">
                                <span>Total Links: {socialLinks.length}</span>
                                <span>Facebook: {socialLinks.filter(l => l.platform === 'facebook').length}</span>
                                <span>YouTube: {socialLinks.filter(l => l.platform === 'youtube').length}</span>
                                <span>Twitter: {socialLinks.filter(l => l.platform === 'twitter').length}</span>
                                <span>LinkedIn: {socialLinks.filter(l => l.platform === 'linkedin').length}</span>
                                <span>Instagram: {socialLinks.filter(l => l.platform === 'instagram').length}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialLinks;