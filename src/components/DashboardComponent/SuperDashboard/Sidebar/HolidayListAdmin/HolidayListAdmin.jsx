import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';


const HolidayListAdmin = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [filterType, setFilterType] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        type: 'national',
        description: '',
        duration: 1,
        isRecurring: false,
        isGovernmentHoliday: false
    });

    const holidayTypes = [
        { value: 'national', label: 'National Holiday', color: 'red' },
        { value: 'religious', label: 'Religious Holiday', color: 'purple' },
        { value: 'cultural', label: 'Cultural Holiday', color: 'green' },
        { value: 'international', label: 'International Day', color: 'blue' },
        { value: 'academic', label: 'Academic Holiday', color: 'orange' },
        { value: 'other', label: 'Other', color: 'gray' }
    ];

    const months = [
        { value: '', label: 'All Months' },
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/holiday');
            
            if (response.data.success) {
                setHolidays(response.data.data);
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

    const preloadBDHolidays = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/holiday/preload-bd-holidays');
            
            if (response.data.success) {
                alert('Bangladesh government holidays preloaded successfully!');
                fetchHolidays();
            } else {
                alert('Failed to preload holidays');
            }
        } catch (error) {
            console.error('Error preloading holidays:', error);
            alert('Failed to preload holidays');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingHoliday) {
                // Update holiday
                const response = await axiosInstance.put(`/holiday/${editingHoliday._id}`, formData);
                if (response.data.success) {
                    alert('Holiday updated successfully!');
                    setEditingHoliday(null);
                }
            } else {
                // Add new holiday
                const response = await axiosInstance.post('/holiday', formData);
                if (response.data.success) {
                    alert('Holiday added successfully!');
                    setShowAddForm(false);
                }
            }
            resetForm();
            fetchHolidays();
        } catch (error) {
            console.error('Error saving holiday:', error);
            alert(error.response?.data?.message || 'Failed to save holiday');
        }
    };

    const handleEdit = (holiday) => {
        setEditingHoliday(holiday);
        setFormData({
            title: holiday.title,
            date: holiday.date,
            type: holiday.type,
            description: holiday.description || '',
            duration: holiday.duration || 1,
            isRecurring: holiday.isRecurring || false,
            isGovernmentHoliday: holiday.isGovernmentHoliday || false
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this holiday?')) {
            try {
                const response = await axiosInstance.delete(`/holiday/${id}`);
                if (response.data.success) {
                    alert('Holiday deleted successfully!');
                    fetchHolidays();
                }
            } catch (error) {
                console.error('Error deleting holiday:', error);
                alert('Failed to delete holiday');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            date: '',
            type: 'national',
            description: '',
            duration: 1,
            isRecurring: false,
            isGovernmentHoliday: false
        });
        setEditingHoliday(null);
        setShowAddForm(false);
    };

    // Filter holidays
    const filteredHolidays = holidays.filter(holiday => {
        const matchesSearch = holiday.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            holiday.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = !filterType || holiday.type === filterType;
        
        const matchesMonth = !filterMonth || holiday.date.startsWith(`${new Date().getFullYear()}-${filterMonth}`);
        
        return matchesSearch && matchesType && matchesMonth;
    });

    const getTypeColor = (type) => {
        const typeObj = holidayTypes.find(t => t.value === type);
        return typeObj ? typeObj.color : 'gray';
    };

    const getUpcomingHolidays = () => {
        const today = new Date().toISOString().split('T')[0];
        return holidays
            .filter(holiday => holiday.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 5);
    };

    if (loading) {
        return <Loader />
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className=" mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        Holiday Management
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
                            {holidays.filter(h => h.isGovernmentHoliday).length}
                        </div>
                        <div className="text-sm text-gray-600">Govt Holidays</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                            {holidays.filter(h => new Date(h.date) >= new Date()).length}
                        </div>
                        <div className="text-sm text-gray-600">Upcoming</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                            {holidays.filter(h => h.isRecurring).length}
                        </div>
                        <div className="text-sm text-gray-600">Recurring</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <MainButton
                                onClick={() => setShowAddForm(true)}
                                className="rounded-md"
                            >
                                + Add New Holiday
                            </MainButton>
                            <MainButton
                                onClick={preloadBDHolidays}
                                className="rounded-md"
                            >
                                📅 Preload BD Govt Holidays
                            </MainButton>
                        </div>
                        <div className="text-sm text-gray-600">
                            Current Year: {new Date().getFullYear()}
                        </div>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showAddForm && (
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Holiday Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    placeholder="Enter holiday title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                >
                                    {holidayTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration (Days)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    placeholder="Enter holiday description"
                                />
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isRecurring}
                                        onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Recurring Yearly</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isGovernmentHoliday}
                                        onChange={(e) => setFormData({...formData, isGovernmentHoliday: e.target.checked})}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Government Holiday</span>
                                </label>
                            </div>

                            <div className="md:col-span-2 flex gap-4 justify-end">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <MainButton
                                    type="submit"
                                    className="rounded-md"
                                >
                                    {editingHoliday ? 'Update Holiday' : 'Add Holiday'}
                                </MainButton>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-2">
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
                                    <option key={type.value} value={type.value}>{type.label}</option>
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
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>{month.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 flex justify-between items-center">
                    <p className="text-gray-600">
                        Showing {filteredHolidays.length} of {holidays.length} holidays
                    </p>
                    {(searchTerm || filterType || filterMonth) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('');
                                setFilterMonth('');
                            }}
                            className="text-[#1e90c9] text-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Upcoming Holidays */}
                {getUpcomingHolidays().length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Holidays</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getUpcomingHolidays().map(holiday => (
                                <div key={holiday._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getTypeColor(holiday.type)}-100 text-${getTypeColor(holiday.type)}-800`}>
                                            {holidayTypes.find(t => t.value === holiday.type)?.label}
                                        </span>
                                        {holiday.isGovernmentHoliday && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                Govt
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-1">{holiday.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {new Date(holiday.date).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                    {holiday.description && (
                                        <p className="text-sm text-gray-500">{holiday.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Holidays Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Holiday
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredHolidays.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No holidays found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHolidays.map(holiday => {
                                        const holidayDate = new Date(holiday.date);
                                        const today = new Date();
                                        const isPast = holidayDate < today;
                                        const isToday = holidayDate.toDateString() === today.toDateString();

                                        return (
                                            <tr key={holiday._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {holiday.title}
                                                            </div>
                                                            {holiday.description && (
                                                                <div className="text-sm text-gray-500">
                                                                    {holiday.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {holidayDate.toLocaleDateString('en-US', { 
                                                            weekday: 'short',
                                                            year: 'numeric', 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getTypeColor(holiday.type)}-100 text-${getTypeColor(holiday.type)}-800`}>
                                                        {holidayTypes.find(t => t.value === holiday.type)?.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {holiday.duration || 1} day{holiday.duration > 1 ? 's' : ''}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isToday 
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : isPast
                                                            ? 'bg-gray-100 text-gray-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {isToday ? 'Today' : isPast ? 'Past' : 'Upcoming'}
                                                    </span>
                                                    {holiday.isGovernmentHoliday && (
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Govt
                                                        </span>
                                                    )}
                                                    {holiday.isRecurring && (
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Recurring
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(holiday)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(holiday._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Calendar View (Optional) */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Holiday Calendar Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {months.slice(1).map(month => {
                            const monthHolidays = holidays.filter(h => 
                                h.date.startsWith(`${new Date().getFullYear()}-${month.value}`)
                            );
                            
                            return (
                                <div key={month.value} className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">{month.label}</h4>
                                    <div className="space-y-2">
                                        {monthHolidays.length === 0 ? (
                                            <p className="text-sm text-gray-500">No holidays</p>
                                        ) : (
                                            monthHolidays.map(holiday => (
                                                <div key={holiday._id} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700">
                                                        {new Date(holiday.date).getDate()} - {holiday.title}
                                                    </span>
                                                    <span className={`w-2 h-2 rounded-full bg-${getTypeColor(holiday.type)}-500`}></span>
                                                </div>
                                            ))
                                        )}
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

export default HolidayListAdmin;