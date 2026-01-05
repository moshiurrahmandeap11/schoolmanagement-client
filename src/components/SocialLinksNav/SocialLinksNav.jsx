import { useEffect, useState } from 'react';
import { FaEnvelope, FaFacebook, FaGlobe, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaTelegram, FaTiktok, FaTwitter, FaWhatsapp, FaYoutube } from 'react-icons/fa';


import axiosInstance from '../../hooks/axiosInstance/axiosInstance';
import Loader from '../sharedItems/Loader/Loader';

const SocialLinksNav = () => {
    const [socialLinks, setSocialLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Map icon names to actual components
    const iconMap = {
        facebook: FaFacebook,
        twitter: FaTwitter,
        instagram: FaInstagram,
        linkedin: FaLinkedin,
        youtube: FaYoutube,
        website: FaGlobe,
        phone: FaPhone,
        email: FaEnvelope,
        address: FaMapMarkerAlt,
        tiktok: FaTiktok,
        whatsapp: FaWhatsapp,
        telegram: FaTelegram
    };

    // Get icon color based on platform
    const getIconColor = (platform) => {
        const colors = {
            facebook: '#1877F2',
            twitter: '#1DA1F2',
            instagram: '#E4405F',
            linkedin: '#0A66C2',
            youtube: '#FF0000',
            website: '#4A5568',
            phone: '#38A169',
            email: '#DD6B20',
            address: '#805AD5',
            tiktok: '#000000',
            whatsapp: '#25D366',
            telegram: '#0088CC'
        };
        return colors[platform] || '#4A5568';
    };

    // Format label for display
    const formatLabel = (label) => {
        return label.charAt(0).toUpperCase() + label.slice(1);
    };

    // Handle link click
    const handleLinkClick = (platform, url) => {
        let finalUrl = url;
        
        // Format URLs properly
        if (platform === 'phone') {
            finalUrl = `tel:${url.replace(/\D/g, '')}`;
        } else if (platform === 'email') {
            finalUrl = `mailto:${url}`;
        } else if (platform === 'whatsapp') {
            finalUrl = `https://wa.me/${url.replace(/\D/g, '')}`;
        } else if (!url.startsWith('http')) {
            finalUrl = `https://${url}`;
        }
        
        window.open(finalUrl, '_blank');
    };

    // Fetch social links
    const fetchSocialLinks = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/social-links");
            
            if (response.data.success) {
                // Filter out links without URLs and sort by order or platform
                const filteredLinks = response.data.data
                    .filter(link => link.url && link.url.trim() !== '')
                    .sort((a, b) => {
                        // You can add custom sorting logic here
                        const order = ['phone', 'email', 'address', 'website', 'facebook', 'instagram', 'youtube', 'whatsapp'];
                        return order.indexOf(a.platform) - order.indexOf(b.platform);
                    });
                
                setSocialLinks(filteredLinks);
            } else {
                setError('Failed to load social links');
            }
        } catch (err) {
            console.error('Error fetching social links:', err);
            setError('Failed to load social links');
            // Default links for fallback
            setSocialLinks([
                { platform: 'phone', url: '+8801234567890', label: 'Phone' },
                { platform: 'email', url: 'contact@example.com', label: 'Email' },
                { platform: 'facebook', url: 'https://facebook.com', label: 'Facebook' },
                { platform: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSocialLinks();
    }, []);

    if (loading) {
        return (
            <div className="py-4">
                <Loader />
            </div>
        );
    }

    if (error && socialLinks.length === 0) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">আমাদের সোশ্যাল সাইটসমূহ</h2>
                </div>

                {/* Social Links Grid */}
                {socialLinks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {socialLinks.map((link, index) => {
                            const IconComponent = iconMap[link.platform] || FaGlobe;
                            const iconColor = getIconColor(link.platform);
                            const displayLabel = link.label || formatLabel(link.platform);
                            
                            return (
                                <div 
                                    key={index}
                                    onClick={() => handleLinkClick(link.platform, link.url)}
                                    className="group cursor-pointer"
                                >
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-all duration-300 hover:border-gray-300 hover:transform hover:-translate-y-1">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            {/* Icon Container */}
                                            <div 
                                                className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-opacity-10"
                                                style={{ 
                                                    backgroundColor: `${iconColor}15`,
                                                    border: `1px solid ${iconColor}30`
                                                }}
                                            >
                                                <IconComponent 
                                                    className="text-xl"
                                                    style={{ color: iconColor }}
                                                />
                                            </div>

                                            {/* Platform Name */}
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                                                    {displayLabel}
                                                </p>
                                            </div>

                                            {/* URL Preview (for phone/email) */}
                                            {(link.platform === 'phone' || link.platform === 'email' || link.platform === 'address') && (
                                                <p className="text-xs text-gray-600 truncate w-full">
                                                    {link.url.length > 20 ? `${link.url.substring(0, 20)}...` : link.url}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-5xl text-gray-300 mb-4">🔗</div>
                        <p className="text-gray-500">কোনো সোশ্যাল লিঙ্ক যোগ করা হয়নি</p>
                        <p className="text-sm text-gray-400 mt-1">অ্যাডমিন প্যানেল থেকে সোশ্যাল লিঙ্ক যোগ করুন</p>
                    </div>
                )}

                {/* Mobile View - Horizontal Scroll */}
                <div className="md:hidden mt-6">
                    <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                        {socialLinks.slice(0, 6).map((link, index) => {
                            const IconComponent = iconMap[link.platform] || FaGlobe;
                            const iconColor = getIconColor(link.platform);
                            
                            return (
                                <div 
                                    key={index}
                                    onClick={() => handleLinkClick(link.platform, link.url)}
                                    className="flex-shrink-0 cursor-pointer"
                                >
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center space-x-3">
                                            <div 
                                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                                style={{ 
                                                    backgroundColor: `${iconColor}15`,
                                                    border: `1px solid ${iconColor}30`
                                                }}
                                            >
                                                <IconComponent 
                                                    className="text-lg"
                                                    style={{ color: iconColor }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {link.label || formatLabel(link.platform)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions Bar */}
                {socialLinks.filter(link => ['phone', 'email', 'whatsapp'].includes(link.platform)).length > 0 && (
                    <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">দ্রুত যোগাযোগ</h4>
                        <div className="flex flex-wrap gap-3">
                            {socialLinks
                                .filter(link => ['phone', 'email', 'whatsapp'].includes(link.platform))
                                .map((link, index) => {
                                    const IconComponent = iconMap[link.platform] || FaGlobe;
                                    const iconColor = getIconColor(link.platform);
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleLinkClick(link.platform, link.url)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                                        >
                                            <IconComponent style={{ color: iconColor }} />
                                            <span className="text-sm font-medium text-gray-700">
                                                {link.platform === 'phone' ? 'কল করুন' : 
                                                 link.platform === 'email' ? 'ইমেইল করুন' : 
                                                 'হোয়াটসঅ্যাপ'}
                                            </span>
                                        </button>
                                    );
                                })
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialLinksNav;