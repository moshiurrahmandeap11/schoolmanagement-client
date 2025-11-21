import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';


const AddBlogCategory = ({ category, onClose }) => {
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: ''
    });

    // যদি এডিট মোডে থাকে, ফর্ম ডেটা সেট করুন
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || ''
            });
        }
    }, [category]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: ''
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim()) {
            Swal.fire('Error!', 'ক্যাটাগরি নাম প্রয়োজন', 'error');
            return;
        }

        // Name length validation
        if (formData.name.trim().length < 2) {
            Swal.fire('Error!', 'ক্যাটাগরি নাম কমপক্ষে ২ অক্ষরের হতে হবে', 'error');
            return;
        }

        if (formData.name.trim().length > 50) {
            Swal.fire('Error!', 'ক্যাটাগরি নাম ৫০ অক্ষরের বেশি হতে পারবে না', 'error');
            return;
        }

        setLoading(true);

        try {
            let response;
            if (category) {
                // Edit mode
                response = await axiosInstance.put(`/blog-category/${category._id}`, formData);
            } else {
                // Add mode
                response = await axiosInstance.post('/blog-category', formData);
            }

            if (response.data && response.data.success) {
                Swal.fire('Success!', 
                    category ? 'ব্লগ ক্যাটাগরি সফলভাবে আপডেট হয়েছে' : 'ব্লগ ক্যাটাগরি সফলভাবে তৈরি হয়েছে', 
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
            console.error('Error saving category:', error);
            
            // Handle duplicate category error
            if (error.response?.data?.message?.includes('ইতিমধ্যে')) {
                Swal.fire('Error!', error.response.data.message, 'error');
            } else {
                Swal.fire('Error!', 
                    category ? 'ব্লগ ক্যাটাগরি আপডেট করতে সমস্যা হয়েছে' : 'ব্লগ ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে', 
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
                        <h1 className="text-2xl font-bold ">
                            {category ? 'ব্লগ ক্যাটাগরি এডিট করুন' : 'নতুন ব্লগ ক্যাটাগরি যোগ করুন'}
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Category Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ক্যাটাগরী নাম <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="ব্লগ ক্যাটাগরির নাম লিখুন"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                required
                                maxLength={50}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    কমপক্ষে ২ অক্ষর, সর্বোচ্চ ৫০ অক্ষর
                                </p>
                                <span className="text-xs text-gray-500">
                                    {formData.name.length}/50
                                </span>
                            </div>
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
                                        <span>{category ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{category ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </MainButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBlogCategory;