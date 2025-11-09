import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';


const AddNewSubject = ({ onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        classId: '',
        sectionId: '',
        isOptional: false,
        totalMarks: '',
        writtenPassMark: '',
        mcqPassMark: '',
        practicalPassMark: '',
        ctPassMark: '',
        firstPaper: '',
        bothPapersTotalMarks: '',
        bothPapersMcqPassMark: '',
        bothPapersPracticalPassMark: '',
        bothPapersCtPassMark: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchClasses();
        fetchSections();
    }, []);

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

    const fetchSections = async () => {
        try {
            const response = await axiosInstance.get('/sections');
            if (response.data.success) {
                setSections(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            showSweetAlert('error', 'সেকশন লোড করতে সমস্যা হয়েছে');
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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
            newErrors.name = 'বিষয়ের নাম প্রয়োজন';
        }

        if (!formData.code.trim()) {
            newErrors.code = 'বিষয় কোড প্রয়োজন';
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
            
            const response = await axiosInstance.post('/subjects', formData);

            if (response.data.success) {
                showSweetAlert('success', 'বিষয় সফলভাবে তৈরি হয়েছে!');
                if (onSuccess) {
                    onSuccess();
                }
                onBack();
            } else {
                showSweetAlert('error', response.data.message || 'বিষয় তৈরি করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error creating subject:', error);
            const errorMessage = error.response?.data?.message || 'বিষয় তৈরি করতে সমস্যা হয়েছে';
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
                        নতুন বিষয় তৈরি করুন
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="grid grid-cols-1 gap-8">
                            {/* Basic Information */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">মৌলিক তথ্য</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                    {/* Section Selection */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            সেকশন
                                        </label>
                                        <select
                                            name="sectionId"
                                            value={formData.sectionId}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        >
                                            <option value="">সেকশন নির্বাচন করুন</option>
                                            {sections.map(section => (
                                                <option key={section._id} value={section._id}>
                                                    {section.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Subject Name */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            বিষয়ের নাম <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                                errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="বিষয়ের নাম লিখুন..."
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Subject Code */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            বিষয় কোড <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                                errors.code ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="বিষয় কোড লিখুন..."
                                        />
                                        {errors.code && (
                                            <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                                        )}
                                    </div>

                                    {/* Is Optional Checkbox */}
                                    <div className="md:col-span-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="isOptional"
                                                checked={formData.isOptional}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                ঐচ্ছিক বিষয়
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Marks Information */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">নাম্বার তথ্য</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Total Marks */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            মোট নাম্বার
                                        </label>
                                        <input
                                            type="number"
                                            name="totalMarks"
                                            value={formData.totalMarks}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="মোট নাম্বার"
                                        />
                                    </div>

                                    {/* Written Pass Mark */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            লিখিত পরীক্ষার পাশ নাম্বার
                                        </label>
                                        <input
                                            type="number"
                                            name="writtenPassMark"
                                            value={formData.writtenPassMark}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="লিখিত পাশ নাম্বার"
                                        />
                                    </div>

                                    {/* MCQ Pass Mark */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            এম.সি.কিউ পাস মার্ক
                                        </label>
                                        <input
                                            type="number"
                                            name="mcqPassMark"
                                            value={formData.mcqPassMark}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="এম.সি.কিউ পাস মার্ক"
                                        />
                                    </div>

                                    {/* Practical Pass Mark */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            ব্যবহারিক পাস মার্ক
                                        </label>
                                        <input
                                            type="number"
                                            name="practicalPassMark"
                                            value={formData.practicalPassMark}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="ব্যবহারিক পাস মার্ক"
                                        />
                                    </div>

                                    {/* CT Pass Mark */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            CT Pass Mark
                                        </label>
                                        <input
                                            type="number"
                                            name="ctPassMark"
                                            value={formData.ctPassMark}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="CT পাস মার্ক"
                                        />
                                    </div>

                                    {/* First Paper */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            প্রথম পত্র
                                        </label>
                                        <input
                                            type="number"
                                            name="firstPaper"
                                            value={formData.firstPaper}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="প্রথম পত্র"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Both Papers Information */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">উভয় পেপার তথ্য</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Both Papers Total Marks */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            উভয় পেপার মোট মার্ক
                                        </label>
                                        <input
                                            type="number"
                                            name="bothPapersTotalMarks"
                                            value={formData.bothPapersTotalMarks}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="উভয় পেপার মোট মার্ক"
                                        />
                                    </div>

                                    {/* Both Papers MCQ Pass Mark */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            উভয় পত্রের এমসিকিউ পাশ নাম্বার
                                        </label>
                                        <input
                                            type="number"
                                            name="bothPapersMcqPassMark"
                                            value={formData.bothPapersMcqPassMark}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="উভয় পত্রের এমসিকিউ পাশ নাম্বার"
                                        />
                                    </div>

                                    {/* Both Papers Practical Pass Mark */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            উভয় পত্রের প্র্যাক্টিক্যাল পাশ নাম্বার
                                        </label>
                                        <input
                                            type="number"
                                            name="bothPapersPracticalPassMark"
                                            value={formData.bothPapersPracticalPassMark}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="উভয় পত্রের প্র্যাক্টিক্যাল পাশ নাম্বার"
                                        />
                                    </div>

                                    {/* Both Papers CT Pass Mark */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            Both Paper CT Pass Mark
                                        </label>
                                        <input
                                            type="number"
                                            name="bothPapersCtPassMark"
                                            value={formData.bothPapersCtPassMark}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="উভয় পত্রের CT পাস মার্ক"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-6 border-t">
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
                                    {loading ? 'সেভ হচ্ছে...' : 'বিষয় সেভ করুন'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewSubject;