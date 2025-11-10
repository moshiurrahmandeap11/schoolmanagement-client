import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../sharedItems/Loader/Loader';
import RichTextEditor from '../../../../sharedItems/RichTextEditor/RichTextEditor';

const SchoolHistory = () => {
    const [historyData, setHistoryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        body: ''
    });

    // Fetch school history
    const fetchSchoolHistory = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/school-history');
            if (response.data.success && response.data.data) {
                setHistoryData(response.data.data);
                setFormData({
                    title: response.data.data.title || '',
                    body: response.data.data.body || ''
                });
                if (response.data.data.image) {
                    setImagePreview(`/api${response.data.data.image}`);
                }
            }
        } catch (error) {
            console.error('Failed to fetch school history:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load school history',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchoolHistory();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning',
                    text: 'Image size should be less than 5MB',
                    background: '#1f2937',
                    color: '#fff'
                });
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning',
                    text: 'Please select a valid image file',
                    background: '#1f2937',
                    color: '#fff'
                });
                return;
            }

            setImageFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle body editor change
    const handleBodyChange = (content) => {
        setFormData(prev => ({
            ...prev,
            body: content
        }));
    };

    // Remove image
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.body) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Title and body are required',
                background: '#1f2937',
                color: '#fff'
            });
            return;
        }

        try {
            setSaving(true);

            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('body', formData.body);
            
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            // If history exists, update it; otherwise create new
            const url = historyData ? `/school-history/${historyData._id}` : '/school-history';
            const method = historyData ? 'put' : 'post';

            await axiosInstance[method](url, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: historyData ? 'School history updated successfully' : 'School history created successfully',
                background: '#1f2937',
                color: '#fff'
            });
            
            fetchSchoolHistory();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to save school history',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setSaving(false);
        }
    };


    const baseImage = axiosInstance.defaults.baseURL;


    if(loading){
        return <Loader></Loader>
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        School History Management
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Manage your school's history and legacy</p>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {historyData ? 'Edit School History' : 'Create School History'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter school history title"
                                required
                            />
                        </div>

                        {/* Featured Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Featured Image (Optional)
                            </label>
                            
                            {imagePreview ? (
                                <div className="relative inline-block">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Body Content */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                History Content *
                            </label>
                            <RichTextEditor
                                value={formData.body}
                                onChange={handleBodyChange}
                                placeholder="Write your school's history here..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving || loading}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
                            >
                                {saving ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{historyData ? 'Updating...' : 'Creating...'}</span>
                                    </div>
                                ) : (
                                    historyData ? 'Update History' : 'Create History'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                {historyData && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800">History Preview</h2>
                        </div>
                        
                        <div className="p-6">
                            {/* Featured Image Preview */}
                            {historyData.image && (
                                <div className="mb-6">
                                    <img 
                                        src={`${baseImage}${historyData.image}`}
                                        alt={historyData.title}
                                        className="w-full h-64 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            
                            {/* Title Preview */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {historyData.title}
                            </h1>
                            
                            {/* Body Content Preview */}
                            <div 
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: historyData.body }}
                            />
                            
                            {/* Last Updated */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500">
                                    Last updated: {new Date(historyData.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchoolHistory;