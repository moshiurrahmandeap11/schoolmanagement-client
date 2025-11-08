import { useEffect, useState } from 'react';
import { FaArrowLeft, FaBriefcase, FaSave, FaTimes, FaUpload, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AddNewAuthors = ({ editingAuthor, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        biography: ''
    });
    
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Set form data when editing
    useEffect(() => {
        if (editingAuthor) {
            setFormData({
                name: editingAuthor.name || '',
                designation: editingAuthor.designation || '',
                biography: editingAuthor.biography || ''
            });
            
            if (editingAuthor.image) {
                setImagePreview(`${baseImageURL}${editingAuthor.image}`);
            }
        }
    }, [editingAuthor]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBiographyChange = (content) => {
        setFormData(prev => ({
            ...prev,
            biography: content
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
            const response = await axiosInstance.post('/authors/upload', formData, {
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
                text: 'Please enter author name'
            });
            return;
        }

        if (!formData.biography.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter author biography'
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
                image: imageUrl || (editingAuthor ? editingAuthor.image : '')
            };

            let response;
            if (editingAuthor) {
                // Update existing author
                response = await axiosInstance.put(`/authors/${editingAuthor._id}`, submitData);
            } else {
                // Create new author
                response = await axiosInstance.post('/authors', submitData);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: editingAuthor ? 'Author updated successfully!' : 'Author created successfully!'
                });
                
                // Reset form and go back
                setFormData({
                    name: '',
                    designation: '',
                    biography: ''
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
                    text: response.data.message || 'Failed to save author'
                });
            }
        } catch (error) {
            console.error('Error saving author:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to save author'
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            designation: '',
            biography: ''
        });
        setImage(null);
        setImagePreview('');
    };

    const designations = [
        'প্রধান লেখক',
        'সহকারী লেখক',
        'অতিথি লেখক',
        'সম্পাদক',
        'সহ-সম্পাদক',
        'বার্তা সম্পাদক',
        'ফিচার লেখক',
        'কলাম লেখক',
        'প্রবন্ধকার',
        'গবেষক'
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
                        <h1 className="text-xl font-bold text-gray-800">
                            {editingAuthor ? 'এডিট লেখক' : 'নতুন লেখক'}
                        </h1>
                        <p className="text-gray-600 text-sm">
                            {editingAuthor ? 'লেখকের তথ্য আপডেট করুন' : 'নতুন লেখক তৈরি করুন'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* নাম */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        নাম *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="লেখকের পুরো নাম লিখুন"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* পদবি */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        পদবি
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaBriefcase className="text-gray-400" />
                                        </div>
                                        <select
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
                                        >
                                            <option value="">পদবি নির্বাচন করুন</option>
                                            {designations.map((designation, index) => (
                                                <option key={index} value={designation}>
                                                    {designation}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    প্রোফাইল ছবি
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
                                                    className="w-32 h-32 mx-auto object-cover rounded-full border"
                                                />
                                                <p className="text-sm text-gray-600">Click to change image</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                                    <FaUpload className="text-2xl text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-600">Click to upload profile picture</p>
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
                                                <FaTimes className="text-xs" />
                                                Remove Image
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* জীবন বৃত্তান্ত - Rich Text Editor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    জীবন বৃত্তান্ত *
                                </label>
                                <RichTextEditor
                                    value={formData.biography}
                                    onChange={handleBiographyChange}
                                    placeholder="লেখকের জীবন বৃত্তান্ত, শিক্ষাগত যোগ্যতা, অভিজ্ঞতা এবং অন্যান্য তথ্য লিখুন..."
                                    height="300px"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    লেখকের বিস্তারিত জীবন বৃত্তান্ত, শিক্ষাগত যোগ্যতা, পেশাগত অভিজ্ঞতা এবং অন্যান্য গুরুত্বপূর্ণ তথ্য লিখুন
                                </p>
                            </div>

                            {/* Preview Section */}
                            {formData.name && (
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">প্রিভিউ:</h4>
                                    <div className="flex items-start gap-4">
                                        {imagePreview && (
                                            <img 
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-full object-cover border flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h5 className="font-medium text-gray-800">{formData.name}</h5>
                                            {formData.designation && (
                                                <p className="text-sm text-gray-600 mt-1">{formData.designation}</p>
                                            )}
                                            {formData.biography && (
                                                <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                                                    {formData.biography.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                                >
                                    <FaSave className="text-sm" />
                                    {loading 
                                        ? (editingAuthor ? 'Updating...' : 'Creating...') 
                                        : (editingAuthor ? 'Update Author' : 'Create Author')
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

export default AddNewAuthors;