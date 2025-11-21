import { useEffect, useState } from 'react';
import {
    FaBuilding,
    FaChair,
    FaDoorOpen,
    FaEdit,
    FaPlus,
    FaSearch,
    FaSync,
    FaTimes,
    FaTrash,
    FaUsers,
    FaWrench
} from 'react-icons/fa';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';

const ClassRooms = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFloor, setFilterFloor] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        roomNumber: '',
        roomName: '',
        floor: '',
        capacity: '',
        facilities: [],
        roomType: 'Classroom',
        status: 'Available',
        description: ''
    });

    const roomTypes = ['Classroom', 'Laboratory', 'Computer Lab', 'Library', 'Auditorium', 'Other'];
    const statusOptions = ['Available', 'Occupied', 'Maintenance', 'Reserved'];
    const facilitiesOptions = ['Projector', 'AC', 'WiFi', 'Computers', 'Whiteboard', 'Sound System', 'Camera'];
    const floors = [1, 2, 3, 4, 5];

    // Fetch all classrooms
    const fetchClassrooms = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/classrooms');
            
            if (response.data.success) {
                setClassrooms(response.data.data);
            } else {
                showSnackbar('Error fetching classrooms', 'error');
            }
        } catch (error) {
            showSnackbar('Failed to fetch classrooms', 'error');
            console.error('Fetch classrooms error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/classrooms/stats/summary');
            
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchClassrooms();
        fetchStats();
    }, []);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpenAddDialog = () => {
        setFormData({
            roomNumber: '',
            roomName: '',
            floor: '',
            capacity: '',
            facilities: [],
            roomType: 'Classroom',
            status: 'Available',
            description: ''
        });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (classroom) => {
        setSelectedClassroom(classroom);
        setFormData({
            roomNumber: classroom.roomNumber,
            roomName: classroom.roomName,
            floor: classroom.floor.toString(),
            capacity: classroom.capacity.toString(),
            facilities: classroom.facilities,
            roomType: classroom.roomType,
            status: classroom.status,
            description: classroom.description
        });
        setOpenEditDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenEditDialog(false);
        setSelectedClassroom(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFacilityChange = (facility) => {
        setFormData(prev => ({
            ...prev,
            facilities: prev.facilities.includes(facility)
                ? prev.facilities.filter(f => f !== facility)
                : [...prev.facilities, facility]
        }));
    };

    const handleAddClassroom = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        
        try {
            const response = await axiosInstance.post('/classrooms', formData);

            if (response.data.success) {
                showSnackbar('Classroom added successfully');
                fetchClassrooms();
                fetchStats();
                handleCloseDialog();
            } else {
                showSnackbar(response.data.message, 'error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add classroom';
            showSnackbar(errorMessage, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateClassroom = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        
        try {
            const response = await axiosInstance.put(`/classrooms/${selectedClassroom._id}`, formData);

            if (response.data.success) {
                showSnackbar('Classroom updated successfully');
                fetchClassrooms();
                fetchStats();
                handleCloseDialog();
            } else {
                showSnackbar(response.data.message, 'error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update classroom';
            showSnackbar(errorMessage, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClassroom = async (id) => {
        if (!window.confirm('Are you sure you want to delete this classroom?')) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await axiosInstance.delete(`/classrooms/${id}`);

            if (response.data.success) {
                showSnackbar('Classroom deleted successfully');
                fetchClassrooms();
                fetchStats();
            } else {
                showSnackbar(response.data.message, 'error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete classroom';
            showSnackbar(errorMessage, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateUsage = async (id, newUsage) => {
        setActionLoading(true);
        try {
            const response = await axiosInstance.patch(`/classrooms/${id}/usage`, { usage: newUsage });

            if (response.data.success) {
                showSnackbar('Classroom usage updated successfully');
                fetchClassrooms();
                fetchStats();
            } else {
                showSnackbar(response.data.message, 'error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update usage';
            showSnackbar(errorMessage, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Filter classrooms
    const filteredClassrooms = classrooms.filter(classroom => {
        const matchesSearch = classroom.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            classroom.roomName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFloor = filterFloor === 'all' || classroom.floor.toString() === filterFloor;
        const matchesStatus = filterStatus === 'all' || classroom.status === filterStatus;
        
        return matchesSearch && matchesFloor && matchesStatus;
    });

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-800';
            case 'Occupied': return 'bg-blue-100 text-blue-800';
            case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'Reserved': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Available': return <FaDoorOpen />;
            case 'Occupied': return <FaUsers />;
            case 'Maintenance': return <FaWrench />;
            case 'Reserved': return <FaChair />;
            default: return <FaBuilding />;
        }
    };

    // Get utilization percentage
    const getUtilizationPercentage = (currentUsage, capacity) => {
        if (capacity === 0) return 0;
        return (currentUsage / capacity) * 100;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading classrooms...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <FaBuilding className="text-2xl text-[#1e90c9]" />
                            </div>
                            <div className="ml-4">
                                <h1 className="text-2xl font-bold text-gray-900">Classroom Management</h1>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={fetchClassrooms}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <FaSync className="mr-2" />
                                Refresh
                            </button>
                            <MainButton
                                onClick={handleOpenAddDialog}
                                disabled={actionLoading}
                                className="rounded-md"
                            >
                                <FaPlus className="mr-2" />
                                Add Classroom
                            </MainButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <FaBuilding className="text-[#1e90c9] text-xl" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Classrooms</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalClassrooms}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <FaChair className="text-[#1e90c9] text-xl" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalCapacity}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <FaUsers className="text-[#1e90c9] text-xl" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Current Usage</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsage}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <FaDoorOpen className="text-[#1e90c9] text-xl" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.availableRooms}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by room number or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                            <select
                                value={filterFloor}
                                onChange={(e) => setFilterFloor(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                            >
                                <option value="all">All Floors</option>
                                {floors.map(floor => (
                                    <option key={floor} value={floor.toString()}>Floor {floor}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Classrooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClassrooms.map((classroom) => {
                        const utilization = getUtilizationPercentage(classroom.currentUsage, classroom.capacity);
                        
                        return (
                            <div key={classroom._id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                {/* Classroom Header */}
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {classroom.roomNumber}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {classroom.roomName}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classroom.status)}`}>
                                            {getStatusIcon(classroom.status)}
                                            <span className="ml-1">{classroom.status}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Classroom Details */}
                                <div className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Floor:</span>
                                            <span className="font-semibold text-gray-900">Floor {classroom.floor}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Type:</span>
                                            <span className="font-semibold text-blue-600">{classroom.roomType}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Capacity:</span>
                                            <span className="font-semibold text-gray-900">{classroom.capacity}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Current Usage:</span>
                                            <span className="font-semibold text-purple-600">{classroom.currentUsage}</span>
                                        </div>
                                    </div>

                                    {/* Usage Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Utilization</span>
                                            <span>{utilization.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${
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
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Facilities:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {classroom.facilities.map((facility, index) => (
                                                    <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                        {facility}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {classroom.description && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600">{classroom.description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleOpenEditDialog(classroom)}
                                                disabled={actionLoading}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors disabled:opacity-50"
                                                title="Edit Classroom"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClassroom(classroom._id)}
                                                disabled={actionLoading}
                                                className="text-red-600 hover:text-red-900 p-1 rounded transition-colors disabled:opacity-50"
                                                title="Delete Classroom"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        
                                        {/* Usage Controls */}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleUpdateUsage(classroom._id, Math.max(0, classroom.currentUsage - 1))}
                                                disabled={actionLoading || classroom.currentUsage === 0}
                                                className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors disabled:opacity-50"
                                                title="Decrease Usage"
                                            >
                                                -
                                            </button>
                                            <span className="text-sm text-gray-600">{classroom.currentUsage}</span>
                                            <button
                                                onClick={() => handleUpdateUsage(classroom._id, Math.min(classroom.capacity, classroom.currentUsage + 1))}
                                                disabled={actionLoading || classroom.currentUsage === classroom.capacity}
                                                className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors disabled:opacity-50"
                                                title="Increase Usage"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredClassrooms.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <FaBuilding className="mx-auto text-4xl text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || filterFloor !== 'all' || filterStatus !== 'all' ? 'No classrooms found' : 'No classrooms available'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || filterFloor !== 'all' || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Start by adding classrooms to the system'}
                        </p>
                        <MainButton
                            onClick={handleOpenAddDialog}
                        >
                            Add First Classroom
                        </MainButton>
                    </div>
                )}
            </div>

            {/* Add Classroom Dialog */}
            {openDialog && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Add New Classroom</h2>
                        </div>
                        <form onSubmit={handleAddClassroom}>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Room Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="roomNumber"
                                            value={formData.roomNumber}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                            placeholder="e.g., 101, A12"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Room Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="roomName"
                                            value={formData.roomName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                            placeholder="e.g., Science Lab, Computer Room"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Floor *
                                        </label>
                                        <select
                                            name="floor"
                                            value={formData.floor}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                        >
                                            <option value="">Select Floor</option>
                                            {floors.map(floor => (
                                                <option key={floor} value={floor}>{floor}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Capacity *
                                        </label>
                                        <input
                                            type="number"
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                            placeholder="e.g., 40"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Room Type
                                        </label>
                                        <select
                                            name="roomType"
                                            value={formData.roomType}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                        >
                                            {roomTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Facilities
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {facilitiesOptions.map(facility => (
                                            <label key={facility} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.facilities.includes(facility)}
                                                    onChange={() => handleFacilityChange(facility)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-[#1e90c9]"
                                                />
                                                <span className="text-sm text-gray-700">{facility}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                        placeholder="Additional information about this classroom..."
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                                <button 
                                    type="button"
                                    onClick={handleCloseDialog}
                                    disabled={actionLoading}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <MainButton 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="rounded-md"
                                >
                                    {actionLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="mr-2" />
                                            Add Classroom
                                        </>
                                    )}
                                </MainButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Classroom Dialog */}
            {openEditDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Edit Classroom</h2>
                        </div>
                        <form onSubmit={handleUpdateClassroom}>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Room Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="roomNumber"
                                            value={formData.roomNumber}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Room Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="roomName"
                                            value={formData.roomName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Floor *
                                        </label>
                                        <select
                                            name="floor"
                                            value={formData.floor}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {floors.map(floor => (
                                                <option key={floor} value={floor}>{floor}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Capacity *
                                        </label>
                                        <input
                                            type="number"
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Current usage: {selectedClassroom?.currentUsage || 0}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Room Type
                                        </label>
                                        <select
                                            name="roomType"
                                            value={formData.roomType}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {roomTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Facilities
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {facilitiesOptions.map(facility => (
                                            <label key={facility} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.facilities.includes(facility)}
                                                    onChange={() => handleFacilityChange(facility)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{facility}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                                <button 
                                    type="button"
                                    onClick={handleCloseDialog}
                                    disabled={actionLoading}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                                >
                                    {actionLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FaEdit className="mr-2" />
                                            Update Classroom
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            {snackbar.open && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm ${
                    snackbar.severity === 'success' ? 'bg-green-500 text-white' :
                    snackbar.severity === 'error' ? 'bg-red-500 text-white' :
                    'bg-blue-500 text-white'
                }`}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">{snackbar.message}</span>
                        <button 
                            onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
                            className="ml-4 hover:opacity-70 transition-opacity"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassRooms;