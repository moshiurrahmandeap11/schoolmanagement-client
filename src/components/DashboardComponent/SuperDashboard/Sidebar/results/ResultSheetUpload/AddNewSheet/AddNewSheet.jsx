import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';


const AddNewSheet = ({ resultSheet, onClose }) => {
    const [formData, setFormData] = useState({
        createdBy: '',
        modifiedBy: '',
        className: '',
        session: '',
        examTerm: '',
        resultSheet: null,
        status: 'draft'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [dropdownLoading, setDropdownLoading] = useState(true);

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                setDropdownLoading(true);
                
                // Fetch all data in parallel
                const [teachersRes, classesRes, sessionsRes] = await Promise.all([
                    axiosInstance.get('/teacher-list'),
                    axiosInstance.get('/class'),
                    axiosInstance.get('/sessions')
                ]);

                if (teachersRes.data?.success) setTeachers(teachersRes.data.data || []);
                if (classesRes.data?.success) setClasses(classesRes.data.data || []);
                if (sessionsRes.data?.success) setSessions(sessionsRes.data.data || []);

            } catch (err) {
                setError('ড্রপডাউন ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching dropdown data:', err);
            } finally {
                setDropdownLoading(false);
            }
        };

        fetchDropdownData();
    }, []);

    // Set form data if editing
    useEffect(() => {
        if (resultSheet) {
            setFormData({
                createdBy: resultSheet.createdBy || '',
                modifiedBy: resultSheet.modifiedBy || '',
                className: resultSheet.className || '',
                session: resultSheet.session || '',
                examTerm: resultSheet.examTerm || '',
                resultSheet: null,
                status: resultSheet.status || 'draft'
            });
        }
    }, [resultSheet]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                resultSheet: file
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        if (!formData.createdBy) {
            setError('তৈরি করেছেন নির্বাচন করুন');
            return false;
        }

        if (!formData.className) {
            setError('ক্লাস নির্বাচন করুন');
            return false;
        }

        if (!formData.session) {
            setError('সেশন নির্বাচন করুন');
            return false;
        }

        if (!formData.examTerm.trim()) {
            setError('পরীক্ষার টার্ম প্রয়োজন');
            return false;
        }

        if (!resultSheet && !formData.resultSheet) {
            setError('ফলাফল শিট ফাইল প্রয়োজন');
            return false;
        }

        return true;
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
            const formDataToSend = new FormData();
            formDataToSend.append('createdBy', formData.createdBy);
            formDataToSend.append('modifiedBy', formData.modifiedBy || formData.createdBy);
            formDataToSend.append('className', formData.className);
            formDataToSend.append('session', formData.session);
            formDataToSend.append('examTerm', formData.examTerm);
            formDataToSend.append('status', formData.status);

            if (formData.resultSheet) {
                formDataToSend.append('resultSheet', formData.resultSheet);
            }

            const url = resultSheet ? `/result-sheet/${resultSheet._id}` : '/result-sheet';
            const method = resultSheet ? 'put' : 'post';

            const response = await axiosInstance[method](url, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.success) {
                setSuccess(resultSheet ? 'ফলাফল শিট সফলভাবে আপডেট হয়েছে' : 'ফলাফল শিট সফলভাবে আপলোড হয়েছে');
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
            console.error('Error saving result sheet:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">
                            {resultSheet ? 'ফলাফল শিট এডিট করুন' : 'নতুন ফলাফল শিট যোগ করুন'}
                        </h1>
                        <button
                            onClick={onClose}
                            className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800 rounded transition-colors duration-200"
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

                        {dropdownLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">ডেটা লোড হচ্ছে...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Created By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Created by <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="createdBy"
                                        value={formData.createdBy}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">তৈরি করেছেন নির্বাচন করুন</option>
                                        {teachers.map((teacher) => (
                                            <option key={teacher._id} value={teacher.name}>
                                                {teacher.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Modified By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Modified by
                                    </label>
                                    <select
                                        name="modifiedBy"
                                        value={formData.modifiedBy}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                    >
                                        <option value="">মডিফাই করেছেন নির্বাচন করুন</option>
                                        {teachers.map((teacher) => (
                                            <option key={teacher._id} value={teacher.name}>
                                                {teacher.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="className"
                                        value={formData.className}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
                                        {classes.map((cls) => (
                                            <option key={cls._id} value={cls.name}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Session */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেশন <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="session"
                                        value={formData.session}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">সেশন নির্বাচন করুন</option>
                                        {sessions.map((session) => (
                                            <option key={session._id} value={session.name}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Exam Term */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        পরীক্ষার টার্ম <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="examTerm"
                                        value={formData.examTerm}
                                        onChange={handleInputChange}
                                        placeholder="পরীক্ষার টার্ম লিখুন (যেমন: Half Yearly, Final Exam)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                        required
                                    />
                                </div>

                                {/* Result Sheet File */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ফলাফল সীট <span className="text-red-500">*</span>
                                        {resultSheet && (
                                            <span className="text-xs text-gray-500 ml-2">
                                                (বর্তমান ফাইল রাখতে ফাঁকা রাখুন)
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                        required={!resultSheet}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        PDF, Word, Excel, Image ফাইল সমর্থিত (সর্বোচ্চ ১০MB)
                                    </p>
                                    {resultSheet && resultSheet.resultSheetOriginalName && (
                                        <p className="text-xs text-blue-600 mt-1">
                                            বর্তমান ফাইল: {resultSheet.resultSheetOriginalName}
                                        </p>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        অবস্থান
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                    >
                                        <option value="draft">খসড়া</option>
                                        <option value="published">প্রকাশিত</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        প্রকাশিত থাকলে এটি ব্যবহারকারীদের দেখানো হবে
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                বাতিল
                            </button>
                            <MainButton
                                type="submit"
                                disabled={loading || dropdownLoading}
                                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors duration-200 flex items-center space-x-2 ${
                                    loading || dropdownLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#1e90c9]'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{resultSheet ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{resultSheet ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </MainButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewSheet;