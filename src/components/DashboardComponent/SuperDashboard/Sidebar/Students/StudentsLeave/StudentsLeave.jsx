import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCheck, FaFilter, FaPlus, FaSearch, FaTimes, FaTrash, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const StudentsLeave = ({ onBack }) => {
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [filterData, setFilterData] = useState({
        studentId: '',
        classId: '',
        status: ''
    });

    // Form data
    const [formData, setFormData] = useState({
        studentId: '',
        classId: '',
        startDate: '',
        endDate: '',
        reason: ''
    });

    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});

    // Status options
    const statusOptions = [
        { value: '', label: 'সব স্ট্যাটাস' },
        { value: 'pending', label: 'Pending', color: 'yellow' },
        { value: 'approved', label: 'Approved', color: 'green' },
        { value: 'rejected', label: 'Rejected', color: 'red' }
    ];

    useEffect(() => {
        fetchLeaveApplications();
        fetchClasses();
    }, []);

    useEffect(() => {
        if (filterData.classId || filterData.studentId || filterData.status) {
            fetchLeaveApplications();
        }
    }, [filterData]);

    useEffect(() => {
        if (searchTerm.length > 2) {
            searchStudents();
        } else {
            setStudents([]);
        }
    }, [searchTerm, formData.classId]);

    const fetchLeaveApplications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filterData.studentId) params.append('studentId', filterData.studentId);
            if (filterData.classId) params.append('classId', filterData.classId);
            if (filterData.status) params.append('status', filterData.status);

            const response = await axiosInstance.get(`/student-leave?${params}`);
            
            if (response.data.success) {
                setLeaveApplications(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching leave applications:', error);
            showSweetAlert('error', 'লিভ অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axiosInstance.get('/class');
            if (response.data.success) {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const searchStudents = async () => {
        try {
            const params = new URLSearchParams();
            params.append('search', searchTerm);
            if (formData.classId) params.append('classId', formData.classId);

            const response = await axiosInstance.get(`/student-leave/students/search?${params}`);
            
            if (response.data.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error('Error searching students:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleStudentSelect = (student) => {
        setFormData(prev => ({
            ...prev,
            studentId: student._id,
            classId: student.classId
        }));
        setSearchTerm(student.name);
        setStudents([]);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.studentId) {
            newErrors.studentId = 'শিক্ষার্থী নির্বাচন করুন';
        }
        
        if (!formData.startDate) {
            newErrors.startDate = 'শুরুর তারিখ নির্বাচন করুন';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'শেষ তারিখ নির্বাচন করুন';
        }

        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                newErrors.endDate = 'শেষ তারিখ শুরুর তারিখের পরে হতে হবে';
            }
        }

        if (!formData.reason.trim()) {
            newErrors.reason = 'কারণ লিখুন';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('/student-leave', formData);

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                setShowAddForm(false);
                setFormData({
                    studentId: '',
                    classId: '',
                    startDate: '',
                    endDate: '',
                    reason: ''
                });
                setSearchTerm('');
                fetchLeaveApplications();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error submitting leave application:', error);
            const errorMessage = error.response?.data?.message || 'লিভ অ্যাপ্লিকেশন জমা দিতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, status) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: `আপনি এই লিভ অ্যাপ্লিকেশন ${status === 'approved' ? 'অনুমোদন' : 'বাতিল'} করতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: status === 'approved' ? '#10B981' : '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: status === 'approved' ? 'অনুমোদন করুন' : 'বাতিল করুন',
            cancelButtonText: 'বাতিল'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.patch(`/student-leave/${applicationId}/status`, {
                    status: status
                });

                if (response.data.success) {
                    showSweetAlert('success', response.data.message);
                    fetchLeaveApplications();
                }
            } catch (error) {
                console.error('Error updating leave status:', error);
                showSweetAlert('error', 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleDelete = async (applicationId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই লিভ অ্যাপ্লিকেশন ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/student-leave/${applicationId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'লিভ অ্যাপ্লিকেশন সফলভাবে ডিলিট হয়েছে');
                    fetchLeaveApplications();
                }
            } catch (error) {
                console.error('Error deleting leave application:', error);
                showSweetAlert('error', 'লিভ অ্যাপ্লিকেশন ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const getStatusColor = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption ? statusOption.color : 'gray';
    };

    const getStatusLabel = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption ? statusOption.label : status;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    const resetFilters = () => {
        setFilterData({
            studentId: '',
            classId: '',
            status: ''
        });
    };

    if (showAddForm) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between p-4 sm:p-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <FaArrowLeft className="text-xl text-gray-600" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">
                                নতুন লিভ অ্যাপ্লিকেশন
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Add Form */}
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-full mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                    <h3 className="text-lg font-semibold text-[#1e90c9] mb-2">
                                        লিভ অ্যাপ্লিকেশন তথ্য:
                                    </h3>
                                </div>

                                {/* Student Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শিক্ষার্থী খুঁজুন *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="শিক্ষার্থীর নাম বা আইডি লিখুন..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-[#1e90c9] focus:border-transparent transition-all"
                                        />
                                        <FaSearch className="absolute right-3 top-3.5 text-gray-400" />
                                    </div>
                                    {errors.studentId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.studentId}</p>
                                    )}

                                    {/* Student Dropdown */}
                                    {students.length > 0 && (
                                        <div className="mt-2 border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                                            {students.map((student) => (
                                                <div
                                                    key={student._id}
                                                    onClick={() => handleStudentSelect(student)}
                                                    className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <FaUser className="text-blue-600 text-sm" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">
                                                                {student.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                ID: {student.studentId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Class (Auto-filled but display only) */}
                                {formData.classId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ক্লাস
                                        </label>
                                        <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                                            <p className="text-gray-800">
                                                {classes.find(c => c._id === formData.classId)?.name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Date Range */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            শুরুর তারিখ *
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleFormChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                                errors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.startDate && (
                                            <p className="mt-2 text-sm text-red-600">{errors.startDate}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            শেষ তারিখ *
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleFormChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                                errors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.endDate && (
                                            <p className="mt-2 text-sm text-red-600">{errors.endDate}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        কারণ *
                                    </label>
                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleFormChange}
                                        rows="4"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="লিভের কারণ বিস্তারিত লিখুন..."
                                    />
                                    {errors.reason && (
                                        <p className="mt-2 text-sm text-red-600">{errors.reason}</p>
                                    )}
                                </div>

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-600 text-sm">{errors.submit}</p>
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        disabled={loading}
                                        className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        বাতিল করুন
                                    </button>
                                    <MainButton
                                        type="submit"
                                        disabled={loading}
                                        className="rounded-md"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                জমা দেওয়া হচ্ছে...
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus className="text-sm mr-2" />
                                                লিভ অ্যাপ্লিকেশন জমা দিন
                                            </>
                                        )}
                                    </MainButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            শিক্ষার্থীদের লিভ ব্যবস্থাপনা
                        </h1>
                    </div>
                    <MainButton
                        onClick={() => setShowAddForm(true)}
                    >
                        <FaPlus className="text-sm mr-2" />
                        নতুন লিভ অ্যাপ্লিকেশন
                    </MainButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FaFilter className="text-[#1e90c9]" />
                                ফিল্টার
                            </h3>
                            <button
                                onClick={resetFilters}
                                className="text-sm text-gray-600 hover:text-gray-800"
                            >
                                রিসেট ফিল্টার
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student ID
                                </label>
                                <input
                                    type="text"
                                    name="studentId"
                                    value={filterData.studentId}
                                    onChange={handleFilterChange}
                                    placeholder="Student ID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class
                                </label>
                                <select
                                    name="classId"
                                    value={filterData.classId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    <option value="">সব ক্লাস</option>
                                    {classes.map((classItem) => (
                                        <option key={classItem._id} value={classItem._id}>
                                            {classItem.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={filterData.status}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader></Loader>
                        </div>
                    ) : leaveApplications.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">📝</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন লিভ অ্যাপ্লিকেশন পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন লিভ অ্যাপ্লিকেশন তৈরি করুন
                            </p>
                            <MainButton
                                onClick={() => setShowAddForm(true)}
                            >
                                <FaPlus className="text-sm mr-2" />
                                নতুন লিভ অ্যাপ্লিকেশন
                            </MainButton>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    লিভ অ্যাপ্লিকেশন তালিকা ({leaveApplications.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিক্ষার্থী
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তারিখসমূহ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কারণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                স্ট্যাটাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {leaveApplications.map((application) => (
                                            <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            {application.student?.photo ? (
                                                                <img 
                                                                    src={application.student.photo} 
                                                                    alt={application.student.name}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <FaUser className="text-blue-600 text-sm" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">
                                                                {application.student?.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                ID: {application.student?.studentId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                        {application.class?.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-800">
                                                        {formatDate(application.startDate)} - {formatDate(application.endDate)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {application.totalDays} দিন
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div 
                                                        className="text-sm text-gray-600 max-w-xs truncate"
                                                        title={application.reason}
                                                    >
                                                        {application.reason}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(application.status)}-100 text-${getStatusColor(application.status)}-800`}>
                                                        {getStatusLabel(application.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {application.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(application._id, 'approved')}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Approve"
                                                                >
                                                                    <FaCheck className="text-sm" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <FaTimes className="text-sm" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(application._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentsLeave;