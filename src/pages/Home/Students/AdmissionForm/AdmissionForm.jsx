import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../hooks/axiosInstance/axiosInstance';


const AdmissionForm = () => {
    const [admissionForm, setAdmissionForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAdmissionForm();
    }, []);

    const fetchAdmissionForm = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admission-form');
            
            if (response.data.success && response.data.data) {
                setAdmissionForm(response.data.data);
            } else {
                setAdmissionForm(null);
            }
        } catch (error) {
            console.error('Error fetching admission form:', error);
            setError('Failed to load admission form. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!admissionForm) return;

        try {
            // Create a temporary anchor element for download
            const response = await axiosInstance.get(`/admission-form/download/${admissionForm.filename}`, {
                responseType: 'blob'
            });

            // Create blob URL for download
            const blob = new Blob([response.data], { type: admissionForm.mimetype });
            const url = window.URL.createObjectURL(blob);
            
            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = admissionForm.originalName;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            setError('Failed to download file. Please try again.');
        }
    };

    const getFileIcon = (mimetype) => {
        if (mimetype.includes('pdf')) return '📄';
        if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
        if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
        if (mimetype.includes('image')) return '🖼️';
        return '📎';
    };

    const getFileType = (mimetype) => {
        if (mimetype.includes('pdf')) return 'PDF Document';
        if (mimetype.includes('word') || mimetype.includes('document')) return 'Word Document';
        if (mimetype.includes('excel') || mimetype.includes('sheet')) return 'Excel Spreadsheet';
        if (mimetype.includes('image')) return 'Image File';
        return 'Document';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading admission form...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Form</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button
                            onClick={fetchAdmissionForm}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!admissionForm) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-8 text-center">
                        <div className="text-yellow-500 text-6xl mb-4">📝</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Admission Form</h2>
                        <p className="text-gray-600 mb-4 text-lg">
                            The admission form is currently being prepared and will be available soon.
                        </p>
                        <div className="text-sm text-gray-500">
                            Please check back later for updates.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        Admission Form
                    </h1>
                    <div className="w-20 h-1 bg-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">
                        Download the official admission form to apply
                    </p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* File Information Section */}
                    <div className="p-6 sm:p-8 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            {/* File Icon and Basic Info */}
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="text-5xl sm:text-6xl">
                                    {getFileIcon(admissionForm.mimetype)}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                                        {admissionForm.originalName}
                                    </h2>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                            </svg>
                                            {getFileType(admissionForm.mimetype)}
                                        </span>
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            {formatFileSize(admissionForm.size)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Download Button */}
                            <div className="shrink-0">
                                <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center space-x-3"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download Form</span>
                </button>
            </div>
        </div>
    </div>

    {/* Additional Information */}
    <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Information */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                    </svg>
                    File Information
                </h3>
                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-blue-700">File Type:</dt>
                        <dd className="text-blue-900 font-medium">{getFileType(admissionForm.mimetype)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-blue-700">File Size:</dt>
                        <dd className="text-blue-900 font-medium">{formatFileSize(admissionForm.size)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-blue-700">Uploaded:</dt>
                        <dd className="text-blue-900 font-medium">{formatDate(admissionForm.uploadedAt)}</dd>
                    </div>
                </dl>
            </div>

            {/* Instructions */}
            <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Instructions
                </h3>
                <ul className="text-green-700 text-sm space-y-1">
                    <li>• Click "Download Form" to get the file</li>
                    <li>• Fill out the form completely</li>
                    <li>• Submit before the deadline</li>
                    <li>• Contact us if you need help</li>
                </ul>
            </div>
        </div>
    </div>
</div>

{/* Support Section */}
<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-3xl mb-3">📋</div>
        <h3 className="font-semibold text-gray-800 mb-2">Complete the Form</h3>
        <p className="text-gray-600 text-sm">
            Fill out all required fields accurately and completely.
        </p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-3xl mb-3">⏰</div>
        <h3 className="font-semibold text-gray-800 mb-2">Check Deadlines</h3>
        <p className="text-gray-600 text-sm">
            Make sure to submit before the application deadline.
        </p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-3xl mb-3">📞</div>
        <h3 className="font-semibold text-gray-800 mb-2">Get Help</h3>
        <p className="text-gray-600 text-sm">
            Contact our admission office for any questions.
        </p>
    </div>
</div>

{/* Contact Information */}
<div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">Need Assistance?</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <h4 className="font-medium text-gray-700 mb-2">Admission Office</h4>
            <div className="space-y-2 text-sm text-gray-600">
                <p>📍 123 Education Street, City, State 12345</p>
                <p>📞 (555) 123-4567</p>
                <p>✉️ admissions@school.edu</p>
            </div>
        </div>
        <div>
            <h4 className="font-medium text-gray-700 mb-2">Office Hours</h4>
            <div className="space-y-1 text-sm text-gray-600">
                <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p>Saturday: 9:00 AM - 1:00 PM</p>
                <p>Sunday: Closed</p>
            </div>
        </div>
    </div>
</div>
</div>
</div>
    );
};

export default AdmissionForm;