import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaTimes, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';

const AddNewEvents = ({ editingEvent, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        address: '',
        description: '',
        status: 'Draft'
    });
    
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Set form data when editing
    useEffect(() => {
        if (editingEvent) {
            setFormData({
                name: editingEvent.name || '',
                date: editingEvent.date ? new Date(editingEvent.date).toISOString().split('T')[0] : '',
                startTime: editingEvent.startTime || '',
                endTime: editingEvent.endTime || '',
                address: editingEvent.address || '',
                description: editingEvent.description || '',
                status: editingEvent.status || 'Draft'
            });
            
            if (editingEvent.images && editingEvent.images.length > 0) {
                setImagePreviews(editingEvent.images.map(img => `${axiosInstance.defaults.baseURL}${img}`));
            }
        }
    }, [editingEvent]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Validate files
        const validFiles = files.filter(file => {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            const maxSize = 2 * 1024 * 1024; // 2MB

            if (!allowedTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid File',
                    text: `${file.name} is not a valid image file`
                });
                return false;
            }

            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'error',
                    title: 'File Too Large',
                    text: `${file.name} is larger than 2MB`
                });
                return false;
            }

            return true;
        });

        setImages(prev => [...prev, ...validFiles]);

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async () => {
        const uploadedImageUrls = [];

        for (const image of images) {
            const formData = new FormData();
            formData.append('image', image);

            try {
                const response = await axiosInstance.post('/events/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                });

                if (response.data.success) {
                    uploadedImageUrls.push(response.data.fileUrl);
                } else {
                    throw new Error('Upload failed');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                throw error;
            }
        }

        return uploadedImageUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim() || !formData.date) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fill in all required fields (নাম, তারিখ)'
            });
            return;
        }

        // Date validation
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Event date cannot be in the past'
            });
            return;
        }

        try {
            setLoading(true);

            // Upload new images
            let uploadedImageUrls = [];
            if (images.length > 0) {
                uploadedImageUrls = await uploadImages();
            }

            // Prepare data for submission
            const submitData = {
                ...formData,
                images: editingEvent ? 
                    [...(editingEvent.images || []), ...uploadedImageUrls] : 
                    uploadedImageUrls
            };

            let response;
            if (editingEvent) {
                // Update existing event
                response = await axiosInstance.put(`/events/${editingEvent._id}`, submitData);
            } else {
                // Create new event
                response = await axiosInstance.post('/events', submitData);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: editingEvent ? 'Event updated successfully!' : 'Event created successfully!'
                });
                
                // Reset form and go back
                setFormData({
                    name: '',
                    date: '',
                    startTime: '',
                    endTime: '',
                    address: '',
                    description: '',
                    status: 'Draft'
                });
                setImages([]);
                setImagePreviews([]);
                
                if (onBack) {
                    onBack();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: response.data.message || 'Failed to save event'
                });
            }
        } catch (error) {
            console.error('Error saving event:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to save event'
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            date: '',
            startTime: '',
            endTime: '',
            address: '',
            description: '',
            status: 'Draft'
        });
        setImages([]);
        setImagePreviews([]);
    };

    const statusOptions = [
        { value: 'Published', label: 'Published' },
        { value: 'Draft', label: 'Draft' },
        { value: 'Expired', label: 'Expired' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 sm:p-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {editingEvent ? 'এডিট ইভেন্ট' : 'নতুন ইভেন্ট'}
                        </h1>
                        <p className="text-gray-600">
                            {editingEvent ? 'ইভেন্ট তথ্য আপডেট করুন' : 'নতুন ইভেন্ট তৈরি করুন'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* নাম */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    নাম *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="ইভেন্টের নাম লিখুন"
                                    required
                                />
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* তারিখ */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        তারিখ *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* শুরুর সময় */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শুরুর সময়
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* শেষ সময় */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শেষ সময়
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* ঠিকানা */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ঠিকানা
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="ইভেন্টের ঠিকানা লিখুন"
                                />
                            </div>

                            {/* অবস্থান */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    অবস্থান
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* বিবরণ - Rich Text Editor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বিবরণ
                                </label>
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    placeholder="ইভেন্টের বিস্তারিত বিবরণ লিখুন..."
                                />
                            </div>

                            {/* ছবি - Multiple File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ছবি (Multiple)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer block text-center">
                                        <div className="space-y-2">
                                            <FaUpload className="text-3xl text-gray-400 mx-auto" />
                                            <p className="text-sm text-gray-600">Click to upload images</p>
                                            <p className="text-xs text-gray-500">Supported formats: JPEG, PNG, GIF (Max 2MB each)</p>
                                        </div>
                                    </label>
                                    
                                    {/* Upload Progress */}
                                    {uploadProgress > 0 && (
                                        <div className="mt-4">
                                            <div className="bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-600 text-center mt-1">
                                                Uploading: {uploadProgress}%
                                            </p>
                                        </div>
                                    )}

                                    {/* Image Previews */}
                                    {(imagePreviews.length > 0 || (editingEvent && editingEvent.images)) && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Selected Images ({imagePreviews.length + (editingEvent?.images?.length || 0)})
                                            </p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {/* Existing images from editing */}
                                                {editingEvent?.images?.map((img, index) => (
                                                    <div key={`existing-${index}`} className="relative">
                                                        <img 
                                                            src={`${axiosInstance.defaults.baseURL}${img}`}
                                                            alt={`Existing ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg border"
                                                        />
                                                        <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                                            Existing
                                                        </span>
                                                    </div>
                                                ))}
                                                
                                                {/* New image previews */}
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative">
                                                        <img 
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg border"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <FaSave />
                                    {loading 
                                        ? (editingEvent ? 'Updating...' : 'Creating...') 
                                        : (editingEvent ? 'Update Event' : 'Create Event')
                                    }
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewEvents;