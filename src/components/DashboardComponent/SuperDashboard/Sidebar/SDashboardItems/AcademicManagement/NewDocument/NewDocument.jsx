import { useEffect, useState } from 'react';
import { FaArrowLeft, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';

const NewDocument = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        teacher: '',
        file: null
    });
    const [filePreview, setFilePreview] = useState(null);
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchTeachers();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/document-categories');
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
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
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileError('');
        
        if (file) {
            // File size validation (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setFileError('ফাইল সাইজ 10MB এর বেশি হতে পারবে না');
                return;
            }

            // File type validation
            const allowedTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png', 
                'image/gif',
                'image/webp',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain'
            ];

            if (!allowedTypes.includes(file.type)) {
                setFileError('অনুমোদিত ফাইল ফরম্যাট নয়');
                return;
            }

            setFormData({
                ...formData,
                file: file
            });

            // Create file preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFilePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.category || !formData.file) {
            Swal.fire('Error!', 'শিরোনাম, ক্যাটাগরী এবং ফাইল আবশ্যক', 'error');
            return;
        }

        if (fileError) {
            Swal.fire('Error!', fileError, 'error');
            return;
        }

        setLoading(true);

        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('category', formData.category);
        submitData.append('teacher', formData.teacher);
        submitData.append('file', formData.file);

        try {
            const response = await axiosInstance.post('/documents', submitData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                Swal.fire('Success!', 'ডকুমেন্ট সফলভাবে তৈরি হয়েছে', 'success');
                onBack();
            }
        } catch (error) {
            console.error('Error creating document:', error);
            const errorMessage = error.response?.data?.message || 'ডকুমেন্ট তৈরি করতে সমস্যা হয়েছে';
            Swal.fire('Error!', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (file) => {
        if (!file) return '📄';
        
        const fileType = file.type;
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.includes('pdf')) return '📕';
        if (fileType.includes('word') || fileType.includes('document')) return '📘';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📗';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📙';
        return '📄';
    };

    // File input validation bypass function
    const triggerFileInput = () => {
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
            fileInput.click();
        }
    };

    if (loading) return <Loader />;

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
                        নতুন ডকুমেন্ট তৈরি করুন
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    শিরোনাম <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="ডকুমেন্টের শিরোনাম লিখুন"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Category */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        ক্যাটাগরী <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        required
                                    >
                                        <option value="">ক্যাটাগরী নির্বাচন করুন</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Teacher */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        শিক্ষক
                                    </label>
                                    <select
                                        name="teacher"
                                        value={formData.teacher}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    >
                                        <option value="">শিক্ষক নির্বাচন করুন</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher._id} value={teacher._id}>
                                                {teacher.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    ফাইল <span className="text-red-500">*</span>
                                </label>
                                
                                {/* File Upload Area */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                        // required attribute remove kore dilam
                                    />
                                    
                                    {formData.file ? (
                                        <div className="space-y-3">
                                            <div className="text-4xl">
                                                {getFileIcon(formData.file)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {formData.file.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                            {filePreview && (
                                                <div className="mt-3">
                                                    <img 
                                                        src={filePreview} 
                                                        alt="Preview" 
                                                        className="mx-auto max-h-32 rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    type="button"
                                                    onClick={triggerFileInput}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                                >
                                                    অন্য ফাইল নির্বাচন করুন
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({...formData, file: null});
                                                        setFilePreview(null);
                                                    }}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                >
                                                    ফাইল রিমুভ করুন
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <FaUpload className="text-4xl text-gray-400 mx-auto" />
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    ফাইল আপলোড করুন
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    PNG, JPG, PDF, DOCX, XLSX ফাইল সাপোর্টেড
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={triggerFileInput}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                ফাইল নির্বাচন করুন
                                            </button>
                                        </div>
                                    )}

                                    {/* File Error Message */}
                                    {fileError && (
                                        <p className="text-red-500 text-sm mt-2">{fileError}</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || !formData.file}
                                >
                                    {loading ? 'তৈরি হচ্ছে...' : 'ডকুমেন্ট তৈরি করুন'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-medium text-lg transition-colors"
                                >
                                    বাতিল করুন
                                </button>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">সহায়তা:</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• সর্বোচ্চ ফাইল সাইজ: 10MB</li>
                                <li>• সাপোর্টেড ফরম্যাট: PDF, DOCX, XLSX, PPTX, PNG, JPG</li>
                                <li>• শিরোনাম এবং ক্যাটাগরী আবশ্যক</li>
                                <li>• শিক্ষক নির্বাচন ঐচ্ছিক</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewDocument;