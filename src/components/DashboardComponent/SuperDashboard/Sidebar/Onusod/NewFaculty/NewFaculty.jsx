// NewFaculty.jsx - Updated version
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import RichTextEditor from '../../../../../sharedItems/RichTextEditor/RichTextEditor';

const NewFaculty = ({ faculty, onClose }) => {
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    // যদি এডিট মোডে থাকে, ফর্ম ডেটা সেট করুন
    useEffect(() => {
        if (faculty) {
            setFormData({
                name: faculty.name || '',
                description: faculty.description || ''
            });
        }
    }, [faculty]);

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

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: ''
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim()) {
            Swal.fire('Error!', 'ফ্যাকাল্টি নাম প্রয়োজন', 'error');
            return;
        }

        if (!formData.description.trim()) {
            Swal.fire('Error!', 'বিবরণ প্রয়োজন', 'error');
            return;
        }

        // Name length validation
        if (formData.name.trim().length < 2) {
            Swal.fire('Error!', 'ফ্যাকাল্টি নাম কমপক্ষে ২ অক্ষরের হতে হবে', 'error');
            return;
        }

        if (formData.name.trim().length > 100) {
            Swal.fire('Error!', 'ফ্যাকাল্টি নাম ১০০ অক্ষরের বেশি হতে পারবে না', 'error');
            return;
        }

        setLoading(true);

        try {
            let response;
            if (faculty) {
                // Edit mode
                response = await axiosInstance.put(`/faculty/${faculty._id}`, formData);
            } else {
                // Add mode
                response = await axiosInstance.post('/faculty', formData);
            }

            if (response.data && response.data.success) {
                Swal.fire('Success!', 
                    faculty ? 'ফ্যাকাল্টি সফলভাবে আপডেট হয়েছে' : 'ফ্যাকাল্টি সফলভাবে তৈরি হয়েছে', 
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
            console.error('Error saving faculty:', error);
            
            // Handle duplicate faculty error
            if (error.response?.data?.message?.includes('ইতিমধ্যে')) {
                Swal.fire('Error!', error.response.data.message, 'error');
            } else {
                Swal.fire('Error!', 
                    faculty ? 'ফ্যাকাল্টি আপডেট করতে সমস্যা হয়েছে' : 'ফ্যাকাল্টি তৈরি করতে সমস্যা হয়েছে', 
                    'error'
                );
            }
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

    // Generate slug preview
    const generateSlug = (name) => {
        return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold">
                            {faculty ? 'অনুষদ এডিট করুন' : 'নতুন অনুষদ যোগ করুন'}
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Faculty Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="অনুষদের নাম লিখুন"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                required
                                maxLength={100}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    কমপক্ষে ২ অক্ষর, সর্বোচ্চ ১০০ অক্ষর
                                </p>
                                <span className="text-xs text-gray-500">
                                    {formData.name.length}/100
                                </span>
                            </div>
                        </div>

                        {/* Description - Rich Text Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                placeholder="অনুষদ সম্পর্কে বিস্তারিত বিবরণ লিখুন..."
                                height="300px"
                            />
                        </div>

                        {/* Slug Preview */}
                        {formData.name.trim() && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">স্লাগ প্রিভিউ:</h4>
                                <div className="text-sm text-gray-600 bg-white border border-gray-300 rounded px-3 py-2 font-mono">
                                    {generateSlug(formData.name)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    এই স্লাগটি স্বয়ংক্রিয়ভাবে জেনারেট হবে
                                </p>
                            </div>
                        )}

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
                                        <span>{faculty ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{faculty ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </MainButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewFaculty;