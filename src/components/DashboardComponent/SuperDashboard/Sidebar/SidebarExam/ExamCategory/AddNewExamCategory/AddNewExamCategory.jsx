import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';


const AddNewExamCategory = ({ category, onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        isMain: false,
        totalMarks: '',
        passMarks: '',
        weight: ''
    });

    // Weight options
    const weightOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                isMain: category.isMain || false,
                totalMarks: category.totalMarks?.toString() || '',
                passMarks: category.passMarks?.toString() || '',
                weight: category.weight?.toString() || ''
            });
        }
    }, [category]);

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
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            showSweetAlert('warning', 'পরীক্ষার ধরণের নাম প্রয়োজন');
            return false;
        }

        if (!formData.totalMarks || parseFloat(formData.totalMarks) <= 0) {
            showSweetAlert('warning', 'সঠিক মোট নাম্বার দিন');
            return false;
        }

        if (!formData.passMarks || parseFloat(formData.passMarks) < 0) {
            showSweetAlert('warning', 'সঠিক পাস মার্কস দিন');
            return false;
        }

        if (parseFloat(formData.passMarks) > parseFloat(formData.totalMarks)) {
            showSweetAlert('warning', 'পাস মার্কস মোট নাম্বারের বেশি হতে পারবে না');
            return false;
        }

        if (!formData.weight) {
            showSweetAlert('warning', 'ওয়েট নির্বাচন করুন');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            setLoading(true);
            
            const submitData = {
                ...formData,
                totalMarks: parseFloat(formData.totalMarks),
                passMarks: parseFloat(formData.passMarks),
                weight: parseFloat(formData.weight)
            };

            let response;
            if (category) {
                response = await axiosInstance.put(`/exam-categories/${category._id}`, submitData);
            } else {
                response = await axiosInstance.post('/exam-categories', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', 
                    category ? 'পরীক্ষার ধরণ সফলভাবে আপডেট হয়েছে' : 'পরীক্ষার ধরণ সফলভাবে তৈরি হয়েছে'
                );
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving exam category:', error);
            
            if (error.response?.status === 400 && error.response?.data?.message === 'Exam category name already exists') {
                showSweetAlert('error', 'এই নামের পরীক্ষার ধরণ ইতিমধ্যে রয়েছে');
            } else {
                showSweetAlert('error', 
                    category ? 'পরীক্ষার ধরণ আপডেট করতে সমস্যা হয়েছে' : 'পরীক্ষার ধরণ তৈরি করতে সমস্যা হয়েছে'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 sm:p-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {category ? 'পরীক্ষার ধরণ এডিট করুন' : 'নতুন পরীক্ষার ধরণ তৈরি করুন'}
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <form onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* পরীক্ষার ধরণ */}
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        পরীক্ষার ধরণ *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="পরীক্ষার ধরণের নাম"
                                        required
                                    />
                                </div>

                                {/* Is Main Exam */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isMain"
                                            checked={formData.isMain}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-gray-700 font-medium text-sm">
                                            প্রধান পরীক্ষা
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        প্রধান পরীক্ষা হিসেবে চিহ্নিত করুন
                                    </p>
                                </div>

                                {/* মোট নাম্বার */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        মোট নাম্বার *
                                    </label>
                                    <input
                                        type="number"
                                        name="totalMarks"
                                        value={formData.totalMarks}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="100"
                                        step="0.1"
                                        min="0"
                                        required
                                    />
                                </div>

                                {/* Pass Marks */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        পাস মার্কস *
                                    </label>
                                    <input
                                        type="number"
                                        name="passMarks"
                                        value={formData.passMarks}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="33.0"
                                        step="0.1"
                                        min="0"
                                        required
                                    />
                                </div>

                                {/* Weight */}
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        ওয়েট *
                                    </label>
                                    <select
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    >
                                        <option value="">ওয়েট নির্বাচন করুন</option>
                                        {weightOptions.map(weight => (
                                            <option key={weight} value={weight}>
                                                {weight}%
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        মোট ফলাফলে এই পরীক্ষার ধরণের ওজন নির্বাচন করুন
                                    </p>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaSave className="text-sm" />
                                    {loading ? 'সেভ হচ্ছে...' : (category ? 'আপডেট করুন' : 'সেভ করুন')}
                                </button>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    বাতিল করুন
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewExamCategory;