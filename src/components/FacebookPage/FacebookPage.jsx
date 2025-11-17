import { useEffect, useState } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import axiosInstance from '../../hooks/axiosInstance/axiosInstance';


const FacebookPage = () => {
    const [facebookLink, setFacebookLink] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFacebookLink();
    }, []);

    const fetchFacebookLink = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/facebook-page');
            
            if (response.data.success && response.data.data?.link) {
                setFacebookLink(response.data.data.link);
            }
        } catch (error) {
            console.error('Error fetching Facebook link:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFacebook = () => {
        if (facebookLink) {
            window.open(facebookLink, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <h2 className="text-xl sm:text-xl my-2 mx-2 px-4 sm:px-5 bg-[#016496] py-3 font-bold text-white leading-tight flex items-center gap-2 sm:gap-3 rounded">
                <GiHamburgerMenu className="text-white text-xl sm:text-xl flex-shrink-0" />
                ফেইসবুক পেইজ
            </h2>
            
            {/* Content */}
            <div className="p-4 sm:p-6">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : facebookLink ? (
                    <div className="text-center">
                        {/* Facebook Icon */}
                        <div className="mb-4">
                            <svg className="w-12 h-12 text-blue-600 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </div>
                        
                        {/* Facebook Link Button */}
                        <button
                            onClick={handleOpenFacebook}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            আমাদের ফেইসবুক পেইজ ভিজিট করুন
                        </button>
                        
                        <p className="text-gray-500 text-sm mt-3">
                            Facebook এ আমাদের সাথে যুক্ত থাকুন
                        </p>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-6">
                        <div className="text-gray-400 mb-3">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">Facebook page added soon</p>
                        <p className="text-gray-400 text-xs mt-1">ফেইসবুক পেইজ শীঘ্রই যুক্ত করা হবে</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacebookPage;