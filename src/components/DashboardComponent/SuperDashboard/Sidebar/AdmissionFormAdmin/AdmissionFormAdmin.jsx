import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';


const AdmissionFormAdmin = () => {
    const [existingForm, setExistingForm] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [dragActive, setDragActive] = useState(false);

    // Fetch existing admission form
    useEffect(() => {
        fetchAdmissionForm();
    }, []);

    const fetchAdmissionForm = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admission-form');
            
            if (response.data.success && response.data.data) {
                setExistingForm(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching admission form:', error);
            showMessage('error', 'Failed to load admission form');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle drop event
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            validateAndSetFile(file);
        }
    };

    // Handle file input change
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            validateAndSetFile(file);
        }
    };

    // Validate and set file
    const validateAndSetFile = (file) => {
        // Check file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif'
        ];

        if (!allowedTypes.includes(file.type)) {
            showMessage('error', 'Invalid file type. Please upload PDF, Word, Excel, or Image files only.');
            return;
        }

        // Check file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showMessage('error', 'File size too large. Maximum size is 10MB.');
            return;
        }

        setSelectedFile(file);
        showMessage('success', 'File selected successfully. Click Upload to proceed.');
    };

    // Upload file
    const handleUpload = async () => {
        if (!selectedFile) {
            showMessage('error', 'Please select a file first');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('admissionForm', selectedFile);

            const response = await axiosInstance.post('/admission-form/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                showMessage('success', 
                    existingForm 
                        ? 'Admission form updated successfully!' 
                        : 'Admission form uploaded successfully!'
                );
                setExistingForm(response.data.data);
                setSelectedFile(null);
                
                // Reset file input
                const fileInput = document.getElementById('file-input');
                if (fileInput) fileInput.value = '';
            } else {
                showMessage('error', response.data.message || 'Failed to upload admission form');
            }
        } catch (error) {
            console.error('Error uploading admission form:', error);
            const errorMessage = error.response?.data?.message || 'Failed to upload admission form';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Delete file
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete the admission form? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.delete('/admission-form');

            if (response.data.success) {
                showMessage('success', 'Admission form deleted successfully!');
                setExistingForm(null);
            } else {
                showMessage('error', response.data.message || 'Failed to delete admission form');
            }
        } catch (error) {
            console.error('Error deleting admission form:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete admission form';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Get file icon based on type
    const getFileIcon = (mimetype) => {
        if (mimetype.includes('pdf')) return '📄';
        if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
        if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
        if (mimetype.includes('image')) return '🖼️';
        return '📎';
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Admission Form Management
                </h1>
                <p className="text-gray-600">
                    Upload and manage the admission form file. Only one form can be uploaded at a time.
                </p>
            </div>

            {/* Message Display */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-700' 
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                        <span className="text-blue-700">Processing...</span>
                    </div>
                </div>
            )}

            {/* File Upload Area */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload Admission Form *
                </label>
                
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        dragActive 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    />
                    
                    <div className="space-y-3">
                        <div className="text-4xl">📤</div>
                        <div>
                            <p className="text-lg font-medium text-gray-700">
                                {selectedFile ? selectedFile.name : 'Click to select or drag and drop'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Supports PDF, Word, Excel, and Image files (Max 10MB)
                            </p>
                        </div>
                        {selectedFile && (
                            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                                ✓ {selectedFile.name} ({formatFileSize(selectedFile.size)})
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end mb-8">
                {/* Upload Button */}
                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={loading || !selectedFile}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {loading ? 'Uploading...' : 'Upload Form'}
                </button>
            </div>

            {/* Existing Form Display */}
            {existingForm && (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Admission Form</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex items-center space-x-4">
                            <span className="text-3xl">{getFileIcon(existingForm.mimetype)}</span>
                            <div>
                                <p className="font-medium text-gray-800">{existingForm.originalName}</p>
                                <p className="text-sm text-gray-500">
                                    {formatFileSize(existingForm.size)} • 
                                    Uploaded on {new Date(existingForm.uploadedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex space-x-2">
                            <a
                                href={`/api/admission-form/download/${existingForm.filename}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                                Download
                            </a>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">Instructions:</h3>
                <ul className="text-blue-700 text-sm space-y-2">
                    <li>• Only one admission form can be uploaded at a time</li>
                    <li>• Supported formats: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), Images</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• Uploading a new file will replace the existing one</li>
                    <li>• Students will be able to download this form from the admission page</li>
                </ul>
            </div>
        </div>
    );
};

export default AdmissionFormAdmin;