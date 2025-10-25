import React, { useState, useEffect } from 'react';
import axiosInstance, { baseImageURL } from '../../../hooks/axiosInstance/axiosInstance';

const AllTeachersAndWorkers = () => {
    const [teachers, setTeachers] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    // Fetch teachers and workers data
    useEffect(() => {
        fetchAllData();
    }, []);

    // Auto slide functionality
    useEffect(() => {
        if (!autoPlay || (teachers.length === 0 && workers.length === 0)) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => {
                const totalItems = teachers.length + workers.length;
                return prev === totalItems - 1 ? 0 : prev + 1;
            });
        }, 3000); // Change slide every 3 seconds

        return () => clearInterval(interval);
    }, [autoPlay, teachers.length, workers.length]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            // Fetch teachers and workers simultaneously
            const [teachersResponse, workersResponse] = await Promise.all([
                axiosInstance.get('/teacher-list'),
                axiosInstance.get('/workers-list')
            ]);

            if (teachersResponse.data.success && workersResponse.data.success) {
                setTeachers(teachersResponse.data.data || []);
                setWorkers(workersResponse.data.data || []);
            } else {
                setError('Failed to load data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load teachers and workers list');
        } finally {
            setLoading(false);
        }
    };

    // Combine teachers and workers for the slider
    const allStaff = [...teachers, ...workers];

    // Navigate to specific slide
    const goToSlide = (index) => {
        setCurrentSlide(index);
        setAutoPlay(false);
        setTimeout(() => setAutoPlay(true), 5000); // Resume auto play after 5 seconds
    };

    // Navigate to next/previous slide
    const nextSlide = () => {
        setCurrentSlide(prev => prev === allStaff.length - 1 ? 0 : prev + 1);
        setAutoPlay(false);
        setTimeout(() => setAutoPlay(true), 5000);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => prev === 0 ? allStaff.length - 1 : prev - 1);
        setAutoPlay(false);
        setTimeout(() => setAutoPlay(true), 5000);
    };

    // Get staff type and color
    const getStaffType = (staff) => {
        if (teachers.some(teacher => teacher._id === staff._id)) {
            return { type: 'Teacher', color: 'blue', badge: '👨‍🏫' };
        } else {
            return { type: 'Staff', color: 'green', badge: '👷' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading our team...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Team</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button
                            onClick={fetchAllData}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (allStaff.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Team Members Found</h3>
                        <p className="text-gray-600">
                            No teachers or staff members are currently available.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
                        Meet Our Team
                    </h1>
                    <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Dedicated educators and support staff working together to create an exceptional learning environment
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{teachers.length}</div>
                        <div className="text-gray-600 font-medium">Teachers</div>
                        <div className="text-sm text-gray-500 mt-1">Qualified Educators</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl font-bold text-green-600 mb-2">{workers.length}</div>
                        <div className="text-gray-600 font-medium">Support Staff</div>
                        <div className="text-sm text-gray-500 mt-1">Dedicated Workers</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl font-bold text-purple-600 mb-2">{allStaff.length}</div>
                        <div className="text-gray-600 font-medium">Total Team</div>
                        <div className="text-sm text-gray-500 mt-1">All Members</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                            {allStaff.filter(staff => staff.isActive !== false).length}
                        </div>
                        <div className="text-gray-600 font-medium">Active</div>
                        <div className="text-sm text-gray-500 mt-1">Currently Serving</div>
                    </div>
                </div>

                {/* Main Slider Container */}
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-white">
                    
                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Slider Content */}
                    <div className="relative h-96 sm:h-[500px] lg:h-[600px] overflow-hidden">
                        {allStaff.map((staff, index) => {
                            const staffType = getStaffType(staff);
                            const isActive = index === currentSlide;
                            
                            return (
                                <div
                                    key={staff._id}
                                    className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                                        isActive 
                                            ? 'opacity-100 translate-x-0' 
                                            : 'opacity-0 translate-x-full'
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row h-full">
                                        
                                        {/* Image Section */}
                                        <div className="lg:w-2/5 h-1/2 lg:h-full relative bg-gradient-to-br from-gray-50 to-gray-100">
                                            {staff.photo ? (
                                                <img
                                                    src={`${baseImageURL}${staff.photo}`}
                                                    alt={staff.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="text-8xl text-gray-300">
                                                        {staffType.badge}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Badge */}
                                            <div className="absolute top-4 left-4">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-${staffType.color}-500 text-white shadow-lg`}>
                                                    {staffType.badge} {staffType.type}
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                                                staff.isActive !== false 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {staff.isActive !== false ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="lg:w-3/5 h-1/2 lg:h-full p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50">
                                            <div className="max-w-2xl">
                                                {/* Name and Designation */}
                                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                                                    {staff.name}
                                                </h2>
                                                
                                                <p className="text-xl sm:text-2xl text-gray-600 mb-2">
                                                    {staff.designation}
                                                </p>

                                                {/* Department/Subject */}
                                                {staff.department && (
                                                    <p className="text-lg text-gray-500 mb-6">
                                                        {staff.department}
                                                    </p>
                                                )}

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                                    {staff.qualification && (
                                                        <div className="flex items-center">
                                                            <span className="text-blue-500 mr-3">🎓</span>
                                                            <div>
                                                                <div className="text-sm text-gray-500">Qualification</div>
                                                                <div className="font-medium text-gray-800">{staff.qualification}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {staff.experience && (
                                                        <div className="flex items-center">
                                                            <span className="text-green-500 mr-3">⏳</span>
                                                            <div>
                                                                <div className="text-sm text-gray-500">Experience</div>
                                                                <div className="font-medium text-gray-800">{staff.experience} years</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {staff.subject && (
                                                        <div className="flex items-center">
                                                            <span className="text-purple-500 mr-3">📚</span>
                                                            <div>
                                                                <div className="text-sm text-gray-500">Subject</div>
                                                                <div className="font-medium text-gray-800">{staff.subject}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {staff.workShift && (
                                                        <div className="flex items-center">
                                                            <span className="text-orange-500 mr-3">🕒</span>
                                                            <div>
                                                                <div className="text-sm text-gray-500">Shift</div>
                                                                <div className="font-medium text-gray-800">{staff.workShift}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Contact Info */}
                                                <div className="border-t border-gray-200 pt-6">
                                                    <div className="flex flex-wrap gap-4">
                                                        {staff.email && (
                                                            <div className="flex items-center text-gray-600">
                                                                <span className="mr-2">📧</span>
                                                                <span className="text-sm">{staff.email}</span>
                                                            </div>
                                                        )}
                                                        {staff.mobile && (
                                                            <div className="flex items-center text-gray-600">
                                                                <span className="mr-2">📱</span>
                                                                <span className="text-sm">{staff.mobile}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Additional Info */}
                                                {(staff.responsibilities || staff.bio) && (
                                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                                        <p className="text-sm text-gray-700">
                                                            {staff.responsibilities || staff.bio}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                        {allStaff.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === currentSlide 
                                        ? 'bg-blue-500 w-8' 
                                        : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Auto Play Toggle */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <button
                            onClick={() => setAutoPlay(!autoPlay)}
                            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                                autoPlay 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {autoPlay ? '⏸️ Auto' : '▶️ Play'}
                        </button>
                    </div>
                </div>

                {/* Quick Stats Footer */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-4xl mb-3">👨‍🏫</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Teaching Faculty</h3>
                        <p className="text-gray-600">
                            {teachers.length} qualified educators providing quality education
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-4xl mb-3">👷</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Support Staff</h3>
                        <p className="text-gray-600">
                            {workers.length} dedicated workers ensuring smooth operations
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-4xl mb-3">🌟</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Excellence</h3>
                        <p className="text-gray-600">
                            Committed to providing the best educational experience
                        </p>
                    </div>
                </div>

                {/* Mobile Navigation (for touch devices) */}
                <div className="lg:hidden mt-8 flex justify-center space-x-4">
                    <button
                        onClick={prevSlide}
                        className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.7s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default AllTeachersAndWorkers;