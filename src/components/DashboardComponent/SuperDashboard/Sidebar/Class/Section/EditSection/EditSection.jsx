import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';


const EditSection = ({ section, onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        classId: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (section) {
            setFormData({
                name: section.name || '',
                classId: section.classId || ''
            });
        }
        fetchClasses();
    }, [section]);

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
            newErrors.name = 'সেকশনের নাম প্রয়োজন';
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
            
            const response = await axiosInstance.put(`/sections/${section._id}`, formData);

            if (response.data.success) {
                showSweetAlert('success', 'সেকশন সফলভাবে আপডেট হয়েছে!');
                if (onSuccess) {
                    onSuccess();
                }
                onBack();
            } else {
                showSweetAlert('error', response.data.message || 'সেকশন আপডেট করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error updating section:', error);
            const errorMessage = error.response?.data?.message || 'সেকশন আপডেট করতে সমস্যা হয়েছে';
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
                    <h1 className="text-2xl font-bold text-gray-800">
                        সেকশন এডিট করুন
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="grid grid-cols-1 gap-6">
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
                                {errors.classId && (
                                    <p className="text-red-500 text-xs mt-1">{errors.classId}</p>
                                )}
                            </div>

                            {/* Section Name */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    সেকশনের নাম <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="সেকশনের নাম লিখুন..."
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
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
                                    {loading ? 'আপডেট হচ্ছে...' : 'সেকশন আপডেট করুন'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditSection;