import { useEffect, useState } from 'react';
import { FaArrowLeft, FaPlus, FaSave, FaTimes, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';

const AddNewHomeWork = ({ onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        classId: '',
        teacherId: '',
        sectionId: '',
        homeworkDate: '',
        status: 'draft',
        attachments: []
    });
    const [homeworkDetails, setHomeworkDetails] = useState([
        {
            subjectId: '',
            homeworkType: 'written',
            homeworkText: ''
        }
    ]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
        fetchSections();
        fetchSubjects();
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

    const fetchTeachers = async () => {
        try {
            const response = await axiosInstance.get('/teacher-list');
            if (response.data.success) {
                setTeachers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            showSweetAlert('error', 'শিক্ষক লোড করতে সমস্যা হয়েছে');
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

    const fetchSubjects = async () => {
        try {
            const response = await axiosInstance.get('/subjects');
            if (response.data.success) {
                setSubjects(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            showSweetAlert('error', 'বিষয় লোড করতে সমস্যা হয়েছে');
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

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                showSweetAlert('error', `${file.name} - ফাইল সাইজ 10MB এর বেশি হতে পারবে না`);
                return false;
            }

            // Check file type
            const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];
            const fileExt = '.' + file.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(fileExt)) {
                showSweetAlert('error', `${file.name} - শুধুমাত্র PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF ফাইল আপলোড করা যাবে`);
                return false;
            }

            return true;
        });

        if (validFiles.length > 0) {
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, ...validFiles]
            }));
        }
    };

    const removeFile = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    // Homework Details Functions
    const addHomeworkDetail = () => {
        setHomeworkDetails(prev => [
            ...prev,
            {
                subjectId: '',
                homeworkType: 'written',
                homeworkText: ''
            }
        ]);
    };

    const removeHomeworkDetail = (index) => {
        if (homeworkDetails.length > 1) {
            setHomeworkDetails(prev => prev.filter((_, i) => i !== index));
        } else {
            showSweetAlert('warning', 'অন্তত একটি হোমওয়ার্ক বিবরণ থাকতে হবে');
        }
    };

    const handleHomeworkDetailChange = (index, field, value) => {
        setHomeworkDetails(prev => 
            prev.map((detail, i) => 
                i === index ? { ...detail, [field]: value } : detail
            )
        );
    };

    const handleHomeworkTextChange = (index, content) => {
        handleHomeworkDetailChange(index, 'homeworkText', content);
    };

    const getSubjectName = (subjectId) => {
        const subject = subjects.find(s => s._id === subjectId);
        return subject ? subject.name : '';
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'শিরোনাম প্রয়োজন';
        }

        if (!formData.classId) {
            newErrors.classId = 'ক্লাস নির্বাচন করুন';
        }

        if (!formData.teacherId) {
            newErrors.teacherId = 'শিক্ষক নির্বাচন করুন';
        }

        if (!formData.homeworkDate) {
            newErrors.homeworkDate = 'হোমওয়ার্ক তারিখ প্রয়োজন';
        }

        // Validate homework details
        homeworkDetails.forEach((detail, index) => {
            if (!detail.subjectId) {
                newErrors[`homeworkDetail_${index}_subject`] = 'বিষয় নির্বাচন করুন';
            }
            if (!detail.homeworkText.trim()) {
                newErrors[`homeworkDetail_${index}_text`] = 'হোমওয়ার্ক বিবরণ প্রয়োজন';
            }
        });

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
            
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('classId', formData.classId);
            submitData.append('teacherId', formData.teacherId);
            submitData.append('sectionId', formData.sectionId || '');
            submitData.append('homeworkDate', formData.homeworkDate);
            submitData.append('status', formData.status);
            
            // Add homework details with subject names
            const homeworkDetailsWithNames = homeworkDetails.map(detail => ({
                ...detail,
                subjectName: getSubjectName(detail.subjectId)
            }));
            submitData.append('homeworkDetails', JSON.stringify(homeworkDetailsWithNames));
            
            // Add attachments
            formData.attachments.forEach(file => {
                submitData.append('attachments', file);
            });

            const response = await axiosInstance.post('/assignments', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                showSweetAlert('success', 'হোমওয়ার্ক সফলভাবে তৈরি হয়েছে!');
                if (onSuccess) {
                    onSuccess();
                }
                onBack();
            } else {
                showSweetAlert('error', response.data.message || 'হোমওয়ার্ক তৈরি করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
            const errorMessage = error.response?.data?.message || 'হোমওয়ার্ক তৈরি করতে সমস্যা হয়েছে';
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                        নতুন হোমওয়ার্ক তৈরি করুন
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="grid grid-cols-1 gap-8">
                            {/* Basic Information */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">মৌলিক তথ্য</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Title */}
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            হোমওয়ার্কের শিরোনাম <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                                errors.title ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="হোমওয়ার্কের শিরোনাম লিখুন..."
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                                        )}
                                    </div>

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

                                    {/* Teacher Selection */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            শিক্ষক <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="teacherId"
                                            value={formData.teacherId}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                                errors.teacherId ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">শিক্ষক নির্বাচন করুন</option>
                                            {teachers.map(teacher => (
                                                <option key={teacher._id} value={teacher._id}>
                                                    {teacher.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.teacherId && (
                                            <p className="text-red-500 text-xs mt-1">{errors.teacherId}</p>
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

                                    {/* Homework Date */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            হোমওয়ার্ক তারিখ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="homeworkDate"
                                            value={formData.homeworkDate}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                                errors.homeworkDate ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.homeworkDate && (
                                            <p className="text-red-500 text-xs mt-1">{errors.homeworkDate}</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                                            অবস্থান
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        >
                                            <option value="draft">খসড়া</option>
                                            <option value="publish">প্রকাশিত</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Homework Details */}
                            <div>
                                <div className="flex items-center justify-between mb-6 pb-2 border-b">
                                    <h2 className="text-xl font-bold text-gray-800">হোমওয়ার্ক বিবরণ</h2>
                                    <button
                                        type="button"
                                        onClick={addHomeworkDetail}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <FaPlus className="text-xs" />
                                        আরও যোগ করুন
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {homeworkDetails.map((detail, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    হোমওয়ার্ক #{index + 1}
                                                </h3>
                                                {homeworkDetails.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeHomeworkDetail(index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="মুছুন"
                                                    >
                                                        <FaTimes className="text-sm" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Subject Selection */}
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                                        বিষয় <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={detail.subjectId}
                                                        onChange={(e) => handleHomeworkDetailChange(index, 'subjectId', e.target.value)}
                                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                                            errors[`homeworkDetail_${index}_subject`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    >
                                                        <option value="">বিষয় নির্বাচন করুন</option>
                                                        {subjects.map(subject => (
                                                            <option key={subject._id} value={subject._id}>
                                                                {subject.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors[`homeworkDetail_${index}_subject`] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`homeworkDetail_${index}_subject`]}</p>
                                                    )}
                                                </div>

                                                {/* Homework Type */}
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                                        হোমওয়ার্ক ধরণ
                                                    </label>
                                                    <select
                                                        value={detail.homeworkType}
                                                        onChange={(e) => handleHomeworkDetailChange(index, 'homeworkType', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                                    >
                                                        <option value="written">লিখিত</option>
                                                        <option value="oral">মৌখিক</option>
                                                        <option value="written_oral">লিখিত ও মৌখিক</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Homework Text */}
                                            <div className="mt-4">
                                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                                    হোমওয়ার্ক বিবরণ <span className="text-red-500">*</span>
                                                </label>
                                                <RichTextEditor
                                                    value={detail.homeworkText}
                                                    onChange={(content) => handleHomeworkTextChange(index, content)}
                                                    placeholder="হোমওয়ার্কের বিস্তারিত বিবরণ লিখুন..."
                                                    height="200px"
                                                />
                                                {errors[`homeworkDetail_${index}_text`] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[`homeworkDetail_${index}_text`]}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">সংযোজন</h2>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        ফাইল আপলোড (ঐচ্ছিক)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                            className="hidden"
                                            id="attachments"
                                            multiple
                                        />
                                        <label htmlFor="attachments" className="cursor-pointer">
                                            <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                                            <p className="text-gray-600 mb-2">
                                                ফাইল নির্বাচন করুন (PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF)
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                সর্বোচ্চ সাইজ: 10MB per file, সর্বোচ্চ ৫টি ফাইল
                                            </p>
                                        </label>
                                    </div>

                                    {/* Selected Files List */}
                                    {formData.attachments.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">নির্বাচিত ফাইলসমূহ:</h4>
                                            <div className="space-y-2">
                                                {formData.attachments.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-blue-600">📎</span>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                                                        >
                                                            <FaTimes className="text-sm" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                                    {loading ? 'সেভ হচ্ছে...' : 'হোমওয়ার্ক সেভ করুন'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewHomeWork;