import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AddNewMainAdmission = ({ admissionInfo, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(true);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        classId: '',
        className: '',
        startDate: '',
        endDate: '',
        description: '',
        status: 'draft',
        coverImage: null,
        attachment: null
    });
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const [attachmentPreview, setAttachmentPreview] = useState('');

    // Fetch classes
    const fetchClasses = async () => {
        try {
            setClassesLoading(true);
            const response = await axiosInstance.get('/class');
            if (response.data && response.data.success) {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            Swal.fire('Error!', 'ক্লাস লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setClassesLoading(false);
        }
    };

    // যদি এডিট মোডে থাকে, ফর্ম ডেটা সেট করুন
    useEffect(() => {
        if (admissionInfo) {
            const startDate = new Date(admissionInfo.startDate);
            const endDate = new Date(admissionInfo.endDate);
            
            setFormData({
                title: admissionInfo.title || '',
                classId: admissionInfo.classId || '',
                className: admissionInfo.className || '',
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                description: admissionInfo.description || '',
                status: admissionInfo.status || 'draft',
                coverImage: null,
                attachment: null
            });
            
            if (admissionInfo.coverImage) {
                setCoverImagePreview(`http://localhost:5000${admissionInfo.coverImage}`);
            }
            if (admissionInfo.attachment) {
                setAttachmentPreview(admissionInfo.attachment);
            }
        }
    }, [admissionInfo]);

    useEffect(() => {
        fetchClasses();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle class selection
    const handleClassChange = (e) => {
        const selectedClassId = e.target.value;
        const selectedClass = classes.find(cls => cls._id === selectedClassId);
        
        if (selectedClass) {
            setFormData(prev => ({
                ...prev,
                classId: selectedClass._id,
                className: selectedClass.name
            }));
        }
    };

    // Handle description change from rich text editor
    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
    };

    // Handle cover image change
    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                coverImage: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setCoverImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle attachment change
    const handleAttachmentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                attachment: file
            }));

            // Create preview for file name
            setAttachmentPreview(file.name);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            classId: '',
            className: '',
            startDate: '',
            endDate: '',
            description: '',
            status: 'draft',
            coverImage: null,
            attachment: null
        });
        setCoverImagePreview('');
        setAttachmentPreview('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.title.trim()) {
            Swal.fire('Error!', 'শিরোনাম প্রয়োজন', 'error');
            return;
        }

        if (!formData.classId || !formData.className) {
            Swal.fire('Error!', 'ক্লাস নির্বাচন প্রয়োজন', 'error');
            return;
        }

        if (!formData.startDate || !formData.endDate) {
            Swal.fire('Error!', 'শুরুর তারিখ এবং শেষ তারিখ প্রয়োজন', 'error');
            return;
        }

        if (!formData.description.trim()) {
            Swal.fire('Error!', 'বিবরণ প্রয়োজন', 'error');
            return;
        }

        // Date validation
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today && !admissionInfo) {
            Swal.fire('Error!', 'শুরুর তারিখ ভবিষ্যতের হতে হবে', 'error');
            return;
        }

        if (end <= start) {
            Swal.fire('Error!', 'শেষ তারিখ শুরুর তারিখের পরে হতে হবে', 'error');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('classId', formData.classId);
            formDataToSend.append('className', formData.className);
            formDataToSend.append('startDate', formData.startDate);
            formDataToSend.append('endDate', formData.endDate);
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('status', formData.status);
            
            if (formData.coverImage) {
                formDataToSend.append('coverImage', formData.coverImage);
            }
            
            if (formData.attachment) {
                formDataToSend.append('attachment', formData.attachment);
            }

            let response;
            if (admissionInfo) {
                // Edit mode
                response = await axiosInstance.put(`/main-admission-info/${admissionInfo._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Add mode
                response = await axiosInstance.post('/main-admission-info', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            if (response.data && response.data.success) {
                Swal.fire('Success!', 
                    admissionInfo ? 'ভর্তি তথ্য সফলভাবে আপডেট হয়েছে' : 'ভর্তি তথ্য সফলভাবে তৈরি হয়েছে', 
                    'success'
                );
                resetForm();
                if (onClose) {
                    onClose();
                }
            } else {
                Swal.fire('Error!', response.data?.message || 'সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error saving admission info:', error);
            Swal.fire('Error!', 
                admissionInfo ? 'ভর্তি তথ্য আপডেট করতে সমস্যা হয়েছে' : 'ভর্তি তথ্য তৈরি করতে সমস্যা হয়েছে', 
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Cancel form
    const handleCancel = () => {
        resetForm();
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            {admissionInfo ? 'ভর্তি তথ্য এডিট করুন' : 'নতুন ভর্তি তথ্য যোগ করুন'}
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            {admissionInfo ? 'ভর্তি তথ্য আপডেট করুন' : 'নতুন ভর্তি তথ্য তৈরি করুন'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                শিরোনাম <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="ভর্তি তথ্যের শিরোনাম লিখুন"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                required
                            />
                        </div>

                        {/* Class Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ক্লাস <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.classId}
                                onChange={handleClassChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                required
                                disabled={classesLoading}
                            >
                                <option value="">ক্লাস নির্বাচন করুন</option>
                                {classes.map((cls) => (
                                    <option key={cls._id} value={cls._id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                            {classesLoading && (
                                <p className="text-xs text-gray-500 mt-1">ক্লাস লোড হচ্ছে...</p>
                            )}
                            {formData.className && (
                                <p className="text-sm text-green-600 mt-1">
                                    নির্বাচিত ক্লাস: {formData.className}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শুরুর তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    required
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শেষ তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description - Rich Text Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                বিবরণ <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                placeholder="ভর্তি সম্পর্কিত বিস্তারিত তথ্য, প্রয়োজনীয় নথি, যোগ্যতা ইত্যাদি লিখুন..."
                                height="300px"
                            />
                        </div>

                        {/* Cover Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cover Image
                            </label>
                            <div className="flex items-center space-x-6">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        JPG, PNG, WebP ইত্যাদি ফরম্যাট সমর্থিত (সর্বোচ্চ ১০MB)
                                    </p>
                                </div>
                                {coverImagePreview && (
                                    <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden">
                                        <img 
                                            src={coverImagePreview} 
                                            alt="Cover Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attachment Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                আপলোড (ফাইল)
                            </label>
                            <div className="flex items-center space-x-6">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        onChange={handleAttachmentChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        PDF, DOC, DOCX, JPG, PNG, WebP ইত্যাদি ফরম্যাট সমর্থিত (সর্বোচ্চ ১০MB)
                                    </p>
                                </div>
                                {attachmentPreview && (
                                    <div className="text-sm text-gray-600">
                                        {typeof attachmentPreview === 'string' && attachmentPreview.startsWith('http') ? (
                                            <a 
                                                href={`http://localhost:5000${attachmentPreview}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                বর্তমান ফাইল দেখুন
                                            </a>
                                        ) : (
                                            <span>সিলেক্টেড: {attachmentPreview}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                অবস্থান
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                            >
                                <option value="draft">খসড়া</option>
                                <option value="published">প্রকাশিত</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                বাতিল করুন
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center space-x-2 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{admissionInfo ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{admissionInfo ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewMainAdmission;