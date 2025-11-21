import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import RichTextEditor from '../../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AddNewJobs = ({ job, onClose }) => {
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        applicationDeadline: '',
        status: 'draft',
        attachment: null
    });
    const [attachmentPreview, setAttachmentPreview] = useState('');

    // যদি এডিট মোডে থাকে, ফর্ম ডেটা সেট করুন
    useEffect(() => {
        if (job) {
            const deadlineDate = new Date(job.applicationDeadline);
            const formattedDate = deadlineDate.toISOString().split('T')[0];
            
            setFormData({
                title: job.title || '',
                description: job.description || '',
                location: job.location || '',
                applicationDeadline: formattedDate,
                status: job.status || 'draft',
                attachment: null
            });
            
            if (job.attachment) {
                setAttachmentPreview(job.attachment);
            }
        }
    }, [job]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle description change from rich text editor
    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
    };

    // Handle attachment change
    const handleAttachmentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                attachment: file
            }));

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setAttachmentPreview(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                setAttachmentPreview(file.name);
            }
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            location: '',
            applicationDeadline: '',
            status: 'draft',
            attachment: null
        });
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
        if (!formData.description.trim()) {
            Swal.fire('Error!', 'বিবরণ প্রয়োজন', 'error');
            return;
        }
        if (!formData.applicationDeadline) {
            Swal.fire('Error!', 'আবেদনের শেষ তারিখ প্রয়োজন', 'error');
            return;
        }

        // Check if deadline is in the future
        const deadline = new Date(formData.applicationDeadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadline < today) {
            Swal.fire('Error!', 'আবেদনের শেষ তারিখ ভবিষ্যতের হতে হবে', 'error');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('location', formData.location.trim());
            formDataToSend.append('applicationDeadline', formData.applicationDeadline);
            formDataToSend.append('status', formData.status);
            
            if (formData.attachment) {
                formDataToSend.append('attachment', formData.attachment);
            }

            let response;
            if (job) {
                // Edit mode
                response = await axiosInstance.put(`/institute-jobs/${job._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Add mode
                response = await axiosInstance.post('/institute-jobs', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            if (response.data && response.data.success) {
                Swal.fire('Success!', 
                    job ? 'চাকুরী সফলভাবে আপডেট হয়েছে' : 'চাকুরী সফলভাবে তৈরি হয়েছে', 
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
            console.error('Error saving job:', error);
            Swal.fire('Error!', 
                job ? 'চাকুরী আপডেট করতে সমস্যা হয়েছে' : 'চাকুরী তৈরি করতে সমস্যা হয়েছে', 
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
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold ">
                            {job ? 'চাকুরী এডিট করুন' : 'নতুন চাকুরী যোগ করুন'}
                        </h1>
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
                                placeholder="চাকুরীর শিরোনাম লিখুন"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                required
                            />
                        </div>

                        {/* Description - Rich Text Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                বিবরণ <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                placeholder="চাকুরীর বিস্তারিত বিবরণ, প্রয়োজনীয় যোগ্যতা, বেতন ইত্যাদি লিখুন..."
                                height="300px"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    অবস্থান
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="কাজের অবস্থান"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                />
                            </div>

                            {/* Application Deadline */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    আবেদনের শেষ তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="applicationDeadline"
                                    value={formData.applicationDeadline}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Attachment Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                সংযোজন (ফাইল)
                            </label>
                            <div className="flex items-center space-x-6">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        onChange={handleAttachmentChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
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
                                অবস্থা
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
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
                            <MainButton
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center space-x-2 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#1e90c9]'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{job ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{job ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </MainButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewJobs;