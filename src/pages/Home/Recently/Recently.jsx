import React from 'react';
import { useNavigate } from 'react-router';
import axiosInstance from '../../../hooks/axiosInstance/axiosInstance';

const Recently = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = React.useState(true);
    const [recentItems, setRecentItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('recentlyClosed', 'true');
    };

    const handleMarqueeClick = () => {
        if (recentItems.length > 0) {
            const firstItemId = recentItems[0]._id;
            
            // Option 1: Route parameter হিসেবে
            navigate(`/announcement/${firstItemId}`);
            
            // Option 2: Query parameter হিসেবে
            // navigate(`/announcement?id=${firstItemId}`);
            
            // Option 3: State হিসেবে
            // navigate('/announcement', { state: { announcementId: firstItemId } });
            
            console.log('Navigating with ID:', firstItemId);
        }
    };

    // Fetch recent items from API
    React.useEffect(() => {
        const fetchRecentItems = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/recently');
                if (response.data.success) {
                    const activeItems = response.data.data.filter(item => item.isActive);
                    setRecentItems(activeItems);
                }
            } catch (error) {
                console.error('Failed to fetch recent items:', error);
                setRecentItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentItems();
    }, []);

    // Check if recently was closed
    React.useEffect(() => {
        const wasClosed = localStorage.getItem('recentlyClosed');
        if (wasClosed === 'true') {
            setIsVisible(false);
        }
    }, []);

    // Show nothing if not visible or no items
    if (!isVisible || recentItems.length === 0) {
        return null;
    }

    // Create marquee text from titles
    const marqueeText = recentItems
        .map(item => item.title)
        .join(' 🟊 '); 

    return (
        <div className="w-full bg-[#F1FCFF] text-white h-10 sm:h-12 md:h-14 flex items-center justify-between relative overflow-hidden">
            {/* Left Side - সাম্প্রতিক Text with Triangle */}
            <div className="relative flex items-center px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 bg-[#016496] text-white text-lg font-semibold shadow-[0_5px_15px_rgba(0,0,0,0.3)] sm:shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] sm:hover:shadow-[0_14px_40px_rgba(0,0,0,0.55)] min-w-[80px] sm:min-w-[100px] md:min-w-[120px]">
                <span className="whitespace-nowrap">সাম্প্রতিক</span>
                
                <span
                    aria-hidden="true"
                    className="absolute right-[-12px] sm:right-[-15px] md:right-[-18px] top-1/2 -translate-y-1/2 w-0 h-0
                               border-t-[20px] border-b-[20px] border-l-[12px] sm:border-t-[24px] sm:border-b-[24px] sm:border-l-[15px] md:border-t-[28px] md:border-b-[28px] md:border-l-[18px]
                               border-t-transparent border-b-transparent border-l-[#016496]"
                />
            </div>

            {/* Middle - Marquee Text */}
            <div 
                className="flex-1 mx-1 sm:mx-2 md:mx-2 overflow-hidden cursor-pointer"
                onClick={handleMarqueeClick}
            >
                {loading ? (
                    <div className="flex justify-center items-center">
                        <span className="text-sm sm:text-base md:text-base font-medium text-black">
                            Loading...
                        </span>
                    </div>
                ) : (
                    <div className="animate-marquee whitespace-nowrap">
                        <span className="text-sm sm:text-base md:text-base font-medium text-black hover:text-black transition-colors duration-200 px-1">
                             {marqueeText} 
                        </span>
                    </div>
                )}
            </div>

            {/* Right Side - Close Button */}
            <button
                onClick={handleClose}
                className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center bg-[#016496] cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-1 hover:bg-[#016496]"
                aria-label="Close announcement"
            >
                <svg 
                    className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="3" 
                        d="M6 18L18 6M6 6l12 12" 
                    />
                </svg>
            </button>

            {/* Custom CSS for marquee animation */}
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                
                @media (max-width: 640px) {
                    .animate-marquee {
                        animation: marquee 20s linear infinite;
                    }
                }
                
                @media (max-width: 480px) {
                    .animate-marquee {
                        animation: marquee 18s linear infinite;
                    }
                }
                
                @media (max-width: 380px) {
                    .animate-marquee {
                        animation: marquee 15s linear infinite;
                    }
                }
            `}</style>
        </div>
    );
};

export default Recently;