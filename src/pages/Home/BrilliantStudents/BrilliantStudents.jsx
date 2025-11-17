import { useEffect, useRef, useState } from 'react';
import Loader from '../../../components/sharedItems/Loader/Loader';
import axiosInstance from '../../../hooks/axiosInstance/axiosInstance';

const BrilliantStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        fetchStudents();
    }, []);

    // Auto scroll functionality
    useEffect(() => {
        if (!scrollContainerRef.current || isDragging) return;

        const container = scrollContainerRef.current;
        let scrollAmount = 0;
        
        const autoScroll = setInterval(() => {
            if (container) {
                scrollAmount += 1;
                container.scrollLeft = scrollAmount;
                
                // Reset to start when reaching end
                if (scrollAmount >= container.scrollWidth - container.clientWidth) {
                    scrollAmount = 0;
                }
            }
        }, 30); // Smooth scroll speed

        return () => clearInterval(autoScroll);
    }, [isDragging, students.length]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            
            const response = await axiosInstance.get('/students');

            if (response.data.success) {
                const allStudents = response.data.data || [];
                
                // Filter students with roll 1 or 2 and active status
                const brilliantStudents = allStudents.filter(
                    student => (student.roll === 1 || student.roll === 2) && student.status === 'active'
                );
                
                // Sort by class and then by roll
                brilliantStudents.sort((a, b) => {
                    if (a.class !== b.class) {
                        return a.class.localeCompare(b.class);
                    }
                    return a.roll - b.roll;
                });
                
                setStudents(brilliantStudents);
            } else {
                setError('Failed to load data');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Failed to load brilliant students');
        } finally {
            setLoading(false);
        }
    };

    // Duplicate students for infinite scroll effect
    const infiniteStudents = [...students, ...students];

    // Mouse drag handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    // Touch handlers for mobile
    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const getRankBadge = (roll) => {
        if (roll === 1) return { emoji: '🥇', text: '1st', color: 'bg-yellow-500' };
        if (roll === 2) return { emoji: '🥈', text: '2nd', color: 'bg-gray-400' };
        return { emoji: '🏆', text: 'Top', color: 'bg-orange-500' };
    };

    const imageu = axiosInstance.defaults.baseURL;

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button
                            onClick={fetchStudents}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="text-6xl mb-4">🎓</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Brilliant Students Found</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white bg-[#016496] py-2 rounded-md mb-4">
                        মেধাবী শিক্ষার্থী
                    </h1>
                    <div className="w-32 h-1 bg-black mx-auto"></div>
                </div>

                {/* Scrollable Cards Container */}
                <div 
                    ref={scrollContainerRef}
                    className="overflow-hidden cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    style={{ 
                        scrollBehavior: isDragging ? 'auto' : 'smooth',
                        userSelect: 'none'
                    }}
                >
                    <div className="flex gap-4 sm:gap-6" style={{ width: 'max-content' }}>
                        {infiniteStudents.map((student, index) => {
                            const rankBadge = getRankBadge(student.roll);
                            
                            return (
                                <div
                                    key={`${student._id}-${index}`}
                                    className="shrink-0 w-52 sm:w-64 bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                                    style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                                >
                                    {/* Image Section */}
                                    <div className="relative h-52 sm:h-64 bg-linear-to-br from-blue-50 to-indigo-100">
                                        {student.photo ? (
                                            <img
                                                src={`${imageu}${student.photo}`}
                                                alt={student.name}
                                                className="w-full h-full object-cover"
                                                draggable="false"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="text-6xl sm:text-8xl text-gray-300">
                                                    🎓
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Rank Badge */}
                                        <div className="absolute top-2 left-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${rankBadge.color} text-white shadow-lg`}>
                                                {rankBadge.emoji} {rankBadge.text}
                                            </span>
                                        </div>

                                        {/* Class Badge */}
                                        <div className="absolute top-2 right-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-500 text-white shadow-lg">
                                                {student.class}
                                            </span>
                                        </div>

                                        {/* Roll Badge */}
                                        <div className="absolute bottom-2 right-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                                                Roll: {student.roll}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-4 text-center">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                                            {student.name}
                                        </h3>
                                        
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            {student.class} - Section {student.section}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                /* No custom styles needed */
            `}</style>
        </div>
    );
};

export default BrilliantStudents;