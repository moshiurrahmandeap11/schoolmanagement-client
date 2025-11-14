// AddNewCommitteeMember.jsx
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AddNewCommitteeMember = ({ member, onClose }) => {
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        phone: '',
        description: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState('');

    // যদি এডিট মোডে থাকে, ফর্ম ডেটা সেট করুন
    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name || '',
                designation: member.designation || '',
                phone: member.phone || '',
                description: member.description || '',
                image: null
            });
            if (member.image) {
                setImagePreview(`${baseImageURL}${member.image}`);
            }
        }
    }, [member]);

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

    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            designation: '',
            phone: '',
            description: '',
            image: null
        });
        setImagePreview('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim()) {
            Swal.fire('Error!', 'নাম প্রয়োজন', 'error');
            return;
        }
        if (!formData.designation.trim()) {
            Swal.fire('Error!', 'পদবী প্রয়োজন', 'error');
            return;
        }
        if (!member && !formData.image) {
            Swal.fire('Error!', 'ছবি প্রয়োজন', 'error');
            return;
        }
        if (!formData.description.trim()) {
            Swal.fire('Error!', 'বিবরণ প্রয়োজন', 'error');
            return;
        }

        // Phone validation (optional)
        if (formData.phone && !/^(?:\+88|01)?\d{9,11}$/.test(formData.phone)) {
            Swal.fire('Error!', 'সঠিক ফোন নম্বর দিন', 'error');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('designation', formData.designation.trim());
            formDataToSend.append('phone', formData.phone || '');
            formDataToSend.append('description', formData.description.trim());
            
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            let response;
            if (member) {
                // Edit mode
                response = await axiosInstance.put(`/managing-committee/${member._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Add mode
                response = await axiosInstance.post('/managing-committee', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            if (response.data.success) {
                Swal.fire('Success!', 
                    member ? 'কমিটি মেম্বার সফলভাবে আপডেট হয়েছে' : 'কমিটি মেম্বার সফলভাবে যোগ হয়েছে', 
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
            console.error('Error saving member:', error);
            Swal.fire('Error!', 
                member ? 'কমিটি মেম্বার আপডেট করতে সমস্যা হয়েছে' : 'কমিটি মেম্বার যোগ করতে সমস্যা হয়েছে', 
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
                            {member ? 'কমিটি মেম্বার এডিট করুন' : 'নতুন কমিটি মেম্বার যোগ করুন'}
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            {member ? 'মেম্বারের তথ্য আপডেট করুন' : 'নতুন কমিটি মেম্বারের তথ্য যোগ করুন'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                নাম <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="পূর্ণ নাম লিখুন"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                required
                            />
                        </div>

                        {/* Designation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                পদবী <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                                placeholder="পদবী লিখুন"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ফোন নম্বর
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="০১XXXXXXXXX"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
                                placeholder="কমিটি মেম্বার সম্পর্কে বিস্তারিত বিবরণ লিখুন..."
                                height="200px"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ছবি {!member && <span className="text-red-500">*</span>}
                            </label>
                            <div className="flex items-center space-x-6">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required={!member}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        JPG, PNG, WebP ইত্যাদি ফরম্যাট সমর্থিত (সর্বোচ্চ ২MB)
                                    </p>
                                    {member && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            বর্তমান ছবি রাখতে চাইলে নতুন ছবি আপলোড না করলেও হবে
                                        </p>
                                    )}
                                </div>
                                {imagePreview && (
                                    <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
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
                                        <span>{member ? 'আপডেট হচ্ছে...' : 'যোগ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{member ? 'আপডেট করুন' : 'যোগ করুন'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewCommitteeMember;