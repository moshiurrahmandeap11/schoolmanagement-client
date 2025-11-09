import { useEffect, useState } from 'react';
import { FaArrowLeft, FaMinus, FaPlus, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';

const BulkDocument = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [documents, setDocuments] = useState([
        {
            title: '',
            category: '',
            teacher: '',
            file: null
        }
    ]);

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

    const handleInputChange = (index, field, value) => {
        const updatedDocuments = [...documents];
        updatedDocuments[index][field] = value;
        setDocuments(updatedDocuments);
    };

    const handleFileChange = (index, file) => {
        if (file) {
            // File size validation (10MB)
            if (file.size > 10 * 1024 * 1024) {
                Swal.fire('Error!', `ডকুমেন্ট ${index + 1}: ফাইল সাইজ 10MB এর বেশি হতে পারবে না`, 'error');
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
                Swal.fire('Error!', `ডকুমেন্ট ${index + 1}: অনুমোদিত ফাইল ফরম্যাট নয়`, 'error');
                return;
            }

            const updatedDocuments = [...documents];
            updatedDocuments[index].file = file;
            setDocuments(updatedDocuments);
        }
    };

    const addDocumentField = () => {
        setDocuments([
            ...documents,
            {
                title: '',
                category: '',
                teacher: '',
                file: null
            }
        ]);
    };

    const removeDocumentField = (index) => {
        if (documents.length > 1) {
            const updatedDocuments = documents.filter((_, i) => i !== index);
            setDocuments(updatedDocuments);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all documents
        for (let i = 0; i < documents.length; i++) {
            const doc = documents[i];
            if (!doc.title.trim()) {
                Swal.fire('Error!', `ডকুমেন্ট ${i + 1} এর শিরোনাম আবশ্যক`, 'error');
                return;
            }
            if (!doc.category) {
                Swal.fire('Error!', `ডকুমেন্ট ${i + 1} এর ক্যাটাগরী আবশ্যক`, 'error');
                return;
            }
            if (!doc.file) {
                Swal.fire('Error!', `ডকুমেন্ট ${i + 1} এর ফাইল আবশ্যক`, 'error');
                return;
            }
        }

        setLoading(true);

        try {
            // Create FormData for each document
            const uploadPromises = documents.map(async (doc) => {
                const formData = new FormData();
                formData.append('title', doc.title);
                formData.append('category', doc.category);
                formData.append('teacher', doc.teacher);
                formData.append('file', doc.file);

                const response = await axiosInstance.post('/documents', formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                    }
                });
                return response.data;
            });

            // Wait for all uploads to complete
            const results = await Promise.all(uploadPromises);
            
            const successfulUploads = results.filter(result => result.success);
            const failedUploads = results.filter(result => !result.success);

            if (failedUploads.length === 0) {
                Swal.fire('Success!', `${successfulUploads.length}টি ডকুমেন্ট সফলভাবে তৈরি হয়েছে`, 'success');
                onBack();
            } else {
                Swal.fire('Partial Success!', 
                    `${successfulUploads.length}টি ডকুমেন্ট সফল, ${failedUploads.length}টি ব্যর্থ`, 
                    'warning'
                );
            }
        } catch (error) {
            console.error('Error creating documents:', error);
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

    const triggerFileInput = (index) => {
        const fileInput = document.getElementById(`file-upload-${index}`);
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
                        বাল্ক ডকুমেন্ট তৈরি করুন
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Dynamic Document Fields */}
                            {documents.map((document, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            ডকুমেন্ট {index + 1}
                                        </h3>
                                        {documents.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDocumentField(index)}
                                                className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                                title="ডকুমেন্ট রিমুভ করুন"
                                            >
                                                <FaMinus className="text-sm" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {/* Document Title */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                ডকুমেন্ট শিরোনাম <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={document.title}
                                                onChange={(e) => handleInputChange(index, 'title', e.target.value)}
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
                                                    value={document.category}
                                                    onChange={(e) => handleInputChange(index, 'category', e.target.value)}
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
                                                    value={document.teacher}
                                                    onChange={(e) => handleInputChange(index, 'teacher', e.target.value)}
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
                                            
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                                                    className="hidden"
                                                    id={`file-upload-${index}`}
                                                />
                                                
                                                {document.file ? (
                                                    <div className="space-y-3">
                                                        <div className="text-3xl">
                                                            {getFileIcon(document.file)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">
                                                                {document.file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {(document.file.size / (1024 * 1024)).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2 justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => triggerFileInput(index)}
                                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                                                            >
                                                                পরিবর্তন করুন
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleInputChange(index, 'file', null)}
                                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                                            >
                                                                রিমুভ করুন
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <FaUpload className="text-2xl text-gray-400 mx-auto" />
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">
                                                                ফাইল আপলোড করুন
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                PNG, JPG, PDF, DOCX, XLSX
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerFileInput(index)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                                                        >
                                                            ফাইল নির্বাচন করুন
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add More Button */}
                            <button
                                type="button"
                                onClick={addDocumentField}
                                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600"
                            >
                                <FaPlus className="text-sm" />
                                + আরও যোগ করুন
                            </button>

                            {/* Summary */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex flex-wrap gap-4 text-sm text-blue-700">
                                    <span>মোট ডকুমেন্ট: {documents.length}</span>
                                    <span>ফাইল সিলেক্টেড: {documents.filter(doc => doc.file).length}</span>
                                    <span>ক্যাটাগরী সিলেক্টেড: {documents.filter(doc => doc.category).length}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || documents.length === 0}
                                >
                                    {loading ? 'তৈরি হচ্ছে...' : `${documents.length}টি ডকুমেন্ট তৈরি করুন`}
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
                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                            <h3 className="text-sm font-medium text-green-800 mb-2">বাল্ক আপলোড সহায়তা:</h3>
                            <ul className="text-sm text-green-700 space-y-1">
                                <li>• একসাথে একাধিক ডকুমেন্ট আপলোড করুন</li>
                                <li>• প্রতিটি ডকুমেন্টের জন্য শিরোনাম, ক্যাটাগরী এবং ফাইল আবশ্যক</li>
                                <li>• সর্বোচ্চ ফাইল সাইজ: 10MB প্রতি ডকুমেন্ট</li>
                                <li>• সাপোর্টেড ফরম্যাট: PDF, DOCX, XLSX, PPTX, PNG, JPG</li>
                                <li>• শিক্ষক নির্বাচন ঐচ্ছিক</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkDocument;