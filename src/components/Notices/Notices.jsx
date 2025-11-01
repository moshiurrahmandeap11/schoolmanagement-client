import React, { useState, useEffect } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { useNavigate } from 'react-router';
import axiosInstance from '../../hooks/axiosInstance/axiosInstance';

const Notices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/notices');
            
            if (response.data.success) {
                // Published notices only, sorted by creation date (newest first), take latest 5
                const activeNotices = response.data.data
                    .filter(notice => notice.isPublished) // Only published notices
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
                    .slice(0, 5); // Take only 5 latest
                setNotices(activeNotices);
            }
        } catch (error) {
            console.error('Error fetching notices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNoticeClick = (id) => {
        navigate(`/notice-details/${id}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <h2 className="text-xl sm:text-xl px-4 sm:px-5 bg-[#051939] py-3 font-bold text-white leading-tight flex items-center gap-2 sm:gap-3 rounded">
                <GiHamburgerMenu className="text-white text-lg sm:text-xl flex-shrink-0" />
                নোটিশ
            </h2>
            
            {/* Notices List */}
            <div className="p-4">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : notices.length > 0 ? (
                    <div className="space-y-2">
                        {notices.map((notice) => (
                            <div 
                                key={notice._id}
                                onClick={() => handleNoticeClick(notice._id)}
                                className="p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-150 group"
                            >
                                <p className="text-gray-700 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors duration-150">
                                    {notice.title}
                                </p>
                                {/* Optional: Show date */}
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notice.createdAt).toLocaleDateString('bn-BD')}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                        Notice will arrive here<br/>
                        <span className="text-xs">নোটিশ এখানে আসবে</span>
                    </div>
                )}
            </div>

            {/* View All Button (Optional) */}
            {notices.length > 0 && (
                <div className="px-4 pb-4">
                    <button 
                        onClick={() => navigate('/all-notices')}
                        className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150 border border-blue-200"
                    >
                        সব নোটিশ দেখুন
                    </button>
                </div>
            )}
        </div>
    );
};

export default Notices;