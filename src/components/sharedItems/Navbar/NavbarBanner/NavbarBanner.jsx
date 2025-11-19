import { useEffect, useState } from 'react';
import axiosInstance, { baseImageURL } from '../../../../hooks/axiosInstance/axiosInstance';


const NavbarBanner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // Fetch banners from backend
    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/banners');
            
            if (response.data.success) {
                // Only get active banners
                const activeBanners = response.data.data.filter(banner => banner.isActive);
                setBanners(activeBanners);
            }
        } catch (err) {
            console.error('Error fetching banners:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-rotate banners if multiple active banners
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // Change banner every 5 seconds

        return () => clearInterval(interval);
    }, [banners]);

    if (loading) {
        return (
            <div className="w-full bg-gray-200 h-16 sm:h-20 md:h-24 lg:h-28 flex items-center justify-center">
                <div className="animate-pulse bg-gray-300 h-full w-full"></div>
            </div>
        );
    }

    if (banners.length === 0) {
        return null; // Don't show anything if no active banners
    }

    const currentBanner = banners[currentBannerIndex];
    console.log(currentBanner);
    const bannerUrl = `${baseImageURL}${currentBanner?.image}`;

    return (
        <div className="w-full overflow-hidden">
            {/* Banner Container */}
            <div className="relative w-full h-16 sm:h-20 md:h-24 lg:h-52 xl:h-52">
                {/* Banner Images with transition */}
                {banners.map((banner, index) => {
                    return (
                        <div
                            key={banner._id}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                                index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <img 
                                src={bannerUrl} 
                                alt={banner.title || "Banner"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/1200x200?text=Banner+Image';
                                }}
                            />
                        </div>
                    );
                })}

                {/* Banner Indicator Dots - Only show if multiple banners */}
                {banners.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentBannerIndex(index)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                    index === currentBannerIndex 
                                        ? 'bg-white scale-125' 
                                        : 'bg-white/50 hover:bg-white/70'
                                }`}
                                aria-label={`Go to banner ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NavbarBanner;