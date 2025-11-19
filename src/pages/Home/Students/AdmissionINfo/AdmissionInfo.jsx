import { useEffect, useState } from 'react';
import axiosInstance from '../../../../hooks/axiosInstance/axiosInstance';


const AdmissionInfo = () => {
    const [admissionData, setAdmissionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAdmissionInfo();
    }, []);

    const fetchAdmissionInfo = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admission-info');
            
            if (response.data.success && response.data.data) {
                setAdmissionData(response.data.data);
            } else {
                setAdmissionData(null);
            }
        } catch (error) {
            console.error('Error fetching admission info:', error);
            setError('Failed to load admission information');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-500 text-lg font-semibold mb-2">
                        Error Loading Information
                    </div>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchAdmissionInfo}
                        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!admissionData || !admissionData.content) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <div className="text-yellow-600 text-xl font-semibold mb-4">
                        No Admission Information Available
                    </div>
                    <p className="text-yellow-700 mb-4">
                        Admission information has not been published yet. Please check back later.
                    </p>
                    <div className="text-yellow-600 text-sm">
                        Last updated: Not available
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header Section */}
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                    ভর্তি তথ্য 
                </h1>
            </div>

            {/* Last Updated Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex flex-wrap items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-[#1e90c9]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[#1e90c9] font-medium">
                            Last updated: {new Date(admissionData.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div className="text-[#1e90c9] text-sm">
                        Created: {new Date(admissionData.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div 
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: admissionData.content }}
                    />
                </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-green-800">Important Notes</h3>
                    </div>
                    <p className="text-green-700 text-sm">
                        Please read all information carefully before applying. Make sure you meet all requirements.
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-blue-800">Deadlines</h3>
                    </div>
                    <p className="text-blue-700 text-sm">
                        Pay close attention to application deadlines. Late submissions may not be accepted.
                    </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-purple-800">Need Help?</h3>
                    </div>
                    <p className="text-purple-700 text-sm">
                        Contact our admission office if you have any questions about the process.
                    </p>
                </div>
            </div>

            {/* Print Button */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print This Page
                </button>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .max-w-6xl {
                        max-width: none !important;
                    }
                    .p-6 {
                        padding: 0 !important;
                    }
                    .bg-blue-50, .bg-green-50, .bg-purple-50 {
                        background-color: transparent !important;
                        border: 1px solid #000 !important;
                    }
                    button {
                        display: none !important;
                    }
                    .shadow-lg {
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdmissionInfo;