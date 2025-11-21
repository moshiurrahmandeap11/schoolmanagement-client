import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCheck, FaFilter, FaPlus, FaSearch, FaTimes, FaTrash, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const TeachersLeave = ({ onBack }) => {
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [filterData, setFilterData] = useState({
        teacherId: '',
        status: ''
    });

    // Form data
    const [formData, setFormData] = useState({
        teacherId: '',
        startDate: '',
        endDate: '',
        reason: '',
        leaveType: 'casual'
    });

    // Dropdown data
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});

    // Status options
    const statusOptions = [
        { value: '', label: 'সব স্ট্যাটাস' },
        { value: 'pending', label: 'Pending', color: 'yellow' },
        { value: 'approved', label: 'Approved', color: 'green' },
        { value: 'rejected', label: 'Rejected', color: 'red' }
    ];

    // Leave type options
    const leaveTypeOptions = [
        { value: 'casual', label: 'ক্যাজুয়াল লিভ' },
        { value: 'medical', label: 'মেডিকেল লিভ' },
        { value: 'earned', label: 'আর্নড লিভ' },
        { value: 'maternity', label: 'মাতৃত্ব লিভ' },
        { value: 'paternity', label: 'পিতৃত্ব লিভ' },
        { value: 'emergency', label: 'জরুরী লিভ' },
        { value: 'other', label: 'অন্যান্য' }
    ];

    useEffect(() => {
        fetchLeaveApplications();
    }, []);

    useEffect(() => {
        if (filterData.teacherId || filterData.status) {
            fetchLeaveApplications();
        }
    }, [filterData]);

    useEffect(() => {
        if (searchTerm.length > 2) {
            searchTeachers();
        } else {
            setTeachers([]);
        }
    }, [searchTerm]);

    const fetchLeaveApplications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filterData.teacherId) params.append('teacherId', filterData.teacherId);
            if (filterData.status) params.append('status', filterData.status);

            const response = await axiosInstance.get(`/teacher-leave?${params}`);
            
            if (response.data.success) {
                setLeaveApplications(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching teacher leave applications:', error);
            showSweetAlert('error', 'শিক্ষক লিভ অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const searchTeachers = async () => {
        try {
            const params = new URLSearchParams();
            params.append('search', searchTerm);

            const response = await axiosInstance.get(`/teacher-leave/teachers/search?${params}`);
            
            if (response.data.success) {
                setTeachers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error searching teachers:', error);
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

    const handleTeacherSelect = (teacher) => {
        setFormData(prev => ({
            ...prev,
            teacherId: teacher._id
        }));
        setSearchTerm(teacher.name);
        setTeachers([]);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.teacherId) {
            newErrors.teacherId = 'শিক্ষক নির্বাচন করুন';
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
            const response = await axiosInstance.post('/teacher-leave', formData);

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                setShowAddForm(false);
                setFormData({
                    teacherId: '',
                    startDate: '',
                    endDate: '',
                    reason: '',
                    leaveType: 'casual'
                });
                setSearchTerm('');
                fetchLeaveApplications();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error submitting teacher leave application:', error);
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
                const response = await axiosInstance.patch(`/teacher-leave/${applicationId}/status`, {
                    status: status
                });

                if (response.data.success) {
                    showSweetAlert('success', response.data.message);
                    fetchLeaveApplications();
                }
            } catch (error) {
                console.error('Error updating teacher leave status:', error);
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
                const response = await axiosInstance.delete(`/teacher-leave/${applicationId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'লিভ অ্যাপ্লিকেশন সফলভাবে ডিলিট হয়েছে');
                    fetchLeaveApplications();
                }
            } catch (error) {
                console.error('Error deleting teacher leave application:', error);
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

    const getLeaveTypeLabel = (leaveType) => {
        const leaveTypeOption = leaveTypeOptions.find(opt => opt.value === leaveType);
        return leaveTypeOption ? leaveTypeOption.label : leaveType;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    const resetFilters = () => {
        setFilterData({
            teacherId: '',
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
                                নতুন শিক্ষক লিভ অ্যাপ্লিকেশন
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
                                        শিক্ষক লিভ অ্যাপ্লিকেশন তথ্য:
                                    </h3>
                                </div>

                                {/* Teacher Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শিক্ষক খুঁজুন *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="শিক্ষকের নাম, আইডি বা পদবী লিখুন..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        />
                                        <FaSearch className="absolute right-3 top-3.5 text-gray-400" />
                                    </div>
                                    {errors.teacherId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.teacherId}</p>
                                    )}

                                    {/* Teacher Dropdown */}
                                    {teachers.length > 0 && (
                                        <div className="mt-2 border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                                            {teachers.map((teacher) => (
                                                <div
                                                    key={teacher._id}
                                                    onClick={() => handleTeacherSelect(teacher)}
                                                    className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                            {teacher.photo ? (
                                                                <img 
                                                                    src={teacher.photo} 
                                                                    alt={teacher.name}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <FaUser className="text-purple-600 text-sm" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">
                                                                {teacher.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {teacher.designation} | ID: {teacher.teacherId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Leave Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        লিভের ধরন *
                                    </label>
                                    <select
                                        name="leaveType"
                                        value={formData.leaveType}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                    >
                                        {leaveTypeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

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
                            শিক্ষকদের লিভ ব্যবস্থাপনা
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teacher ID/Name
                                </label>
                                <input
                                    type="text"
                                    name="teacherId"
                                    value={filterData.teacherId}
                                    onChange={handleFilterChange}
                                    placeholder="Teacher ID or Name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                />
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
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <p className="text-gray-600 ml-3">শিক্ষক লিভ অ্যাপ্লিকেশন লোড হচ্ছে...</p>
                        </div>
                    ) : leaveApplications.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">👨‍🏫</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন শিক্ষক লিভ অ্যাপ্লিকেশন পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন শিক্ষক লিভ অ্যাপ্লিকেশন তৈরি করুন
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
                                    শিক্ষক লিভ অ্যাপ্লিকেশন তালিকা ({leaveApplications.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিক্ষক
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                পদবী
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                লিভের ধরন
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
                                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                            {application.teacher?.photo ? (
                                                                <img 
                                                                    src={application.teacher.photo} 
                                                                    alt={application.teacher.name}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <FaUser className="text-purple-600 text-sm" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">
                                                                {application.teacher?.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                ID: {application.teacher?.teacherId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                                                        {application.teacher?.designation}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                        {getLeaveTypeLabel(application.leaveType)}
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

export default TeachersLeave;