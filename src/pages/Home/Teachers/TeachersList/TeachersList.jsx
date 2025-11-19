import { useEffect, useState } from 'react';
import Loader from '../../../../components/sharedItems/Loader/Loader';
import axiosInstance, { baseImageURL } from '../../../../hooks/axiosInstance/axiosInstance';


const TeachersList = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/teacher-list');
            
            if (response.data.success) {
                setTeachers(response.data.data);
            } else {
                setError('Failed to load teachers');
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            setError('Failed to load teachers list');
        } finally {
            setLoading(false);
        }
    };

    // Filter teachers based on search and filters
    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSubject = !filterSubject || teacher.subject === filterSubject;
        const matchesDepartment = !filterDepartment || teacher.department === filterDepartment;
        
        return matchesSearch && matchesSubject && matchesDepartment;
    });

    // Get unique subjects and departments for filters
    const subjects = [...new Set(teachers.map(teacher => teacher.subject).filter(Boolean))];
    const departments = [...new Set(teachers.map(teacher => teacher.department).filter(Boolean))];

    if (loading) {
        return <Loader></Loader>
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Teachers</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button
                            onClick={fetchTeachers}
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
                        শিক্ষকবৃন্দের তালিকা 
                    </h1>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">{teachers.length}</div>
                        <div className="text-sm text-gray-600">Total Teachers</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                            {teachers.filter(t => t.isActive).length}
                        </div>
                        <div className="text-sm text-gray-600">Active Teachers</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">{subjects.length}</div>
                        <div className="text-sm text-gray-600">Subjects</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">{departments.length}</div>
                        <div className="text-sm text-gray-600">Departments</div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Teachers
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name, subject, or designation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            />
                        </div>

                        {/* Subject Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Subject
                            </label>
                            <select
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>

                        {/* Department Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Department
                            </label>
                            <select
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 flex justify-between items-center">
                    <p className="text-gray-600">
                        Showing {filteredTeachers.length} of {teachers.length} teachers
                    </p>
                    {(searchTerm || filterSubject || filterDepartment) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterSubject('');
                                setFilterDepartment('');
                            }}
                            className="text-[#1e90c9]  text-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Teachers Grid */}
                {filteredTeachers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Teachers Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterSubject || filterDepartment 
                                ? 'No teachers match your search criteria.' 
                                : 'No teachers available at the moment.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTeachers.map((teacher) => (
                            <div 
                                key={teacher._id} 
                                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {/* Teacher Photo */}
                                <div className="relative h-48 bg-linear-to-br from-blue-50 to-indigo-100">
                                    {teacher.photo ? (
                                        <img
                                            src={`${baseImageURL}${teacher.photo}`}
                                            alt={teacher.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-6xl text-blue-300">
                                                👨‍🏫
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Status Badge */}
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                                        teacher.isActive 
                                            ? 'bg-[#1e90c9] text-white' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {teacher.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                {/* Teacher Info */}
                                <div className="p-4">
                                    {/* Name and Designation */}
                                    <div className="mb-3">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                                            {teacher.name}
                                        </h3>
                                        {teacher.designation && (
                                            <p className="text-sm text-[#1e90c9] font-medium">
                                                {teacher.designation}
                                            </p>
                                        )}
                                    </div>

                                    {/* Subject and Department */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <span className="font-medium mr-2">Subject:</span>
                                            <span className="text-gray-800">{teacher.subject}</span>
                                        </div>
                                        {teacher.department && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="font-medium mr-2">Department:</span>
                                                <span className="text-gray-800">{teacher.department}</span>
                                            </div>
                                        )}
                                        {teacher.experience && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="font-medium mr-2">Experience:</span>
                                                <span className="text-gray-800">{teacher.experience} years</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="border-t border-gray-100 pt-3 space-y-2">
                                        {teacher.mobile && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">📱</span>
                                                <span>{teacher.mobile}</span>
                                            </div>
                                        )}
                                        {teacher.email && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">✉️</span>
                                                <span className="truncate">{teacher.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Qualifications */}
                                    {teacher.qualifications && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                <span className="font-medium">Qualifications:</span> {teacher.qualifications}
                                            </p>
                                        </div>
                                    )}

                                    {/* Additional Info */}
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {teacher.gender && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                                {teacher.gender}
                                            </span>
                                        )}
                                        {teacher.bloodGroup && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                                {teacher.bloodGroup}
                                            </span>
                                        )}
                                    </div>

                                    {/* Joining Date */}
                                    {teacher.joiningDate && (
                                        <div className="mt-3 text-xs text-gray-500">
                                            Joined: {new Date(teacher.joiningDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mobile Friendly Cards (Alternative Layout) */}
                {filteredTeachers.length > 0 && (
                    <div className="lg:hidden mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Teachers List</h3>
                        <div className="space-y-4">
                            {filteredTeachers.map((teacher) => (
                                <div 
                                    key={teacher._id} 
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                                >
                                    <div className="flex items-start space-x-4">
                                        {/* Teacher Avatar */}
                                        <div className="shrink-0">
                                            {teacher.photo ? (
                                                <img
                                                    src={teacher.photo}
                                                    alt={teacher.name}
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg">
                                                        {teacher.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Teacher Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                                {teacher.name}
                                            </h4>
                                            <p className="text-sm text-blue-600 mb-1">
                                                {teacher.designation || 'Teacher'}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {teacher.subject} {teacher.department && `• ${teacher.department}`}
                                            </p>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                {teacher.mobile && <span>📱 {teacher.mobile}</span>}
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    teacher.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {teacher.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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

export default TeachersList;