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
            setError('');
            
            const response = await axiosInstance.get('/students');

            console.log('Full API Response:', response); // Debugging line
            console.log('API Data:', response.data); // Debugging line
            
            if (response.data && response.data.success) {
                const allStudents = response.data.data || [];
                
                console.log('All Students:', allStudents); // Debugging line
                console.log('Number of students:', allStudents.length); // Debugging line
                
                // Filter students with classRoll 1 or 2 and active status
                const brilliantStudents = allStudents.filter(
                    student => {
                        const roll = student.classRoll;
                        console.log(`Student: ${student.name}, Roll: ${roll}, Type: ${typeof roll}, Status: ${student.status}`); // Debugging line
                        return (roll === 1 || roll === 2) && student.status === 'active';
                    }
                );
                
                console.log('Filtered Brilliant Students:', brilliantStudents); // Debugging line
                console.log('Number of brilliant students:', brilliantStudents.length); // Debugging line
                
                // Sort by class and then by roll
                brilliantStudents.sort((a, b) => {
                    const classA = a.class?.name || a.class || '';
                    const classB = b.class?.name || b.class || '';
                    
                    if (classA !== classB) {
                        return classA.localeCompare(classB);
                    }
                    return a.classRoll - b.classRoll;
                });
                
                setStudents(brilliantStudents);
                
                // If no brilliant students found, show appropriate message
                if (brilliantStudents.length === 0) {
                    setError('No students with roll 1 or 2 found in active status.');
                }
            } else {
                const errorMsg = response.data?.message || 'Failed to load data from server';
                setError(errorMsg);
                console.error('API response not successful:', response.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            console.error('Error details:', error.response?.data || error.message);
            setError('Failed to load brilliant students. Please check your connection and try again.');
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
        if (roll === 1) return { emoji: '🥇', text: '1st', color: 'bg-[#1e90c9]' };
        if (roll === 2) return { emoji: '🥈', text: '2nd', color: 'bg-[#1e90c9]' };
        return { emoji: '🏆', text: 'Top', color: 'bg-[#1e90c9]' };
    };

    const imageu = axiosInstance.defaults.baseURL;

    if (loading) {
        return <Loader />;
    }

    if (error && students.length === 0) {
        return (
            <div className="bg-linear-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="bg-linear-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="text-6xl mb-4">🎓</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Brilliant Students Found</h3>
                        <p className="text-gray-600 mb-4">No students with roll 1 or 2 found in active status.</p>
                        <button
                            onClick={fetchStudents}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                            Refresh
                        </button>
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
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        মেধাবী শিক্ষার্থীবৃন্দ
                    </h1>
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
                            const roll = student.classRoll;
                            const rankBadge = getRankBadge(roll);
                            const className = student.class?.name || student.class || 'N/A';
                            
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
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center ${student.photo ? 'hidden' : ''}`}>
                                            <div className="text-6xl sm:text-8xl text-gray-300">
                                                🎓
                                            </div>
                                        </div>
                                        
                                        {/* Rank Badge */}
                                        <div className="absolute top-2 left-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${rankBadge.color} text-white shadow-lg`}>
                                                {rankBadge.emoji} {rankBadge.text}
                                            </span>
                                        </div>

                                        {/* Class Badge */}
                                        <div className="absolute top-2 right-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-[#1e90c9] text-white shadow-lg">
                                                {className}
                                            </span>
                                        </div>

                                        {/* Roll Badge */}
                                        <div className="absolute bottom-2 right-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                                                Roll: {roll}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-4 text-center">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                                            {student.name}
                                        </h3>
                                        
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            {className} - Section {student.section || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            ID: {student.studentId}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrilliantStudents;