import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';

const AddNewExamGroup = ({ examGroup, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        mainExam: '',
        subExams: ['']
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [examCategories, setExamCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Load exam categories
    useEffect(() => {
        const fetchExamCategories = async () => {
            try {
                const response = await axiosInstance.get('/exam-categories');
                if (response.data && response.data.success) {
                    setExamCategories(response.data.data || []);
                }
            } catch (err) {
                console.error('Error fetching exam categories:', err);
                setError('এক্সাম ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchExamCategories();
    }, []);

    // Set form data if editing
    useEffect(() => {
        if (examGroup) {
            setFormData({
                name: examGroup.name,
                mainExam: examGroup.mainExam,
                subExams: examGroup.subExams && examGroup.subExams.length > 0 ? examGroup.subExams : ['']
            });
        }
    }, [examGroup]);

    // Handle input changes
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

    // Handle sub exam changes
    const handleSubExamChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            subExams: prev.subExams.map((sub, i) => i === index ? value : sub)
        }));
    };

    // Add more sub exams
    const addMoreSubExams = () => {
        setFormData(prev => ({
            ...prev,
            subExams: [...prev.subExams, '']
        }));
    };

    // Remove sub exam
    const removeSubExam = (index) => {
        if (formData.subExams.length > 1) {
            setFormData(prev => ({
                ...prev,
                subExams: prev.subExams.filter((_, i) => i !== index)
            }));
        }
    };

    const [errors, setErrors] = useState({});

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'এক্সাম গ্রুপের নাম প্রয়োজন';
        }

        if (!formData.mainExam.trim()) {
            newErrors.mainExam = 'মেইন এক্সাম প্রয়োজন';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const url = examGroup ? `/exam-group/${examGroup._id}` : '/exam-group';
            const method = examGroup ? 'put' : 'post';

            const payload = {
                ...formData,
                subExams: formData.subExams.filter(sub => sub.trim()) // Remove empty sub exams
            };

            const response = await axiosInstance[method](url, payload);

            if (response.data && response.data.success) {
                setSuccess(examGroup ? 'এক্সাম গ্রুপ সফলভাবে আপডেট হয়েছে' : 'এক্সাম গ্রুপ সফলভাবে তৈরি হয়েছে');
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(response.data?.message || 'সমস্যা হয়েছে');
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('সার্ভার সমস্যা হয়েছে');
            }
            console.error('Error saving exam group:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                            {examGroup ? 'এক্সাম গ্রুপ এডিট করুন' : 'নতুন এক্সাম গ্রুপ যোগ করুন'}
                        </h1>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800 rounded transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        {/* Name Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                এক্সাম গ্রুপের নাম <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="এক্সাম গ্রুপের নাম লিখুন"
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    errors.name ? 'border-red-500 bg-red-50' : ''
                                }`}
                                required
                                maxLength={100}
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Main Exam Field - Now a Dropdown */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                মেইন এক্সাম <span className="text-red-500">*</span>
                            </label>
                            {categoriesLoading ? (
                                <div className="flex items-center space-x-2 text-gray-500">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>এক্সাম ক্যাটাগরি লোড হচ্ছে...</span>
                                </div>
                            ) : (
                                <select
                                    name="mainExam"
                                    value={formData.mainExam}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                        errors.mainExam ? 'border-red-500 bg-red-50' : ''
                                    }`}
                                    required
                                >
                                    <option value="">মেইন এক্সাম নির্বাচন করুন</option>
                                    {examCategories.map((category) => (
                                        <option key={category._id} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.mainExam && (
                                <p className="mt-2 text-sm text-red-600">{errors.mainExam}</p>
                            )}
                        </div>

                        {/* Sub Exams */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    সাব এক্সামসমূহ
                                </label>
                                <button
                                    type="button"
                                    onClick={addMoreSubExams}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-sm flex items-center space-x-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    <span>আরও সাব এক্সাম যোগ করুন</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.subExams.map((subExam, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={subExam}
                                            onChange={(e) => handleSubExamChange(index, e.target.value)}
                                            placeholder={`সাব এক্সাম ${index + 1}`}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        />
                                        {formData.subExams.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSubExam(index)}
                                                className="p-2 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded transition-colors duration-200"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                                সাব এক্সাম ফাঁকা রাখলে তা সংরক্ষণ হবে না
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                বাতিল
                            </button>
                            <button
                                type="submit"
                                disabled={loading || categoriesLoading}
                                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors duration-200 flex items-center space-x-2 ${
                                    loading || categoriesLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{examGroup ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{examGroup ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewExamGroup;