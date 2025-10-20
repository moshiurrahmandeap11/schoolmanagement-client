import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../sharedItems/RichTextEditor/RichTextEditor';

const RecentlyAdmin = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const baseimage = axiosInstance.defaults.baseURL

    const [formData, setFormData] = useState({
        title: '',
        body: ''
    });

    // Fetch all items
    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/recently');
            setItems(response.data.data);
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load recent items',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle main image file selection
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
                setImagePreview(reader?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle body editor image upload (separate upload)
    const handleEditorImageUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axiosInstance.post('/recently/upload-editor-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Return the image URL - FIXED: Use direct URL without baseImageURL
            return `/api${response.data.data.imageUrl}`;
        } catch (error) {
            console.error('Editor image upload failed:', error);
            throw error;
        }
    };

    // Remove main image
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    // Handle rich text editor change
    const handleBodyChange = (content) => {
        setFormData(prev => ({
            ...prev,
            body: content
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            body: ''
        });
        setImageFile(null);
        setImagePreview('');
        setIsEditing(false);
        setCurrentItem(null);
    };

    // Create new item
    const handleCreate = async (e) => {
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

            await axiosInstance.post('/recently', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Recent item created successfully',
                background: '#1f2937',
                color: '#fff'
            });
            
            resetForm();
            fetchItems();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to create item',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setSaving(false);
        }
    };

    // Update item
    const handleUpdate = async (e) => {
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

            await axiosInstance.put(`/recently/${currentItem._id}`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Recent item updated successfully',
                background: '#1f2937',
                color: '#fff'
            });
            
            resetForm();
            fetchItems();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update item',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setSaving(false);
        }
    };

    // Edit item
    const handleEdit = (item) => {
        setFormData({
            title: item.title,
            body: item.body
        });
        
        if (item.image) {
            // FIXED: Use correct image URL
            setImagePreview(`/api${item.image}`);
        }
        
        setIsEditing(true);
        setCurrentItem(item);
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete item
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            background: '#1f2937',
            color: '#fff'
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            await axiosInstance.delete(`/recently/${id}`);
            
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Recent item has been deleted.',
                background: '#1f2937',
                color: '#fff'
            });
            
            fetchItems();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to delete item',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    // Toggle active status
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await axiosInstance.patch(`/recently/${id}/toggle`);
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Item ${!currentStatus ? 'activated' : 'deactivated'}`,
                background: '#1f2937',
                color: '#fff'
            });
            
            fetchItems();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to toggle status',
                background: '#1f2937',
                color: '#fff'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-black bg-clip-text text-transparent">
                        Recently Admin
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Manage recent announcements and updates</p>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isEditing ? 'Edit Recent Item' : 'Create New Recent Item'}
                        </h2>
                    </div>

                    <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-6">
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
                                placeholder="Enter title"
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
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Body Content *
                            </label>
                            <RichTextEditor
                                value={formData.body}
                                onChange={handleBodyChange}
                                onImageUpload={handleEditorImageUpload}
                                placeholder="Start writing your content here..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
                            >
                                {saving ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                                    </div>
                                ) : (
                                    isEditing ? 'Update Item' : 'Create Item'
                                )}
                            </button>
                            
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 font-semibold"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Items List */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">All Recent Items</h2>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {items.length} items
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg">No recent items created yet</p>
                                <p className="text-gray-400">Create your first item to get started</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {items.map((item) => (
                                    <div key={item._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white">
                                        {item.image && (
                                            <div className="h-48">
                                                <img 
                                                    src={`${baseimage}${item.image}`} 
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        // Fallback image if original fails to load
                                                        e.target.src = 'https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=500';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-bold text-gray-800 text-lg flex-1 mr-2">
                                                    {item.title}
                                                </h3>
                                                <button
                                                    onClick={() => handleToggleStatus(item._id, item.isActive)}
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                                        item.isActive 
                                                            ? 'bg-green-500 text-white' 
                                                            : 'bg-red-500 text-white'
                                                    }`}
                                                >
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </div>
                                            
                                            <div 
                                                className="text-sm text-gray-600 mb-4 line-clamp-3"
                                                dangerouslySetInnerHTML={{ __html: item.body }}
                                            />
                                            
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                                                <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecentlyAdmin;