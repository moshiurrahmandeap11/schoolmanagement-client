import { useEffect, useState } from 'react';
import {
    FaBuilding,
    FaChair,
    FaDesktop,
    FaDoorOpen,
    FaFilter,
    FaMapMarkerAlt,
    FaSearch,
    FaSnowflake,
    FaUsers,
    FaVideo,
    FaVolumeUp,
    FaWifi,
    FaWrench
} from 'react-icons/fa';
import Loader from '../../../../components/sharedItems/Loader/Loader';
import axiosInstance from '../../../../hooks/axiosInstance/axiosInstance';


const ClassRoomsClient = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFloor, setFilterFloor] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Fetch all classrooms
    const fetchClassrooms = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/classrooms');
            
            if (response.data.success) {
                setClassrooms(response.data.data);
            }
        } catch (error) {
            console.error('Fetch classrooms error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, []);

    // Filter classrooms based on search and filters
    const filteredClassrooms = classrooms.filter(classroom => {
        const matchesSearch = classroom.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            classroom.roomName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFloor = filterFloor === 'all' || classroom.floor.toString() === filterFloor;
        const matchesType = filterType === 'all' || classroom.roomType === filterType;
        const matchesStatus = filterStatus === 'all' || classroom.status === filterStatus;
        
        return matchesSearch && matchesFloor && matchesType && matchesStatus;
    });

    // Get status color and icon
    const getStatusInfo = (status) => {
        switch (status) {
            case 'Available':
                return { color: 'bg-[#1e90c9] text-white border-[#1e90c9]', icon: FaDoorOpen };
            case 'Occupied':
                return { color: 'bg-[#1e90c9] text-white border-[#1e90c9]', icon: FaUsers };
            case 'Maintenance':
                return { color: 'bg-[#1e90c9] text-white border-[#1e90c9]', icon: FaWrench };
            case 'Reserved':
                return { color: 'bg-[#1e90c9] text-white border-[#1e90c9]', icon: FaChair };
            default:
                return { color: 'bg-[#1e90c9] text-white border-[#1e90c9]', icon: FaBuilding };
        }
    };

    // Get facility icon
    const getFacilityIcon = (facility) => {
        switch (facility) {
            case 'Projector': return FaVideo;
            case 'AC': return FaSnowflake;
            case 'WiFi': return FaWifi;
            case 'Computers': return FaDesktop;
            case 'Sound System': return FaVolumeUp;
            default: return FaChair;
        }
    };

    // Get room type color
    const getRoomTypeColor = (type) => {
        switch (type) {
            case 'Classroom': return 'text-blue-600 bg-blue-50';
            case 'Laboratory': return 'text-green-600 bg-green-50';
            case 'Computer Lab': return 'text-purple-600 bg-purple-50';
            case 'Library': return 'text-orange-600 bg-orange-50';
            case 'Auditorium': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    // Calculate utilization percentage
    const getUtilizationPercentage = (currentUsage, capacity) => {
        if (capacity === 0) return 0;
        return (currentUsage / capacity) * 100;
    };

    // Get unique floors from classrooms
    const uniqueFloors = [...new Set(classrooms.map(room => room.floor))].sort();
    // Get unique room types
    const uniqueTypes = [...new Set(classrooms.map(room => room.roomType))];
    // Get status options
    const statusOptions = ['Available', 'Occupied', 'Maintenance', 'Reserved'];

    if (loading) {
        return <Loader></Loader>
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            কক্ষ সংখ্যা
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-rows-2 lg:grid-rows-1 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <FaBuilding className="text-[#1e90c9] text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Classrooms</p>
                                <p className="text-2xl font-bold text-gray-900">{classrooms.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <FaDoorOpen className="text-[#1e90c9] text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Available Now</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {classrooms.filter(room => room.status === 'Available').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <FaUsers className="text-[#1e90c9] text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {classrooms.reduce((sum, room) => sum + room.capacity, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <FaChair className="text-[#1e90c9] text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Room Types</p>
                                <p className="text-2xl font-bold text-gray-900">{uniqueTypes.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Classrooms
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by room number or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent bg-white/50"
                                />
                            </div>
                        </div>

                        {/* Floor Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaMapMarkerAlt className="inline mr-1" />
                                Floor
                            </label>
                            <select
                                value={filterFloor}
                                onChange={(e) => setFilterFloor(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent bg-white/50"
                            >
                                <option value="all">All Floors</option>
                                {uniqueFloors.map(floor => (
                                    <option key={floor} value={floor.toString()}>Floor {floor}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaFilter className="inline mr-1" />
                                Room Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent bg-white/50"
                            >
                                <option value="all">All Types</option>
                                {uniqueTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-lg border transition-all ${
                                    filterStatus === 'all' 
                                        ? 'bg-[#1e90c9] text-white border-[#1e90c9]' 
                                        : 'bg-white/50 text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                All
                            </button>
                            {statusOptions.map(status => {
                                const statusInfo = getStatusInfo(status);
                                const StatusIcon = statusInfo.icon;
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                                            filterStatus === status 
                                                ? `${statusInfo.color} border-current` 
                                                : 'bg-white/50 text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <StatusIcon className="text-sm" />
                                        {status}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Classrooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClassrooms.map((classroom) => {
                        const statusInfo = getStatusInfo(classroom.status);
                        const StatusIcon = statusInfo.icon;
                        const utilization = getUtilizationPercentage(classroom.currentUsage, classroom.capacity);
                        
                        return (
                            <div 
                                key={classroom._id} 
                                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
                            >
                                {/* Classroom Header */}
                                <div className="p-6 border-b border-gray-200/50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#1e90c9] transition-colors">
                                                {classroom.roomNumber}
                                            </h3>
                                            <p className="text-lg text-gray-600 font-medium">
                                                {classroom.roomName}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${statusInfo.color}`}>
                                            <StatusIcon className="mr-1.5" />
                                            {classroom.status}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <FaMapMarkerAlt />
                                            Floor {classroom.floor}
                                        </span>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRoomTypeColor(classroom.roomType)}`}>
                                            {classroom.roomType}
                                        </span>
                                    </div>
                                </div>

                                {/* Classroom Details */}
                                <div className="p-6">
                                    {/* Capacity and Usage */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                                            <FaUsers className="text-[#1e90c9] text-xl mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">Capacity</p>
                                            <p className="text-lg font-bold text-gray-900">{classroom.capacity}</p>
                                        </div>
                                        <div className="text-center p-3 bg-green-50 rounded-xl">
                                            <FaChair className="text-green-600 text-xl mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">Current Usage</p>
                                            <p className="text-lg font-bold text-gray-900">{classroom.currentUsage}</p>
                                        </div>
                                    </div>

                                    {/* Usage Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Room Utilization</span>
                                            <span className="font-semibold">{utilization.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                                className={`h-3 rounded-full transition-all duration-500 ${
                                                    utilization >= 90 ? 'bg-red-500' :
                                                    utilization >= 75 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}
                                                style={{ width: `${utilization}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Facilities */}
                                    {classroom.facilities.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-3">Facilities:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {classroom.facilities.map((facility, index) => {
                                                    const FacilityIcon = getFacilityIcon(facility);
                                                    return (
                                                        <span 
                                                            key={index}
                                                            className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                                                        >
                                                            <FacilityIcon />
                                                            {facility}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {classroom.description && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                            <p className="text-sm text-gray-600 italic">
                                                "{classroom.description}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 bg-gray-50/50 rounded-b-2xl border-t border-gray-200/50">
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Last updated: {new Date(classroom.updatedAt).toLocaleDateString()}</span>
                                        <span className={`font-semibold ${
                                            classroom.availableSeats === 0 ? 'text-red-600' : 
                                            classroom.availableSeats < 5 ? 'text-yellow-600' : 
                                            'text-green-600'
                                        }`}>
                                            {classroom.capacity - classroom.currentUsage} seats available
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredClassrooms.length === 0 && (
                    <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                        <FaBuilding className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {searchTerm || filterFloor !== 'all' || filterType !== 'all' || filterStatus !== 'all' 
                                ? 'No classrooms found' 
                                : 'No classrooms available'
                            }
                        </h3>
                        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                            {searchTerm || filterFloor !== 'all' || filterType !== 'all' || filterStatus !== 'all'
                                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                                : 'There are currently no classrooms in the system.'
                            }
                        </p>
                        {(searchTerm || filterFloor !== 'all' || filterType !== 'all' || filterStatus !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterFloor('all');
                                    setFilterType('all');
                                    setFilterStatus('all');
                                }}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Results Count */}
                {filteredClassrooms.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{filteredClassrooms.length}</span> of{' '}
                            <span className="font-semibold text-gray-900">{classrooms.length}</span> classrooms
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassRoomsClient;