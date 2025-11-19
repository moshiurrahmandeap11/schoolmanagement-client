import { useEffect, useState } from 'react';
import Loader from '../../../../components/sharedItems/Loader/Loader';
import MainButton from '../../../../components/sharedItems/Mainbutton/Mainbutton';
import axiosInstance from '../../../../hooks/axiosInstance/axiosInstance';

const HolidayList = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('grid'); // 'grid' or 'calendar'
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const holidayTypes = [
        { value: 'national', label: 'National Holiday', color: 'red', icon: '🇧🇩' },
        { value: 'religious', label: 'Religious Holiday', color: 'purple', icon: '🕌' },
        { value: 'cultural', label: 'Cultural Holiday', color: 'green', icon: '🎉' },
        { value: 'international', label: 'International Day', color: 'blue', icon: '🌍' },
        { value: 'academic', label: 'Academic Holiday', color: 'orange', icon: '📚' },
        { value: 'other', label: 'Other', color: 'gray', icon: '📅' }
    ];

    const months = [
        { value: '01', label: 'January', short: 'Jan' },
        { value: '02', label: 'February', short: 'Feb' },
        { value: '03', label: 'March', short: 'Mar' },
        { value: '04', label: 'April', short: 'Apr' },
        { value: '05', label: 'May', short: 'May' },
        { value: '06', label: 'June', short: 'Jun' },
        { value: '07', label: 'July', short: 'Jul' },
        { value: '08', label: 'August', short: 'Aug' },
        { value: '09', label: 'September', short: 'Sep' },
        { value: '10', label: 'October', short: 'Oct' },
        { value: '11', label: 'November', short: 'Nov' },
        { value: '12', label: 'December', short: 'Dec' }
    ];

    const years = [
        new Date().getFullYear() - 1,
        new Date().getFullYear(),
        new Date().getFullYear() + 1
    ];

    useEffect(() => {
        fetchHolidays();
    }, [selectedYear]);

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/holiday');
            
            if (response.data.success) {
                // Filter by selected year
                const yearHolidays = response.data.data.filter(holiday => 
                    holiday.date.startsWith(selectedYear.toString())
                );
                setHolidays(yearHolidays);
            } else {
                setError('Failed to load holidays');
            }
        } catch (error) {
            console.error('Error fetching holidays:', error);
            setError('Failed to load holidays list');
        } finally {
            setLoading(false);
        }
    };

    // Filter holidays
    const filteredHolidays = holidays.filter(holiday => {
        const matchesSearch = holiday.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            holiday.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = !filterType || holiday.type === filterType;
        
        const matchesMonth = !filterMonth || holiday.date.startsWith(`${selectedYear}-${filterMonth}`);
        
        return matchesSearch && matchesType && matchesMonth;
    });

    const getTypeColor = (type) => {
        const typeObj = holidayTypes.find(t => t.value === type);
        return typeObj ? typeObj.color : 'gray';
    };

    const getTypeIcon = (type) => {
        const typeObj = holidayTypes.find(t => t.value === type);
        return typeObj ? typeObj.icon : '📅';
    };

    const getUpcomingHolidays = () => {
        const today = new Date().toISOString().split('T')[0];
        return holidays
            .filter(holiday => holiday.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 3);
    };

    const getHolidaysByMonth = () => {
        const holidaysByMonth = {};
        months.forEach(month => {
            holidaysByMonth[month.value] = holidays.filter(holiday => 
                holiday.date.startsWith(`${selectedYear}-${month.value}`)
            );
        });
        return holidaysByMonth;
    };

    const isToday = (date) => {
        const today = new Date().toISOString().split('T')[0];
        return date === today;
    };

    const isPast = (date) => {
        const today = new Date().toISOString().split('T')[0];
        return date < today;
    };

    const getDaysUntilHoliday = (date) => {
        const today = new Date();
        const holidayDate = new Date(date);
        const diffTime = holidayDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const CalendarView = () => {
        const holidaysByMonth = getHolidaysByMonth();

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {months.map(month => (
                    <div key={month.value} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-linear-to-r from-blue-500 to-blue-600 p-4 text-white">
                            <h3 className="text-lg font-bold text-center">{month.label} {selectedYear}</h3>
                        </div>
                        <div className="p-4">
                            {holidaysByMonth[month.value]?.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">📅</div>
                                    <p className="text-gray-500 text-sm">No holidays this month</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {holidaysByMonth[month.value]?.map(holiday => (
                                        <div 
                                            key={holiday._id}
                                            className={`p-3 rounded-lg border-l-4 ${
                                                isToday(holiday.date) 
                                                    ? 'bg-yellow-50 border-yellow-400' 
                                                    : isPast(holiday.date)
                                                    ? 'bg-gray-50 border-gray-300'
                                                    : 'bg-blue-50 border-blue-400'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {new Date(holiday.date).getDate()} {month.short}
                                                </span>
                                                <div className="flex gap-1">
                                                    {holiday.isGovernmentHoliday && (
                                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                            Govt
                                                        </span>
                                                    )}
                                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium bg-${getTypeColor(holiday.type)}-100 text-${getTypeColor(holiday.type)}-700`}>
                                                        {getTypeIcon(holiday.type)}
                                                    </span>
                                                </div>
                                            </div>
                                            <h4 className="font-semibold text-gray-800 text-sm mb-1">
                                                {holiday.title}
                                            </h4>
                                            {holiday.description && (
                                                <p className="text-xs text-gray-600 line-clamp-1">
                                                    {holiday.description}
                                                </p>
                                            )}
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs text-gray-500">
                                                    {holiday.duration || 1} day{holiday.duration > 1 ? 's' : ''}
                                                </span>
                                                {!isPast(holiday.date) && !isToday(holiday.date) && (
                                                    <span className="text-xs text-blue-600 font-medium">
                                                        in {getDaysUntilHoliday(holiday.date)} days
                                                    </span>
                                                )}
                                                {isToday(holiday.date) && (
                                                    <span className="text-xs text-yellow-600 font-medium">
                                                        Today!
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const GridView = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHolidays.map(holiday => {
                    const daysUntil = getDaysUntilHoliday(holiday.date);
                    
                    return (
                        <div 
                            key={holiday._id} 
                            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {/* Header with type and date */}
                            <div className={`bg-${getTypeColor(holiday.type)}-400  p-4 text-white`}>
                                <div className="flex justify-between items-start">
                                    <div className="text-2xl">{getTypeIcon(holiday.type)}</div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold">
                                            {new Date(holiday.date).getDate()}
                                        </div>
                                        <div className="text-sm opacity-90">
                                            {new Date(holiday.date).toLocaleDateString('en-US', { 
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                                    {holiday.title}
                                </h3>
                                
                                {holiday.description && (
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {holiday.description}
                                    </p>
                                )}

                                {/* Holiday Details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Duration:</span>
                                        <span className="font-medium text-gray-700">
                                            {holiday.duration || 1} day{holiday.duration > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Day:</span>
                                        <span className="font-medium text-gray-700">
                                            {new Date(holiday.date).toLocaleDateString('en-US', { 
                                                weekday: 'long' 
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Status and Badges */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getTypeColor(holiday.type)}-100 text-${getTypeColor(holiday.type)}-800`}>
                                        {holidayTypes.find(t => t.value === holiday.type)?.label}
                                    </span>
                                    
                                    {holiday.isGovernmentHoliday && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            🇧🇩 Government
                                        </span>
                                    )}
                                    
                                    {holiday.isRecurring && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            🔁 Yearly
                                        </span>
                                    )}
                                </div>

                                {/* Countdown or Status */}
                                <div className={`text-center py-2 rounded-lg ${
                                    isToday(holiday.date) 
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : isPast(holiday.date)
                                        ? 'bg-gray-100 text-black'
                                        : 'bg-[#1e90c9] text-white'
                                }`}>
                                    {isToday(holiday.date) ? (
                                        <span className="font-semibold">🎉 Holiday Today!</span>
                                    ) : isPast(holiday.date) ? (
                                        <span className="text-sm">Completed</span>
                                    ) : (
                                        <span className="font-semibold">
                                            {daysUntil === 1 ? 'Tomorrow!' : `${daysUntil} days to go`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return <Loader></Loader>
    }

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Holidays</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button
                            onClick={fetchHolidays}
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
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        স্কুল ছুটির তালিকা
                    </h1>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">{holidays.length}</div>
                        <div className="text-sm text-gray-600">Total Holidays</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                            {holidays.filter(h => !isPast(h.date)).length}
                        </div>
                        <div className="text-sm text-gray-600">Upcoming</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                            {holidays.filter(h => h.isGovernmentHoliday).length}
                        </div>
                        <div className="text-sm text-gray-600">Govt Holidays</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                            {new Set(holidays.map(h => h.type)).size}
                        </div>
                        <div className="text-sm text-gray-600">Categories</div>
                    </div>
                </div>

                {/* Upcoming Holidays Banner */}
                {getUpcomingHolidays().length > 0 && (
                    <div className="bg-linear-to-r from-[#1e90c9] to-[#1e90c9]/90 rounded-2xl shadow-lg p-6 mb-8 text-black">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">🎯 Upcoming Holidays</h2>
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                                Next {getUpcomingHolidays().length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {getUpcomingHolidays().map(holiday => (
                                <div key={holiday._id} className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-lg">{getTypeIcon(holiday.type)}</span>
                                        <span className="text-sm bg-white bg-opacity-30 px-2 py-1 rounded">
                                            {getDaysUntilHoliday(holiday.date)} days
                                        </span>
                                    </div>
                                    <h3 className="font-semibold mb-1">{holiday.title}</h3>
                                    <p className="text-sm opacity-90">
                                        {new Date(holiday.date).toLocaleDateString('en-US', { 
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Controls Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                        {/* Year Selector */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">Year:</label>
                            <div className="flex gap-2">
                                {years.map(year => (
                                    <MainButton
                                        key={year}
                                        onClick={() => setSelectedYear(year)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            selectedYear === year
                                                ? 'bg-[#1e90c9] text-white'
                                                : 'bg-gray-300 text-black hover:bg-gray-400'
                                        }`}
                                    >
                                        {year}
                                    </MainButton>
                                ))}
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-2">
                            <MainButton
                                onClick={() => setView('grid')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    view === 'grid'
                                        ? 'bg-[#1e90c9] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Grid View
                            </MainButton>
                            <MainButton
                                onClick={() => setView('calendar')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    view === 'calendar'
                                        ? 'bg-[#1e90c9] text-black'
                                        : 'bg-gray-300 text-black hover:bg-gray-400'
                                }`}
                            >
                                Calendar View
                            </MainButton>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {/* Search Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Holidays
                            </label>
                            <input
                                type="text"
                                placeholder="Search by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            />
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            >
                                <option value="">All Types</option>
                                {holidayTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Month Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Month
                            </label>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            >
                                <option value="">All Months</option>
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {(searchTerm || filterType || filterMonth) && (
                        <div className="mt-4 flex justify-between items-center">
                            <p className="text-gray-600 text-sm">
                                Showing {filteredHolidays.length} of {holidays.length} holidays
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterType('');
                                    setFilterMonth('');
                                }}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Holiday Types Legend */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Holiday Types</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {holidayTypes.map(type => (
                            <div key={type.value} className="flex items-center gap-2 text-sm">
                                <span className={`w-3 h-3 rounded-full bg-${type.color}-500`}></span>
                                <span>{type.icon}</span>
                                <span className="text-gray-700">{type.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                {filteredHolidays.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Holidays Found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || filterType || filterMonth 
                                ? 'No holidays match your search criteria.' 
                                : 'No holidays scheduled for this year.'
                            }
                        </p>
                        {(searchTerm || filterType || filterMonth) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterType('');
                                    setFilterMonth('');
                                }}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : view === 'grid' ? (
                    <GridView />
                ) : (
                    <CalendarView />
                )}

                {/* Quick Stats Footer */}
                <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                                {holidays.filter(h => h.type === 'national').length}
                            </div>
                            <div className="text-sm text-gray-600">National Holidays</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                                {holidays.filter(h => h.type === 'religious').length}
                            </div>
                            <div className="text-sm text-gray-600">Religious Holidays</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                                {holidays.filter(h => h.type === 'cultural').length}
                            </div>
                            <div className="text-sm text-gray-600">Cultural Events</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                                {holidays.filter(h => h.isRecurring).length}
                            </div>
                            <div className="text-sm text-gray-600">Yearly Events</div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>📌 Holiday dates are subject to change. Please check with school administration for updates.</p>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .line-clamp-1 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 1;
                }
                .line-clamp-2 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                }
            `}</style>
        </div>
    );
};

export default HolidayList;