import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCheck, FaEdit, FaFilter, FaPhone, FaPlus, FaTimes, FaTrash, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const EmployeeLeave = ({ onBack }) => {
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [filterData, setFilterData] = useState({
        employeeId: '',
        status: '',
        leaveType: ''
    });

    // Form data
    const [formData, setFormData] = useState({
        employeeName: '',
        employeeId: '',
        designation: '',
        department: '',
        contactNumber: '',
        address: '',
        startDate: '',
        endDate: '',
        reason: '',
        leaveType: 'casual'
    });

    const [errors, setErrors] = useState({});
    const [stats, setStats] = useState(null);

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
        { value: 'sick', label: 'অসুস্থতার ছুটি' },
        { value: 'annual', label: 'বার্ষিক ছুটি' },
        { value: 'other', label: 'অন্যান্য' }
    ];

    // Department options
    const departmentOptions = [
        'Administration',
        'Academic',
        'Accounts',
        'IT',
        'Maintenance',
        'Security',
        'Transport',
        'Library',
        'Laboratory',
        'Other'
    ];

    useEffect(() => {
        fetchLeaveApplications();
        fetchStats();
    }, []);

    useEffect(() => {
        if (filterData.employeeId || filterData.status || filterData.leaveType) {
            fetchLeaveApplications();
        }
    }, [filterData]);

    const fetchLeaveApplications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filterData.employeeId) params.append('employeeId', filterData.employeeId);
            if (filterData.status) params.append('status', filterData.status);
            if (filterData.leaveType) params.append('leaveType', filterData.leaveType);

            const response = await axiosInstance.get(`/employee-leave?${params}`);
            
            if (response.data.success) {
                setLeaveApplications(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching employee leave applications:', error);
            showSweetAlert('error', 'কর্মচারী লিভ অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/employee-leave/stats/summary');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
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

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.employeeName.trim()) {
            newErrors.employeeName = 'কর্মচারীর নাম প্রয়োজন';
        }
        
        if (!formData.employeeId.trim()) {
            newErrors.employeeId = 'কর্মচারী আইডি প্রয়োজন';
        }

        if (!formData.designation.trim()) {
            newErrors.designation = 'পদবী প্রয়োজন';
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
            const url = editingLeave ? `/employee-leave/${editingLeave._id}` : '/employee-leave';
            const method = editingLeave ? 'put' : 'post';

            const response = await axiosInstance[method](url, formData);

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                setShowAddForm(false);
                resetForm();
                fetchLeaveApplications();
                fetchStats();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error submitting employee leave application:', error);
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
                const response = await axiosInstance.patch(`/employee-leave/${applicationId}/status`, {
                    status: status
                });

                if (response.data.success) {
                    showSweetAlert('success', response.data.message);
                    fetchLeaveApplications();
                    fetchStats();
                }
            } catch (error) {
                console.error('Error updating employee leave status:', error);
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
                const response = await axiosInstance.delete(`/employee-leave/${applicationId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'লিভ অ্যাপ্লিকেশন সফলভাবে ডিলিট হয়েছে');
                    fetchLeaveApplications();
                    fetchStats();
                }
            } catch (error) {
                console.error('Error deleting employee leave application:', error);
                showSweetAlert('error', 'লিভ অ্যাপ্লিকেশন ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleEdit = (application) => {
        setEditingLeave(application);
        setFormData({
            employeeName: application.employeeName,
            employeeId: application.employeeId,
            designation: application.designation,
            department: application.department,
            contactNumber: application.contactNumber,
            address: application.address,
            startDate: new Date(application.startDate).toISOString().split('T')[0],
            endDate: new Date(application.endDate).toISOString().split('T')[0],
            reason: application.reason,
            leaveType: application.leaveType
        });
        setShowAddForm(true);
    };

    const resetForm = () => {
        setFormData({
            employeeName: '',
            employeeId: '',
            designation: '',
            department: '',
            contactNumber: '',
            address: '',
            startDate: '',
            endDate: '',
            reason: '',
            leaveType: 'casual'
        });
        setEditingLeave(null);
        setErrors({});
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
            employeeId: '',
            status: '',
            leaveType: ''
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
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetForm();
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <FaArrowLeft className="text-xl text-gray-600" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {editingLeave ? 'কর্মচারী লিভ এডিট করুন' : 'নতুন কর্মচারী লিভ অ্যাপ্লিকেশন'}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Add Form */}
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-full mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                                    <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                                        কর্মচারী লিভ অ্যাপ্লিকেশন তথ্য:
                                    </h3>
                                    <p className="text-sm text-indigo-600">
                                        {editingLeave ? 'কর্মচারী লিভ অ্যাপ্লিকেশন এডিট করুন' : 'নতুন কর্মচারী লিভ অ্যাপ্লিকেশন তৈরি করুন'}
                                    </p>
                                </div>

                                {/* Employee Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            কর্মচারীর নাম *
                                        </label>
                                        <input
                                            type="text"
                                            name="employeeName"
                                            value={formData.employeeName}
                                            onChange={handleFormChange}
                                            placeholder="কর্মচারীর পুরো নাম"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                                                errors.employeeName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.employeeName && (
                                            <p className="mt-2 text-sm text-red-600">{errors.employeeName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            কর্মচারী আইডি *
                                        </label>
                                        <input
                                            type="text"
                                            name="employeeId"
                                            value={formData.employeeId}
                                            onChange={handleFormChange}
                                            placeholder="কর্মচারী আইডি"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                                                errors.employeeId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.employeeId && (
                                            <p className="mt-2 text-sm text-red-600">{errors.employeeId}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            পদবী *
                                        </label>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleFormChange}
                                            placeholder="পদবী"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                                                errors.designation ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.designation && (
                                            <p className="mt-2 text-sm text-red-600">{errors.designation}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            বিভাগ
                                        </label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">বিভাগ নির্বাচন করুন</option>
                                            {departmentOptions.map((dept) => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            যোগাযোগ নম্বর
                                        </label>
                                        <input
                                            type="text"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleFormChange}
                                            placeholder="মোবাইল নম্বর"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            লিভের ধরন *
                                        </label>
                                        <select
                                            name="leaveType"
                                            value={formData.leaveType}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        >
                                            {leaveTypeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ঠিকানা
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleFormChange}
                                        rows="2"
                                        placeholder="বর্তমান ঠিকানা"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
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
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
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
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
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
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
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
                                        onClick={() => {
                                            setShowAddForm(false);
                                            resetForm();
                                        }}
                                        disabled={loading}
                                        className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        বাতিল করুন
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                {editingLeave ? 'আপডেট হচ্ছে...' : 'জমা দেওয়া হচ্ছে...'}
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus className="text-sm" />
                                                {editingLeave ? 'আপডেট করুন' : 'লিভ অ্যাপ্লিকেশন জমা দিন'}
                                            </>
                                        )}
                                    </button>
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
                            কর্মচারী লিভ ব্যবস্থাপনা
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <FaPlus className="text-sm" />
                        নতুন লিভ অ্যাপ্লিকেশন
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Statistics Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                                <div className="text-3xl font-bold text-indigo-600">{stats.totalApplications}</div>
                                <div className="text-sm text-gray-600">মোট আবেদন</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                                <div className="text-sm text-gray-600">Pending</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                                <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                                <div className="text-sm text-gray-600">Approved</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                                <div className="text-sm text-gray-600">Rejected</div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FaFilter className="text-indigo-600" />
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
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    name="employeeId"
                                    value={filterData.employeeId}
                                    onChange={handleFilterChange}
                                    placeholder="Employee ID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Leave Type
                                </label>
                                <select
                                    name="leaveType"
                                    value={filterData.leaveType}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">সব ধরনের লিভ</option>
                                    {leaveTypeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="text-gray-600 ml-3">কর্মচারী লিভ অ্যাপ্লিকেশন লোড হচ্ছে...</p>
                        </div>
                    ) : leaveApplications.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">👨‍💼</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন কর্মচারী লিভ অ্যাপ্লিকেশন পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন কর্মচারী লিভ অ্যাপ্লিকেশন তৈরি করুন
                            </p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                নতুন লিভ অ্যাপ্লিকেশন
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    কর্মচারী লিভ অ্যাপ্লিকেশন তালিকা ({leaveApplications.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কর্মচারী
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                পদবী/বিভাগ
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
                                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                            <FaUser className="text-indigo-600 text-sm" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">
                                                                {application.employeeName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                ID: {application.employeeId}
                                                            </p>
                                                            {application.contactNumber && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                                    <FaPhone className="text-xs" />
                                                                    {application.contactNumber}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                                                            {application.designation}
                                                        </span>
                                                        {application.department && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {application.department}
                                                            </p>
                                                        )}
                                                    </div>
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
                                                                <button
                                                                    onClick={() => handleEdit(application)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <FaEdit className="text-sm" />
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

export default EmployeeLeave;