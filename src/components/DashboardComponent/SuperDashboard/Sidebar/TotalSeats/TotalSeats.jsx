import React, { useState, useEffect } from 'react';
import { 
  FaSchool, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSync,
  FaTimes
} from 'react-icons/fa';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';

const TotalSeats = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [formData, setFormData] = useState({
        className: '',
        totalSeats: '',
        section: 'A',
        academicYear: new Date().getFullYear(),
        description: ''
    });

    const academicYears = [
        new Date().getFullYear(),
        new Date().getFullYear() + 1,
        new Date().getFullYear() - 1
    ];

    const sections = ['A', 'B', 'C', 'D', 'E'];

    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            const classesResponse = await axiosInstance.get('/total-seats');
            if (classesResponse.data.success) {
                setClasses(classesResponse.data.data);
            }

            const studentsResponse = await axiosInstance.get('/students');
            if (studentsResponse.data.success) {
                setStudents(studentsResponse.data.data);
            }

        } catch (error) {
            showSnackbar('Failed to load data', 'error');
            console.error('Fetch data error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpenAddDialog = () => {
        setFormData({
            className: '',
            totalSeats: '',
            section: 'A',
            academicYear: new Date().getFullYear(),
            description: ''
        });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (classItem) => {
        setSelectedClass(classItem);
        setFormData({
            className: classItem.className,
            totalSeats: classItem.totalSeats.toString(),
            section: classItem.section,
            academicYear: classItem.academicYear,
            description: classItem.description
        });
        setOpenEditDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenEditDialog(false);
        setSelectedClass(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddClass = async () => {
        if (!formData.className || !formData.totalSeats) {
            showSnackbar('Please fill required fields', 'error');
            return;
        }

        setActionLoading(true);
        
        try {
            const response = await axiosInstance.post('/total-seats', formData);

            if (response.data.success) {
                showSnackbar('Class added successfully');
                fetchAllData();
                handleCloseDialog();
            } else {
                showSnackbar(response.data.message, 'error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add class';
            showSnackbar(errorMessage, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateClass = async () => {
        if (!formData.totalSeats) {
            showSnackbar('Please fill required fields', 'error');
            return;
        }

        setActionLoading(true);
        
        try {
            const response = await axiosInstance.put(`/total-seats/${selectedClass._id}`, formData);

            if (response.data.success) {
                showSnackbar('Class updated successfully');
                fetchAllData();
                handleCloseDialog();
            } else {
                showSnackbar(response.data.message, 'error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update class';
            showSnackbar(errorMessage, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm('Are you sure you want to delete this class?')) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await axiosInstance.delete(`/total-seats/${id}`);

            if (response.data.success) {
                showSnackbar('Class deleted successfully');
                fetchAllData();
            } else {
                showSnackbar(response.data.message, 'error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete class';
            showSnackbar(errorMessage, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const getStudentCountForClass = (className, section) => {
        return students.filter(student => 
            student.class === className && 
            student.section === section &&
            student.status === 'active'
        ).length;
    };

    const calculateStats = () => {
        let totalSeats = 0;
        let totalOccupied = 0;

        classes.forEach(classItem => {
            totalSeats += classItem.totalSeats;
            const actualStudents = getStudentCountForClass(classItem.className, classItem.section);
            totalOccupied += actualStudents;
        });

        return {
            totalClasses: classes.length,
            totalSeats,
            totalOccupied,
            totalAvailable: totalSeats - totalOccupied
        };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                            <FaSchool className="text-xl sm:text-2xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Class Management</h1>
                            <p className="text-sm text-gray-600 hidden sm:block">Manage seats and capacity</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={fetchAllData}
                            disabled={actionLoading}
                            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                        >
                            <FaSync className="sm:mr-2" />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button
                            onClick={handleOpenAddDialog}
                            disabled={actionLoading}
                            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                        >
                            <FaPlus className="sm:mr-2" />
                            <span className="hidden sm:inline">Add Class</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Classes</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Seats</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalSeats}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Occupied</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalOccupied}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Available</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalAvailable}</p>
                </div>
            </div>

            {/* Classes List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Year</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Occupied</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Available</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Filled</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {classes.map((classItem) => {
                                const occupiedSeats = getStudentCountForClass(classItem.className, classItem.section);
                                const availableSeats = classItem.totalSeats - occupiedSeats;
                                const percentage = classItem.totalSeats > 0 ? (occupiedSeats / classItem.totalSeats) * 100 : 0;
                                
                                return (
                                    <tr key={classItem._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{classItem.className}</div>
                                            <div className="text-sm text-gray-500">Section {classItem.section}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm">{classItem.academicYear}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-gray-900">{occupiedSeats}</span>
                                            <span className="text-gray-500">/{classItem.totalSeats}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-semibold ${availableSeats === 0 ? 'text-red-600' : availableSeats < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                {availableSeats}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all ${
                                                            percentage >= 90 ? 'bg-red-500' :
                                                            percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{percentage.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenEditDialog(classItem)}
                                                    className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClass(classItem._id)}
                                                    className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-gray-200">
                    {classes.map((classItem) => {
                        const occupiedSeats = getStudentCountForClass(classItem.className, classItem.section);
                        const availableSeats = classItem.totalSeats - occupiedSeats;
                        const percentage = classItem.totalSeats > 0 ? (occupiedSeats / classItem.totalSeats) * 100 : 0;
                        
                        return (
                            <div key={classItem._id} className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{classItem.className}</h3>
                                        <p className="text-sm text-gray-500">Section {classItem.section} • {classItem.academicYear}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenEditDialog(classItem)}
                                            className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClass(classItem._id)}
                                            className="text-red-600 hover:bg-red-50 p-2 rounded"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                                    <div>
                                        <p className="text-xs text-gray-500">Occupied</p>
                                        <p className="font-semibold text-gray-900">{occupiedSeats}/{classItem.totalSeats}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Available</p>
                                        <p className={`font-semibold ${availableSeats === 0 ? 'text-red-600' : availableSeats < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {availableSeats}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Filled</p>
                                        <p className="font-semibold text-gray-900">{percentage.toFixed(0)}%</p>
                                    </div>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all ${
                                            percentage >= 90 ? 'bg-red-500' :
                                            percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {classes.length === 0 && (
                    <div className="text-center py-12">
                        <FaSchool className="mx-auto text-4xl text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
                        <button
                            onClick={handleOpenAddDialog}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Add First Class
                        </button>
                    </div>
                )}
            </div>

            {/* Add Dialog */}
            {openDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <h2 className="text-lg font-semibold text-gray-900">Add New Class</h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Name *
                                </label>
                                <input
                                    type="text"
                                    name="className"
                                    value={formData.className}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Class 1"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Seats *
                                    </label>
                                    <input
                                        type="number"
                                        name="totalSeats"
                                        value={formData.totalSeats}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section
                                    </label>
                                    <select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {sections.map(section => (
                                            <option key={section} value={section}>{section}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Academic Year *
                                </label>
                                <select
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {academicYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
                            <button 
                                onClick={handleCloseDialog}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddClass}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actionLoading ? 'Adding...' : 'Add Class'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Dialog */}
            {openEditDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <h2 className="text-lg font-semibold text-gray-900">Edit Class</h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.className}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Seats *
                                    </label>
                                    <input
                                        type="number"
                                        name="totalSeats"
                                        value={formData.totalSeats}
                                        onChange={handleInputChange}
                                        min={getStudentCountForClass(selectedClass?.className, selectedClass?.section) || 1}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {getStudentCountForClass(selectedClass?.className, selectedClass?.section)} occupied
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section
                                    </label>
                                    <select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {sections.map(section => (
                                            <option key={section} value={section}>{section}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Academic Year *
                                </label>
                                <select
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {academicYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
                            <button 
                                onClick={handleCloseDialog}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdateClass}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actionLoading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            {snackbar.open && (
                <div className={`fixed bottom-4 right-4 left-4 sm:left-auto p-4 rounded-lg shadow-lg max-w-sm ${
                    snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm">{snackbar.message}</span>
                        <button 
                            onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
                            className="hover:opacity-70"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TotalSeats;