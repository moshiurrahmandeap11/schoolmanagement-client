import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axiosInstance, { baseImageURL } from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const OnlineApplication = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // Filter state
    const [filters, setFilters] = useState({
        status: '',
        sessionId: '',
        classId: '',
        fromDate: '',
        toDate: ''
    });

    // Fetch applications, sessions, and classes
    const fetchData = async () => {
        try {
            setLoading(true);
            const [applicationsRes, sessionsRes, classesRes] = await Promise.all([
                axiosInstance.get('/online-applications'),
                axiosInstance.get('/sessions'),
                axiosInstance.get('/class')
            ]);

            if (applicationsRes.data?.success) {
                setApplications(applicationsRes.data.data || []);
                setFilteredApplications(applicationsRes.data.data || []);
            }

            if (sessionsRes.data?.success) {
                setSessions(sessionsRes.data.data || []);
            }

            if (classesRes.data?.success) {
                setClasses(classesRes.data.data || []);
            }

        } catch (err) {
            setError('ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Apply filters
    const handleApplyFilters = () => {
        let filtered = applications;

        // Filter by status
        if (filters.status) {
            filtered = filtered.filter(app => app.status === filters.status);
        }

        // Filter by session
        if (filters.sessionId) {
            filtered = filtered.filter(app => app.sessionId === filters.sessionId);
        }

        // Filter by class
        if (filters.classId) {
            filtered = filtered.filter(app => app.classId === filters.classId);
        }

        // Filter by date range
        if (filters.fromDate) {
            const fromDate = new Date(filters.fromDate);
            filtered = filtered.filter(app => new Date(app.createdAt) >= fromDate);
        }

        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999); // End of the day
            filtered = filtered.filter(app => new Date(app.createdAt) <= toDate);
        }

        setFilteredApplications(filtered);
    };

    // Reset filters
    const handleResetFilters = () => {
        setFilters({
            status: '',
            sessionId: '',
            classId: '',
            fromDate: '',
            toDate: ''
        });
        setFilteredApplications(applications);
    };

    // Handle view application details
    const handleViewApplication = async (id) => {
        try {
            const response = await axiosInstance.get(`/online-applications/${id}`);
            if (response.data?.success) {
                setSelectedApplication(response.data.data);
                setShowModal(true);
            } else {
                setError('আবেদনের বিস্তারিত লোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('আবেদনের বিস্তারিত লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching application details:', err);
        }
    };

    // Handle delete application
    const handleDeleteApplication = async (id) => {
        if (!window.confirm('আপনি কি এই আবেদন ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/online-applications/${id}`);
            if (response.data && response.data.success) {
                fetchData(); // Refresh data
            } else {
                setError('আবেদন ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('আবেদন ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting application:', err);
        }
    };

    // Handle status update
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await axiosInstance.patch(`/online-applications/${id}/status`, {
                status: newStatus
            });
            if (response.data && response.data.success) {
                fetchData(); // Refresh data
            } else {
                setError('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
            console.error('Error updating status:', err);
        }
    };

    // Navigate to admission form
    const handleNewAdmission = () => {
        navigate('/admission-form');
    };

    // Format date in Bengali
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedApplication(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold ">
                                অনলাইন আবেদন ব্যবস্থাপনা
                            </h1>
                        </div>
                        <MainButton
                            onClick={handleNewAdmission}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন ভর্তি</span>
                        </MainButton>
                    </div>

                    {/* Filters */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    অবস্থান
                                </label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">সকল অবস্থা</option>
                                    <option value="draft">খসড়া</option>
                                    <option value="submitted">জমা দেওয়া</option>
                                    <option value="pending">বিচারাধীন</option>
                                    <option value="confirmed">নিশ্চিত</option>
                                    <option value="rejected">বাতিল</option>
                                </select>
                            </div>

                            {/* Session Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    সেশন
                                </label>
                                <select
                                    name="sessionId"
                                    value={filters.sessionId}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    <option value="">সকল সেশন</option>
                                    {sessions.map((session) => (
                                        <option key={session._id} value={session._id}>
                                            {session.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Class Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ক্লাস
                                </label>
                                <select
                                    name="classId"
                                    value={filters.classId}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    <option value="">সকল ক্লাস</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* From Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    name="fromDate"
                                    value={filters.fromDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                />
                            </div>

                            {/* To Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    name="toDate"
                                    value={filters.toDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                রিসেট
                            </button>
                            <MainButton
                                onClick={handleApplyFilters}
                                className='rounded-md'
                            >
                                Filter
                            </MainButton>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন আবেদন নেই</h3>
                                <p className="text-gray-500 mb-4">
                                    {applications.length === 0 
                                        ? 'এখনও কোন আবেদন জমা দেওয়া হয়নি' 
                                        : 'ফিল্টারের সাথে মিলিয়ে কোন আবেদন পাওয়া যায়নি'
                                    }
                                </p>
                                {applications.length === 0 && (
                                    <MainButton
                                        onClick={handleNewAdmission}
                                    >
                                        প্রথম আবেদন করুন
                                    </MainButton>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                পিতার নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেকশন
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেশন
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অবস্থান
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তারিখ
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কাজ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredApplications.map((application) => (
                                            <tr key={application._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {application.studentName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {application.fatherName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {application.className}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {application.sectionName || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {application.sessionName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={application.status}
                                                        onChange={(e) => handleStatusUpdate(application._id, e.target.value)}
                                                        className={`text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-[#1e90c9] ${
                                                            application.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                            application.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            application.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        <option value="draft">খসড়া</option>
                                                        <option value="submitted">জমা দেওয়া</option>
                                                        <option value="pending">বিচারাধীন</option>
                                                        <option value="confirmed">নিশ্চিত</option>
                                                        <option value="rejected">বাতিল</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(application.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => handleViewApplication(application._id)}
                                                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-1 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                                        >
                                                            দেখুন
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteApplication(application._id)}
                                                            className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-3 py-1 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                                                        >
                                                            ডিলিট
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Summary */}
                        {filteredApplications.length > 0 && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">{filteredApplications.length}</div>
                                        <div className="text-gray-600">মোট আবেদন</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {filteredApplications.filter(app => app.status === 'confirmed').length}
                                        </div>
                                        <div className="text-gray-600">নিশ্চিত</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {filteredApplications.filter(app => app.status === 'pending').length}
                                        </div>
                                        <div className="text-gray-600">বিচারাধীন</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {filteredApplications.filter(app => app.status === 'rejected').length}
                                        </div>
                                        <div className="text-gray-600">বাতিল</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {filteredApplications.filter(app => app.status === 'submitted').length}
                                        </div>
                                        <div className="text-gray-600">জমা দেওয়া</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Application Details Modal */}
            {showModal && selectedApplication && (
                <div className="fixed inset-0 bg-black/40 mt-10 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">
                                    আবেদন বিস্তারিত - {selectedApplication.applicationNo}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Student Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                        ছাত্রের তথ্য
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">ছাত্রের নাম</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.studentName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">পিতার নাম</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.fatherName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">মাতার নাম</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.motherName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">লিঙ্গ</label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {selectedApplication.gender === 'male' ? 'ছেলে' : 'মেয়ে'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">জন্ম তারিখ</label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {formatDate(selectedApplication.dateOfBirth)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                        একাডেমিক তথ্য
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">সেশন</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.sessionName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">ক্লাস</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.className}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">সেকশন</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.sectionName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">পূর্ববর্তী প্রতিষ্ঠান</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.previousInstitute}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">পূর্ববর্তী ফলাফল</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.previousResult}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                        যোগাযোগের তথ্য
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">অভিভাবকের মোবাইল</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.parentMobile}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">ঠিকানা</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.address}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">শহর</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.city}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">ডাকঘর</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.postOffice}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                        ডকুমেন্টস
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">জন্ম নিবন্ধন নম্বর</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.birthRegistrationNo}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">অভিভাবকের এনআইডি</label>
                                            <p className="text-sm text-gray-900 mt-1">{selectedApplication.parentNID}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">ছবি</label>
                                            {selectedApplication.image && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={`${baseImageURL}${selectedApplication.image}`} 
                                                        alt="Student" 
                                                        className="w-32 h-32 object-cover rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Application Status and Dates */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">আবেদন অবস্থা</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                            {selectedApplication.status === 'draft' ? 'খসড়া' :
                                             selectedApplication.status === 'submitted' ? 'জমা দেওয়া' :
                                             selectedApplication.status === 'pending' ? 'বিচারাধীন' :
                                             selectedApplication.status === 'confirmed' ? 'নিশ্চিত' : 'বাতিল'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">আবেদনের তারিখ</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {formatDate(selectedApplication.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">আবেদন নম্বর</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                            {selectedApplication.applicationNo}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineApplication;