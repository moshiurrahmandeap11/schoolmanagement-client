import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';


const AddNewBatch = ({ onBack, onSuccess, editData }) => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        classId: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchClasses();
        if (editData) {
            setFormData({
                name: editData.name,
                classId: editData.classId,
                description: editData.description || ''
            });
        }
    }, [editData]);

    const fetchClasses = async () => {
        try {
            const response = await axiosInstance.get('/classes');
            if (response.data.success) {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            showSweetAlert('error', 'ক্লাস লোড করতে সমস্যা হয়েছে');
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'ব্যাচের নাম প্রয়োজন';
        }

        if (!formData.classId) {
            newErrors.classId = 'ক্লাস নির্বাচন করুন';
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
            
            const url = editData ? `/batches/${editData._id}` : '/batches';
            const method = editData ? 'put' : 'post';

            const response = await axiosInstance[method](url, formData);

            if (response.data.success) {
                showSweetAlert('success', 
                    editData ? 'ব্যাচ সফলভাবে আপডেট হয়েছে!' : 'ব্যাচ সফলভাবে তৈরি হয়েছে!'
                );
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                showSweetAlert('error', response.data.message);
            }
        } catch (error) {
            console.error('Error saving batch:', error);
            const errorMessage = error.response?.data?.message || 
                (editData ? 'ব্যাচ আপডেট করতে সমস্যা হয়েছে' : 'ব্যাচ তৈরি করতে সমস্যা হয়েছে');
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
                            {editData ? 'ব্যাচ এডিট করুন' : 'নতুন ব্যাচ তৈরি করুন'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {editData ? 'ব্যাচের তথ্য আপডেট করুন' : 'একটি নতুন ব্যাচ তৈরি করুন'}
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
                                <FaUsers className="text-xl text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-800">
                                    ব্যাচ তথ্য
                                </h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Class Selection */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    ক্লাস <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="classId"
                                    value={formData.classId}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                        errors.classId ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">ক্লাস নির্বাচন করুন</option>
                                    {classes.map(classItem => (
                                        <option key={classItem._id} value={classItem._id}>
                                            {classItem.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId}</p>}
                            </div>

                            {/* Batch Name */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    ব্যাচের নাম <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="যেমন: ব্যাচ-১, সকালের ব্যাচ, ইত্যাদি"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Auto-generated Info */}
                            {!editData && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                                        স্বয়ংক্রিয়ভাবে তৈরি হবে:
                                    </h3>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• ব্যাচ আইডি (স্বয়ংক্রিয় জেনারেট)</li>
                                        <li>• তৈরি করার তারিখ</li>
                                        <li>• সক্রিয় অবস্থা</li>
                                    </ul>
                                </div>
                            )}
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
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaSave className="text-sm" />
                                {loading ? 'সেভ হচ্ছে...' : (editData ? 'ব্যাচ আপডেট করুন' : 'ব্যাচ তৈরি করুন')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewBatch;