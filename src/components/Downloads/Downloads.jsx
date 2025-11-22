import { useEffect, useState } from 'react';
import axiosInstance from '../../hooks/axiosInstance/axiosInstance';
import Loader from '../sharedItems/Loader/Loader';
import MainButton from '../sharedItems/Mainbutton/Mainbutton';

const Downloads = () => {
    const [circulars, setCirculars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCirculars();
    }, []);

    const fetchCirculars = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/circulars?page=1&limit=50'); // বেশি লিমিট দিলাম যাতে সব আসে

            if (response.data.success) {
                setCirculars(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching circulars:', error);
            setError('সার্কুলার লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (filePath, fileName, fileType, itemId) => {
        try {
            // ডাউনলোড কাউন্ট বাড়ানো
            if (itemId) {
                await axiosInstance.patch(`/circulars/${itemId}/download`).catch(() => {});
            }

            const fullUrl = `${axiosInstance.defaults.baseURL}${filePath}`;
            const link = document.createElement('a');
            link.href = fullUrl;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Download failed:', error);
            alert('ফাইল ডাউনলোড করতে সমস্যা হয়েছে');
        }
    };

    const getFileIcon = (fileType, fileExtension) => {
        if (fileType.includes('pdf')) return 'PDF';
        if (fileType.includes('image')) return 'Image';
        if (fileType.includes('word') || ['.doc', '.docx'].includes(fileExtension)) return 'Word';
        if (fileType.includes('excel') || ['.xls', '.xlsx'].includes(fileExtension)) return 'Excel';
        if (fileType.includes('zip') || ['.zip', '.rar'].includes(fileExtension)) return 'Archive';
        return 'File';
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 KB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-10 text-center max-w-md w-full">
                    <div className="text-red-500 text-5xl mb-4">Warning</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">লোড করতে সমস্যা</h3>
                    <p className="text-red-600 mb-6">{error}</p>
                    <MainButton onClick={fetchCirculars}>আবার চেষ্টা করুন</MainButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        ডাউনলোড সেকশন
                    </h1>
                </div>

                {/* Circulars List */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-4">
                        <span className="text-green-600 text-4xl">Announcement</span>
                        সার্কুলারসমূহ
                    </h2>

                    {circulars.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl">
                            <div className="text-6xl mb-6">No Announcements</div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-3">
                                এখনো কোন সার্কুলার যোগ করা হয়নি
                            </h3>
                            <p className="text-gray-500">শীঘ্রই নতুন সার্কুলার যোগ করা হবে</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {circulars.map((circular) => (
                                <div
                                    key={circular._id}
                                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex-1 flex items-start gap-5">
                                            <div className="text-4xl bg-white rounded-xl shadow-md p-4">
                                                {getFileIcon(circular.fileType, circular.fileExtension)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                    {circular.title}
                                                </h3>
                                                {circular.description && (
                                                    <p className="text-gray-600 mb-4 leading-relaxed">
                                                        {circular.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        Category: {circular.category}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        Audience: {circular.targetAudience}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        Size: {formatFileSize(circular.fileSize)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        Downloads: {circular.downloads || 0} বার
                                                    </span>
                                                    {circular.updatedAt && (
                                                        <span className="text-xs">
                                                            আপডেট: {formatDate(circular.updatedAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <MainButton
                                                onClick={() => handleDownload(
                                                    circular.filePath,
                                                    circular.fileName,
                                                    circular.fileType,
                                                    circular._id
                                                )}
                                                className="px-8 py-3 text-lg font-bold"
                                            >
                                                Download
                                            </MainButton>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Downloads;