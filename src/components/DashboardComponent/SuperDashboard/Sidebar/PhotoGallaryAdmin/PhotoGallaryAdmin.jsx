import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';

const PhotoGalleryAdmin = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [caption, setCaption] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/gallery/photos');
            if (response.data.success) {
                setPhotos(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching photos:', error);
            Swal.fire('Error!', 'ফটো লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...imageFiles]);
        } else {
            Swal.fire('Error!', 'শুধুমাত্র ইমেজ ফাইল সিলেক্ট করুন', 'error');
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...imageFiles]);
        } else {
            Swal.fire('Error!', 'শুধুমাত্র ইমেজ ফাইল সিলেক্ট করুন', 'error');
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!caption) {
            Swal.fire('Error!', 'ক্যাপশন লিখুন', 'error');
            return;
        }

        if (selectedFiles.length === 0) {
            Swal.fire('Error!', 'অন্তত একটি ছবি সিলেক্ট করুন', 'error');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('caption', caption);
            selectedFiles.forEach((file) => {
                formData.append('photos', file);
            });

            const response = await axiosInstance.post('/gallery/photos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Swal.fire('Success!', 'ফটো সফলভাবে যুক্ত হয়েছে', 'success');
                setShowAddModal(false);
                setCaption('');
                setSelectedFiles([]);
                fetchPhotos();
            }
        } catch (error) {
            console.error('Error uploading photos:', error);
            Swal.fire('Error!', 'ফটো আপলোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setUploading(false);
        }
    };

    const imageu = axiosInstance.defaults.baseURL;

    const handleDelete = async (id, imageUrl) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত করুন',
            text: 'আপনি কি এই ফটো ডিলিট করতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন',
            cancelButtonText: 'না'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/gallery/photos/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'ফটো ডিলিট হয়েছে', 'success');
                    fetchPhotos();
                }
            } catch (error) {
                console.error('Error deleting photo:', error);
                Swal.fire('Error!', 'ফটো ডিলিট করতে সমস্যা হয়েছে', 'error');
            }
        }
    };

    const toggleStatus = async (id) => {
        try {
            const response = await axiosInstance.patch(`/gallery/photos/${id}/toggle`);
            if (response.data.success) {
                Swal.fire('Success!', response.data.message, 'success');
                fetchPhotos();
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            Swal.fire('Error!', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Photo Gallery</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        + Add New Photos
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {photos.map((photo) => (
                        <div key={photo._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative aspect-square">
                                <img
                                    src={`${imageu}${photo.image}`}
                                    alt={photo.caption}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 line-clamp-2">{photo.caption}</h3>
                                
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        photo.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {photo.isActive ? 'Active' : 'Inactive'}
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleStatus(photo._id)}
                                            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                                        >
                                            Toggle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(photo._id, photo.image)}
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {photos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">কোন ফটো পাওয়া যায়নি</p>
                    </div>
                )}

                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">Add New Photos</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Caption</label>
                                    <input
                                        type="text"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter photo caption"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Photos</label>
                                    
                                    {/* Drag & Drop Area */}
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                            dragActive 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-300 hover:border-blue-400'
                                        }`}
                                    >
                                        <div className="text-gray-500">
                                            <svg className="mx-auto h-12 w-12 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="text-lg mb-2">Drag and drop images here</p>
                                            <p className="text-sm">or click to select files</p>
                                        </div>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                {/* Selected Files Preview */}
                                {selectedFiles.length > 0 && (
                                    <div>
                                        <p className="text-gray-700 font-medium mb-2">
                                            Selected Files ({selectedFiles.length})
                                        </p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        className="w-full h-24 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                    <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={uploading}
                                        className={`flex-1 px-6 py-2 rounded-lg transition-colors font-medium ${
                                            uploading 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white`}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Photos'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setCaption('');
                                            setSelectedFiles([]);
                                        }}
                                        disabled={uploading}
                                        className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoGalleryAdmin;