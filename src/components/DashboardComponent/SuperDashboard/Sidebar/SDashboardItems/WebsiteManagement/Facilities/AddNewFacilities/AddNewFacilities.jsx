import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AddNewFacilities = ({ editingFacility, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Set form data when editing
    useEffect(() => {
        if (editingFacility) {
            setFormData({
                name: editingFacility.name || '',
                description: editingFacility.description || ''
            });
            
            if (editingFacility.image) {
                setImagePreview(`${baseImageURL}${editingFacility.image}`);
            }
        }
    }, [editingFacility]);

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
        const file = e.target.files[0];
        if (file) {
            // Validate file type and size
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            const maxSize = 2 * 1024 * 1024; // 2MB

            if (!allowedTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid File',
                    text: 'Please select a valid image file (JPEG, PNG, GIF)'
                });
                return;
            }

            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'error',
                    title: 'File Too Large',
                    text: 'Image size should be less than 2MB'
                });
                return;
            }

            setImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview('');
    };

    const uploadImage = async () => {
        if (!image) return null;

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axiosInstance.post('/facilities/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.data.success) {
                return response.data.fileUrl;
            }
            throw new Error('Upload failed');
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter facility name'
            });
            return;
        }

        if (!formData.description.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter facility description'
            });
            return;
        }

        try {
            setLoading(true);

            // Upload image if new one is selected
            let imageUrl = null;
            if (image) {
                imageUrl = await uploadImage();
            }

            // Prepare data for submission
            const submitData = {
                ...formData,
                image: imageUrl || (editingFacility ? editingFacility.image : '')
            };

            let response;
            if (editingFacility) {
                // Update existing facility
                response = await axiosInstance.put(`/facilities/${editingFacility._id}`, submitData);
            } else {
                // Create new facility
                response = await axiosInstance.post('/facilities', submitData);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: editingFacility ? 'Facility updated successfully!' : 'Facility created successfully!'
                });
                
                // Reset form and go back
                setFormData({
                    name: '',
                    description: ''
                });
                setImage(null);
                setImagePreview('');
                
                if (onBack) {
                    onBack();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: response.data.message || 'Failed to save facility'
                });
            }
        } catch (error) {
            console.error('Error saving facility:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to save facility'
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            description: ''
        });
        setImage(null);
        setImagePreview('');
    };

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
                        <h1 className="text-xl font-bold text-gray-800">
                            {editingFacility ? 'এডিট সুবিধা' : 'নতুন সুবিধা'}
                        </h1>
                        <p className="text-gray-600 text-sm">
                            {editingFacility ? 'সুবিধা তথ্য আপডেট করুন' : 'নতুন সুবিধা তৈরি করুন'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-lg shadow border border-gray-200">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="সুবিধার নাম লিখুন"
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ছবি
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer block text-center">
                                        {imagePreview ? (
                                            <div className="space-y-2">
                                                <img 
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-32 h-32 mx-auto object-cover rounded-lg border"
                                                />
                                                <p className="text-sm text-gray-600">Click to change image</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <FaUpload className="text-3xl text-gray-400 mx-auto" />
                                                <p className="text-sm text-gray-600">Click to upload image</p>
                                                <p className="text-xs text-gray-500">Supported formats: JPEG, PNG, GIF (Max 2MB)</p>
                                            </div>
                                        )}
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

                                    {/* Remove Image Button */}
                                    {imagePreview && (
                                        <div className="mt-4 text-center">
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs flex items-center gap-1 mx-auto"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* বিবরণ - Rich Text Editor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বিবরণ *
                                </label>
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    placeholder="সুবিধার বিস্তারিত বিবরণ লিখুন..."
                                    height="200px"
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                                >
                                    <FaSave className="text-sm" />
                                    {loading 
                                        ? (editingFacility ? 'Updating...' : 'Creating...') 
                                        : (editingFacility ? 'Update Facility' : 'Create Facility')
                                    }
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={loading}
                                    className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium text-sm"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={loading}
                                    className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium text-sm"
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

export default AddNewFacilities;