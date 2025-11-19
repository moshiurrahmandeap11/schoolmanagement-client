import { useEffect, useState } from 'react';
import { FaFilter, FaPhone, FaSearch, FaUserGraduate } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/students');
            
            if (response.data.success) {
                setStudents(response.data.data || []);
            } else {
                showSweetAlert('error', 'শিক্ষার্থী লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            showSweetAlert('error', 'শিক্ষার্থী লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const showSweetAlert = (icon, title, text = '') => {
        Swal.fire({
            icon,
            title,
            text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    // Filter students based on search and filters
    const filteredStudents = students.filter(student => {
        const matchesSearch = 
            student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.mobile?.includes(searchTerm);

        const matchesClass = !selectedClass || student.class?._id === selectedClass;
        const matchesSession = !selectedSession || student.session?._id === selectedSession;

        return matchesSearch && matchesClass && matchesSession;
    });

    // Get unique classes and sessions from students data
    const uniqueClasses = [...new Map(students
        .filter(student => student.class)
        .map(student => [student.class._id, student.class])).values()];

    const uniqueSessions = [...new Map(students
        .filter(student => student.session)
        .map(student => [student.session._id, student.session])).values()];

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedClass('');
        setSelectedSession('');
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <FaUserGraduate className="text-[#1e90c9]" />
                                শিক্ষার্থী তালিকা
                            </h1>
                            <p className="text-gray-600 mt-2">
                                মোট শিক্ষার্থী: {students.length} জন
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                        {/* Search Input */}
                        <div className="lg:col-span-2">
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                খুঁজুন
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                    placeholder="নাম, আইডি, পিতার নাম বা মোবাইল নম্বর লিখুন..."
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Class Filter */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                ক্লাস
                            </label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                            >
                                <option value="">সকল ক্লাস</option>
                                {uniqueClasses.map(classItem => (
                                    <option key={classItem._id} value={classItem._id}>
                                        {classItem.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Session Filter */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                সেশন
                            </label>
                            <select
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                            >
                                <option value="">সকল সেশন</option>
                                {uniqueSessions.map(session => (
                                    <option key={session._id} value={session._id}>
                                        {session.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                        >
                            <FaFilter className="text-sm" />
                            ফিল্টার সরান
                        </button>
                        <div className="text-sm text-gray-600 flex items-center">
                            পাওয়া গেছে: {filteredStudents.length} জন শিক্ষার্থী
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                    {/* Loading State */}
                    {loading && (
                        <Loader></Loader>
                    )}

                    {/* Empty State */}
                    {!loading && filteredStudents.length === 0 && (
                        <div className="p-8 text-center">
                            <FaUserGraduate className="mx-auto text-4xl text-gray-400 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন শিক্ষার্থী পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {searchTerm || selectedClass || selectedSession 
                                    ? 'আপনার ফিল্টারের সাথে মিলছে না' 
                                    : 'কোন শিক্ষার্থী রেজিস্ট্রেশন করা হয়নি'
                                }
                            </p>
                        </div>
                    )}

                    {/* Students Table */}
                    {!loading && filteredStudents.length > 0 && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিক্ষার্থীর নাম
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Student ID
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                পিতার নাম
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                মোবাইল
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেশন
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentStudents.map((student) => (
                                            <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {student.photo ? (
                                                            <img 
                                                                src={`${axiosInstance.defaults.baseURL}${student.photo}`} 
                                                                alt={student.name}
                                                                className="w-10 h-10 rounded-full object-cover border"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ${student.photo ? 'hidden' : 'flex'}`}>
                                                            <span className="text-blue-600 text-lg">👤</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                {student.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                        {student.studentId}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-700 font-medium">
                                                        {student.class?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-700">
                                                        {student.fatherName || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <FaPhone className="text-gray-400" />
                                                        <span className="text-gray-700 font-medium">
                                                            {student.mobile || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-700">
                                                        {student.session?.name || 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            পাতা {currentPage} এর {totalPages} - মোট {filteredStudents.length} জন
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                পূর্ববর্তী
                                            </button>
                                            {[...Array(totalPages)].map((_, index) => (
                                                <button
                                                    key={index + 1}
                                                    onClick={() => paginate(index + 1)}
                                                    className={`px-4 py-2 border rounded-lg transition-colors ${
                                                        currentPage === index + 1
                                                            ? 'bg-blue-500 text-white border-blue-500'
                                                            : 'border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                পরবর্তী
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Students;