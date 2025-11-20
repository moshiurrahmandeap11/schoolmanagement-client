import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';


const AddNewSession = ({ onBack, onSuccess, editData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        isCurrent: false,
        startDate: '',
        endDate: '',
        totalWorkingDays: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name,
                isCurrent: editData.isCurrent,
                startDate: editData.startDate.split('T')[0],
                endDate: editData.endDate.split('T')[0],
                totalWorkingDays: editData.totalWorkingDays.toString(),
                description: editData.description || ''
            });
        }
    }, [editData]);

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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Calculate working days if both dates are selected
        if ((name === 'startDate' || name === 'endDate') && formData.startDate && formData.endDate) {
            calculateWorkingDays();
        }
    };

    const calculateWorkingDays = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            
            if (start <= end) {
                const timeDiff = end.getTime() - start.getTime();
                const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Including both start and end dates
                
                setFormData(prev => ({
                    ...prev,
                    totalWorkingDays: dayDiff.toString()
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'সেশনের নাম প্রয়োজন';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'শুরু তারিখ প্রয়োজন';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'শেষ তারিখ প্রয়োজন';
        }

        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            
            if (start > end) {
                newErrors.endDate = 'শেষ তারিখ শুরু তারিখের পরে হতে হবে';
            }
        }

        if (!formData.totalWorkingDays || parseInt(formData.totalWorkingDays) <= 0) {
            newErrors.totalWorkingDays = 'কার্যদিবস প্রয়োজন';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            
            const url = editData ? `/sessions/${editData._id}` : '/sessions';
            const method = editData ? 'put' : 'post';

            const response = await axiosInstance[method](url, formData);

            if (response.data.success) {
                showSweetAlert('success', 
                    editData ? 'সেশন সফলভাবে আপডেট হয়েছে!' : 'সেশন সফলভাবে তৈরি হয়েছে!'
                );
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                showSweetAlert('error', response.data.message);
            }
        } catch (error) {
            console.error('Error saving session:', error);
            const errorMessage = error.response?.data?.message || 
                (editData ? 'সেশন আপডেট করতে সমস্যা হয়েছে' : 'সেশন তৈরি করতে সমস্যা হয়েছে');
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 sm:p-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {editData ? 'সেশন এডিট করুন' : 'নতুন সেশন তৈরি করুন'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {editData ? 'সেশনের তথ্য আপডেট করুন' : 'একটি নতুন একাডেমিক সেশন তৈরি করুন'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <FaCalendarAlt className="text-xl text-[#1e90c9]" />
                                <h2 className="text-lg font-semibold text-gray-800">
                                    সেশন তথ্য
                                </h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Session Name */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    সেশনের নাম <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="যেমন: ২০২৪-২০২৫"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Is Current Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isCurrent"
                                    checked={formData.isCurrent}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-[#1e90c9] bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm text-gray-700">
                                    বর্তমান সেশন হিসেবে সেট করুন
                                </label>
                            </div>

                            {/* Date Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        শুরু তারিখ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors ${
                                            errors.startDate ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        শেষ তারিখ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors ${
                                            errors.endDate ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                                </div>
                            </div>

                            {/* Total Working Days */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    মোট কার্যদিবস <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="totalWorkingDays"
                                    value={formData.totalWorkingDays}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors ${
                                        errors.totalWorkingDays ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="কার্যদিবস সংখ্যা"
                                    min="1"
                                />
                                {errors.totalWorkingDays && <p className="text-red-500 text-xs mt-1">{errors.totalWorkingDays}</p>}
                                <p className="text-gray-500 text-xs mt-1">
                                    শুরু ও শেষ তারিখ থেকে স্বয়ংক্রিয়ভাবে গণনা করা হয়
                                </p>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 p-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onBack}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                বাতিল করুন
                            </button>
                            <MainButton
                                type="submit"
                                disabled={loading}
                                className="rounded-md"
                            >
                                <FaSave className="text-sm mr-2" />
                                {loading ? 'সেভ হচ্ছে...' : (editData ? 'সেশন আপডেট করুন' : 'সেশন তৈরি করুন')}
                            </MainButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewSession;