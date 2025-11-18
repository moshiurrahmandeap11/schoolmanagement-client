import { useEffect, useState } from 'react';
import {
    FaChair,
    FaSchool,
    FaSearch,
    FaSync,
    FaUserCheck,
    FaUserPlus,
    FaUsers
} from 'react-icons/fa';
import axiosInstance from '../../../../hooks/axiosInstance/axiosInstance';


const SeatNumbers = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredClasses, setFilteredClasses] = useState([]);

    // Fetch all data
    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            // Fetch classes
            const classesResponse = await axiosInstance.get('/total-seats');
            if (classesResponse.data.success) {
                setClasses(classesResponse.data.data);
            }

            // Fetch students
            const studentsResponse = await axiosInstance.get('/students');
            if (studentsResponse.data.success) {
                setStudents(studentsResponse.data.data);
            }

        } catch (error) {
            console.error('Fetch data error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Filter classes based on search
    useEffect(() => {
        if (searchTerm) {
            const filtered = classes.filter(cls => 
                cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cls.section.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClasses(filtered);
        } else {
            setFilteredClasses(classes);
        }
    }, [searchTerm, classes]);

    // Get students count for a specific class and section
    const getStudentCountForClass = (className, section) => {
        return students.filter(student => 
            student.class === className && 
            student.section === section &&
            student.status === 'active'
        ).length;
    };

    // Get class-wise student details
    const getClassStudentDetails = (className, section) => {
        return students.filter(student => 
            student.class === className && 
            student.section === section &&
            student.status === 'active'
        );
    };

    // Calculate utilization percentage
    const getUtilizationPercentage = (occupiedSeats, totalSeats) => {
        if (totalSeats === 0) return 0;
        return (occupiedSeats / totalSeats) * 100;
    };

    // Get status color
    const getStatusColor = (availableSeats) => {
        if (availableSeats === 0) return 'bg-red-100 text-red-800 border-red-200';
        if (availableSeats < 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-[#1e90c9] text-white border-green-200';
    };

    // Get status text
    const getStatusText = (availableSeats) => {
        if (availableSeats === 0) return 'Full';
        if (availableSeats < 5) return 'Limited';
        return 'Available';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading seat information...</p>
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
                                <FaChair className="text-2xl text-[#1e90c9]" />
                            </div>
                            <div className="ml-4">
                                <h1 className="text-2xl font-bold text-gray-900">Seat Information</h1>
                                <p className="text-gray-600">Class-wise student count and available seats</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search classes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={fetchAllData}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <FaSync className="mr-2" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <FaSchool className="text-[#1e90c9] text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <FaUsers className="text-[#1e90c9] text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {students.filter(s => s.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <FaUserCheck className="text-[#1e90c9] text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Available Seats</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {classes.reduce((sum, cls) => sum + cls.availableSeats, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredClasses.map((classItem) => {
                        const studentCount = getStudentCountForClass(classItem.className, classItem.section);
                        const classStudents = getClassStudentDetails(classItem.className, classItem.section);
                        const utilization = getUtilizationPercentage(classItem.occupiedSeats, classItem.totalSeats);
                        
                        return (
                            <div key={classItem._id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                {/* Class Header */}
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {classItem.className}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Section {classItem.section}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classItem.availableSeats)}`}>
                                            {getStatusText(classItem.availableSeats)}
                                        </span>
                                    </div>
                                    {classItem.description && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            {classItem.description}
                                        </p>
                                    )}
                                </div>

                                {/* Class Details */}
                                <div className="p-4">
                                    {/* Seats Information */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Total Seats:</span>
                                            <span className="font-semibold text-gray-900">{classItem.totalSeats}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Occupied Seats:</span>
                                            <span className="font-semibold text-blue-600">{classItem.occupiedSeats}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Available Seats:</span>
                                            <span className={`font-semibold ${
                                                classItem.availableSeats === 0 ? 'text-red-600' : 
                                                classItem.availableSeats < 5 ? 'text-yellow-600' : 
                                                'text-green-600'
                                            }`}>
                                                {classItem.availableSeats}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Active Students:</span>
                                            <span className="font-semibold text-purple-600">{studentCount}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Seat Utilization</span>
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

                                    {/* Student List Preview */}
                                    {classStudents.length > 0 && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Students:</span>
                                                <span className="text-xs text-gray-500">{classStudents.length} enrolled</span>
                                            </div>
                                            <div className="space-y-1 max-h-20 overflow-y-auto">
                                                {classStudents.slice(0, 5).map((student, index) => (
                                                    <div key={student._id} className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-600 truncate flex-1">
                                                            {index + 1}. {student.name}
                                                        </span>
                                                        <span className="text-gray-400 ml-2">Roll: {student.roll}</span>
                                                    </div>
                                                ))}
                                                {classStudents.length > 5 && (
                                                    <div className="text-xs text-gray-500 text-center">
                                                        +{classStudents.length - 5} more students
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {classStudents.length === 0 && (
                                        <div className="mt-4 text-center py-3 bg-gray-50 rounded-lg">
                                            <FaUserPlus className="mx-auto text-gray-400 text-lg mb-1" />
                                            <p className="text-xs text-gray-500">No students enrolled</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Academic Year: {classItem.academicYear}</span>
                                        <span>
                                            {classItem.availableSeats === 0 ? 'No seats left' : 
                                             `${classItem.availableSeats} seats available`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredClasses.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <FaSchool className="mx-auto text-4xl text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'No classes found' : 'No classes available'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm ? 'Try adjusting your search terms' : 'Start by adding classes to the system'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => window.location.href = '/total-seats'} // Adjust this URL as needed
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Classes
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeatNumbers;