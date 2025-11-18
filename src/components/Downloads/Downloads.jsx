import { useEffect, useState } from 'react';
import axiosInstance, { baseImageURL } from '../../hooks/axiosInstance/axiosInstance';
import Loader from '../sharedItems/Loader/Loader';
import MainButton from '../sharedItems/Mainbutton/Mainbutton';

const Downloads = () => {
    const [admissionForm, setAdmissionForm] = useState(null);
    const [circulars, setCirculars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDownloadData();
    }, []);

    const fetchDownloadData = async () => {
        try {
            setLoading(true);
            
            // Fetch admission form and circulars simultaneously
            const [admissionResponse, circularsResponse] = await Promise.all([
                axiosInstance.get('/admission-form'),
                axiosInstance.get('/circulars?page=1&limit=10')
            ]);

            if (admissionResponse.data.success) {
                setAdmissionForm(admissionResponse.data.data);
            }

            if (circularsResponse.data.success) {
                setCirculars(circularsResponse.data.data || []);
            }

        } catch (error) {
            console.error('Error fetching download data:', error);
            setError('ডাউনলোড তথ্য লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

  const handleDownload = async (filePath, fileName, fileType, itemId = null) => {
    try {
        // For circulars, increment download count
        if (itemId) {
            await axiosInstance.patch(`/circulars/${itemId}/download`);
        }

        // Create download link - use the filePath directly as it's now a relative path
        const fullUrl = `${baseImageURL}${filePath}`;
        
        console.log('Download URL:', fullUrl); // Debug log

        // Create temporary anchor element for download
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error('Error downloading file:', error);
        alert('ফাইল ডাউনলোড করতে সমস্যা হয়েছে');
    }
};

    const getFileIcon = (fileType, fileExtension) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('word') || fileExtension === '.doc' || fileExtension === '.docx') return '📝';
        if (fileType.includes('excel') || fileExtension === '.xls' || fileExtension === '.xlsx') return '📊';
        if (fileType.includes('zip') || fileExtension === '.rar') return '📦';
        return '📎';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center max-w-md w-full">
                    <div className="text-red-500 text-4xl mb-3">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">লোড করতে সমস্যা</h3>
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                    <MainButton
                        onClick={fetchDownloadData}
                    >
                        আবার চেষ্টা করুন
                    </MainButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
                        ডাউনলোড সেকশন
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        প্রয়োজনীয় ফরম এবং সার্কুলার ডাউনলোড করুন
                    </p>
                    <div className="w-32 h-1 bg-blue-500 mx-auto mt-6"></div>
                </div>

                {/* Admission Form Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-blue-500">📋</span>
                        ভর্তি ফরম
                    </h2>

                    {admissionForm ? (
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">📄</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            ভর্তি ফরম
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            ফাইল সাইজ: {formatFileSize(admissionForm.size)}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            আপলোড: {new Date(admissionForm.uploadedAt).toLocaleDateString('bn-BD')}
                                        </p>
                                    </div>
                                </div>
                                <MainButton
                                    onClick={() => handleDownload(
                                        admissionForm.path, 
                                        `admission-form.${admissionForm.originalName.split('.').pop()}`,
                                        admissionForm.mimetype
                                    )}
                                >
                                    ডাউনলোড করুন
                                </MainButton>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">ভর্তি ফরম পাওয়া যায়নি</h3>
                            <p className="text-gray-600">শীঘ্রই ভর্তি ফরম আপলোড করা হবে</p>
                        </div>
                    )}
                </div>

                {/* Circulars Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-green-500">📢</span>
                        সার্কুলারসমূহ
                    </h2>

                    {circulars.length > 0 ? (
                        <div className="space-y-4">
                            {circulars.map((circular) => (
                                <div 
                                    key={circular._id}
                                    className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-green-300 transition-all duration-200"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="text-2xl mt-1">
                                                    {getFileIcon(circular.fileType, circular.fileExtension)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                        {circular.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        {circular.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                                        <span>📁 {circular.category}</span>
                                                        <span>👥 {circular.targetAudience}</span>
                                                        <span>📏 {formatFileSize(circular.fileSize)}</span>
                                                        <span>⬇️ {circular.downloads} বার ডাউনলোড</span>
                                                        {circular.updatedAt && (
                                                            <span>
                                                                আপডেট: {new Date(circular.updatedAt).toLocaleDateString('bn-BD')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <MainButton
                                                onClick={() => handleDownload(
                                                    circular.filePath,
                                                    circular.fileName,
                                                    circular.fileType,
                                                    circular._id
                                                )}
                                            >
                                                ডাউনলোড
                                            </MainButton>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">📢</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">কোন সার্কুলার পাওয়া যায়নি</h3>
                            <p className="text-gray-600">শীঘ্রই নতুন সার্কুলার আপলোড করা হবে</p>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default Downloads;