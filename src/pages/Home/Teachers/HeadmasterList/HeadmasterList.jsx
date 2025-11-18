import { useEffect, useState } from 'react';
import axiosInstance, { baseImageURL } from '../../../../hooks/axiosInstance/axiosInstance';

const HeadmasterList = () => {
    const [headmasters, setHeadmasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('');

    useEffect(() => {
        fetchHeadmasters();
    }, []);

    const fetchHeadmasters = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/headmasters-list');
            
            if (response.data.success) {
                setHeadmasters(response.data.data);
            } else {
                setError('Failed to load headmasters');
            }
        } catch (error) {
            console.error('Error fetching headmasters:', error);
            setError('Failed to load headmasters list');
        } finally {
            setLoading(false);
        }
    };

    // Filter headmasters based on search and filters
    const filteredHeadmasters = headmasters.filter(headmaster => {
        const matchesSearch = headmaster.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            headmaster.qualification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            headmaster.period?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesPeriod = !filterPeriod || headmaster.period === filterPeriod;
        
        return matchesSearch && matchesPeriod;
    });

    // Get unique periods for filters
    const periods = [...new Set(headmasters.map(headmaster => headmaster.period).filter(Boolean))];
    
    // Sort headmasters by tenure period (assuming period format like "2010-2015")
    const sortedHeadmasters = [...filteredHeadmasters].sort((a, b) => {
        const yearA = a.period ? parseInt(a.period.split('-')[0]) : 0;
        const yearB = b.period ? parseInt(b.period.split('-')[0]) : 0;
        return yearB - yearA; // Most recent first
    });

    // Get current headmaster (assuming there's an isCurrent field or we determine by latest period)
    const currentHeadmaster = headmasters.find(h => h.isCurrent) || 
                             headmasters.sort((a, b) => {
                                 const yearA = a.period ? parseInt(a.period.split('-')[1] || a.period.split('-')[0]) : 0;
                                 const yearB = b.period ? parseInt(b.period.split('-')[1] || b.period.split('-')[0]) : 0;
                                 return yearB - yearA;
                             })[0];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading headmasters...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Headmasters</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button
                            onClick={fetchHeadmasters}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        প্রধান শিক্ষকগণের তালিকা
                    </h1>
                </div>

                {/* Current Headmaster Highlight */}
                {currentHeadmaster && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl shadow-lg border border-blue-200 p-6 sm:p-8 mb-8">
                        <div className="text-center mb-4">
                            <span className="inline-block px-4 py-2 bg-[#1e90c9] text-white text-sm font-medium rounded-full mb-2">
                                Current Headmaster
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                                Leading Our Institution Forward
                            </h2>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                            {/* Photo */}
                            <div className="shrink-0">
                                {currentHeadmaster.photo ? (
                                    <img
                                        src={`${baseImageURL}${currentHeadmaster.photo}`}
                                        alt={currentHeadmaster.name}
                                        className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-white"
                                    />
                                ) : (
                                    <div className="w-48 h-48 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                                        <span className="text-white text-6xl">👨‍🏫</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center lg:text-left">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    {currentHeadmaster.name}
                                </h3>
                                <p className="text-blue-600 text-lg font-medium mb-3">
                                    {currentHeadmaster.qualification}
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    {currentHeadmaster.period && (
                                        <div className="bg-white rounded-lg p-3 shadow-sm">
                                            <div className="text-sm text-gray-600">Tenure Period</div>
                                            <div className="font-semibold text-gray-800">{currentHeadmaster.period}</div>
                                        </div>
                                    )}
                                    {currentHeadmaster.experience && (
                                        <div className="bg-white rounded-lg p-3 shadow-sm">
                                            <div className="text-sm text-gray-600">Total Experience</div>
                                            <div className="font-semibold text-gray-800">{currentHeadmaster.experience} years</div>
                                        </div>
                                    )}
                                </div>

                                {currentHeadmaster.bio && (
                                    <p className="text-gray-600 leading-relaxed">
                                        {currentHeadmaster.bio}
                                    </p>
                                )}

                                {currentHeadmaster.achievements && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-800 mb-2">Notable Achievements:</h4>
                                        <p className="text-gray-600 text-sm">{currentHeadmaster.achievements}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{headmasters.length}</div>
                        <div className="text-sm text-gray-600">Total Headmasters</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            {headmasters.filter(h => h.isCurrent).length}
                        </div>
                        <div className="text-sm text-gray-600">Current Headmaster</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">{periods.length}</div>
                        <div className="text-sm text-gray-600">Different Eras</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                            {Math.max(...headmasters.map(h => {
                                const years = h.period?.split('-');
                                return years && years.length === 2 ? parseInt(years[1]) - parseInt(years[0]) : 0;
                            }))}
                        </div>
                        <div className="text-sm text-gray-600">Longest Tenure (Years)</div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Headmasters
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name, qualification, or period..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Period Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Period
                            </label>
                            <select
                                value={filterPeriod}
                                onChange={(e) => setFilterPeriod(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Periods</option>
                                {periods.map(period => (
                                    <option key={period} value={period}>{period}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 flex justify-between items-center">
                    <p className="text-gray-600">
                        Showing {sortedHeadmasters.length} of {headmasters.length} headmasters
                    </p>
                    {(searchTerm || filterPeriod) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterPeriod('');
                            }}
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Headmasters Timeline Grid */}
                {sortedHeadmasters.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Headmasters Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterPeriod 
                                ? 'No headmasters match your search criteria.' 
                                : 'No headmaster records available.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Timeline for larger screens */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
                                
                                {sortedHeadmasters.map((headmaster, index) => (
                                    <div 
                                        key={headmaster._id}
                                        className={`relative flex items-center mb-8 ${
                                            index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                                        }`}
                                    >
                                        {/* Timeline dot */}
                                        <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white z-10"></div>
                                        
                                        {/* Content */}
                                        <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                                            {headmaster.period && (
                                                <div className={`inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2 ${
                                                    index % 2 === 0 ? 'float-right' : 'float-left'
                                                }`}>
                                                    {headmaster.period}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="w-5/12 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                                            <div className="flex">
                                                {/* Photo */}
                                                <div className="w-1/3 bg-gradient-to-br from-blue-50 to-indigo-100">
                                                    {headmaster.photo ? (
                                                        <img
                                                            src={`${baseImageURL}${headmaster.photo}`}
                                                            alt={headmaster.name}
                                                            className="w-full h-48 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-48 flex items-center justify-center">
                                                            <div className="text-4xl text-blue-300">
                                                                👨‍🏫
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="w-2/3 p-4">
                                                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                                                        {headmaster.name}
                                                    </h3>
                                                    <p className="text-blue-600 text-sm font-medium mb-2">
                                                        {headmaster.qualification}
                                                    </p>
                                                    
                                                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                                                        {headmaster.experience && (
                                                            <div>
                                                                <span className="font-medium">Experience:</span> {headmaster.experience} years
                                                            </div>
                                                        )}
                                                        {headmaster.specialization && (
                                                            <div>
                                                                <span className="font-medium">Specialization:</span> {headmaster.specialization}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {headmaster.achievements && (
                                                        <p className="text-xs text-gray-500 line-clamp-2">
                                                            <span className="font-medium">Legacy:</span> {headmaster.achievements}
                                                        </p>
                                                    )}

                                                    {headmaster.isCurrent && (
                                                        <span className="inline-block mt-2 px-2 py-1 bg-[#1e90c9] text-white rounded-full text-xs font-medium">
                                                            Current Headmaster
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grid layout for smaller screens */}
                        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {sortedHeadmasters.map((headmaster) => (
                                <div 
                                    key={headmaster._id} 
                                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Header with period */}
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold">{headmaster.name}</h3>
                                            {headmaster.isCurrent && (
                                                <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-blue-100 text-sm">{headmaster.qualification}</p>
                                            {headmaster.period && (
                                                <span className="px-2 py-1 bg-blue-700 rounded-full text-xs">
                                                    {headmaster.period}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-start space-x-4">
                                            {/* Photo */}
                                            <div className="shrink-0">
                                                {headmaster.photo ? (
                                                    <img
                                                        src={`${baseImageURL}${headmaster.photo}`}
                                                        alt={headmaster.name}
                                                        className="w-20 h-20 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-2xl text-blue-500">👨‍🏫</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    {headmaster.experience && (
                                                        <div>
                                                            <span className="font-medium">Experience:</span> {headmaster.experience} years
                                                        </div>
                                                    )}
                                                    {headmaster.specialization && (
                                                        <div>
                                                            <span className="font-medium">Specialization:</span> {headmaster.specialization}
                                                        </div>
                                                    )}
                                                </div>

                                                {headmaster.achievements && (
                                                    <div className="mt-3">
                                                        <p className="text-xs text-gray-500 line-clamp-3">
                                                            <span className="font-medium">Legacy:</span> {headmaster.achievements}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Legacy Section */}
                <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Institutional Legacy</h2>
                        <p className="text-gray-600">
                            Celebrating {headmasters.length} years of educational leadership and excellence
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4">
                            <div className="text-4xl text-blue-500 mb-2">🏛️</div>
                            <h3 className="font-semibold text-gray-800 mb-2">Foundation</h3>
                            <p className="text-sm text-gray-600">
                                Established with a vision for quality education and character building
                            </p>
                        </div>
                        
                        <div className="text-center p-4">
                            <div className="text-4xl text-green-500 mb-2">📈</div>
                            <h3 className="font-semibold text-gray-800 mb-2">Growth</h3>
                            <p className="text-sm text-gray-600">
                                Continuous expansion and modernization under successive leadership
                            </p>
                        </div>
                        
                        <div className="text-center p-4">
                            <div className="text-4xl text-purple-500 mb-2">⭐</div>
                            <h3 className="font-semibold text-gray-800 mb-2">Excellence</h3>
                            <p className="text-sm text-gray-600">
                                Maintaining academic excellence and holistic development
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                            Leadership Legacy
                        </h3>
                        <p className="text-blue-700">
                            Each headmaster has contributed uniquely to our institution's journey, 
                            building upon the foundation laid by their predecessors.
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .line-clamp-2 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                }
                .line-clamp-3 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 3;
                }
            `}</style>
        </div>
    );
};

export default HeadmasterList;