// CircularAdmin.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';


const CircularAdmin = () => {
    const [circulars, setCirculars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCircular, setEditingCircular] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterFileType, setFilterFileType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState(null);

    const categories = [
        'academic',
        'administration',
        'exam',
        'holiday',
        'event',
        'notice',
        'general'
    ];

    const fileTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'text/plain'
    ];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        targetAudience: 'all',
        isActive: true,
        file: null
    });

    useEffect(() => {
        fetchCirculars();
        fetchStats();
    }, [currentPage, searchTerm, filterCategory, filterFileType]);

    const fetchCirculars = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                ...(searchTerm && { search: searchTerm }),
                ...(filterCategory && { category: filterCategory }),
                ...(filterFileType && { fileType: filterFileType })
            });

            const response = await axiosInstance.get(`/circulars?${params}`);
            
            if (response.data.success) {
                setCirculars(response.data.data);
            } else {
                setError('Failed to load circulars');
            }
        } catch (error) {
            console.error('Error fetching circulars:', error);
            setError('Failed to load circulars list');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/circulars/stats/summary');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('targetAudience', formData.targetAudience);
            formDataToSend.append('isActive', formData.isActive);
            formDataToSend.append('file', formData.file);

            const response = await axiosInstance.post('/circulars', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                alert('Circular uploaded successfully!');
                resetForm();
                fetchCirculars();
                fetchStats();
            }
        } catch (error) {
            console.error('Error uploading circular:', error);
            alert(error.response?.data?.message || 'Failed to upload circular');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateCircular = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.put(`/circulars/${editingCircular._id}`, formData);
            if (response.data.success) {
                alert('Circular updated successfully!');
                resetForm();
                fetchCirculars();
            }
        } catch (error) {
            console.error('Error updating circular:', error);
            alert('Failed to update circular');
        }
    };

    const handleFileUpdate = async (circularId, file) => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('file', file);

            const response = await axiosInstance.put(`/circulars/${circularId}/file`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                alert('File updated successfully!');
                fetchCirculars();
            }
        } catch (error) {
            console.error('Error updating file:', error);
            alert(error.response?.data?.message || 'Failed to update file');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this circular?')) {
            try {
                const response = await axiosInstance.delete(`/circulars/${id}`);
                if (response.data.success) {
                    alert('Circular deleted successfully!');
                    fetchCirculars();
                    fetchStats();
                }
            } catch (error) {
                console.error('Error deleting circular:', error);
                alert('Failed to delete circular');
            }
        }
    };

    const handleEdit = (circular) => {
        setEditingCircular(circular);
        setFormData({
            title: circular.title,
            description: circular.description,
            category: circular.category,
            targetAudience: circular.targetAudience,
            isActive: circular.isActive,
            file: null
        });
        setShowAddForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'general',
            targetAudience: 'all',
            isActive: true,
            file: null
        });
        setEditingCircular(null);
        setShowAddForm(false);
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('word')) return '📝';
        if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
        if (fileType.includes('text')) return '📃';
        return '📎';
    };

    const getFileTypeName = (fileType) => {
        if (fileType.includes('pdf')) return 'PDF';
        if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'JPEG Image';
        if (fileType.includes('png')) return 'PNG Image';
        if (fileType.includes('word')) return 'Word Document';
        if (fileType.includes('excel') || fileType.includes('sheet')) return 'Excel Document';
        if (fileType.includes('text')) return 'Text File';
        return fileType;
    };

    const handleDownload = async (circular) => {
        try {
            // Increment download count
            await axiosInstance.patch(`/circulars/${circular._id}/download`);
            
            // Create download link
            const link = document.createElement('a');
            link.href = `http://localhost:5000${circular.filePath}`;
            link.download = circular.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Refresh stats
            fetchStats();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    if (loading && !circulars.length) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading circulars...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className=" mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        Circular Management
                    </h1>
                </div>

                {/* Stats Section */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                            <div className="text-2xl font-bold text-[#1e90c9] mb-1">{stats.totalCirculars}</div>
                            <div className="text-sm text-gray-600">Total Circulars</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                            <div className="text-2xl font-bold text-[#1e90c9] mb-1">{stats.activeCirculars}</div>
                            <div className="text-sm text-gray-600">Active</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                            <div className="text-2xl font-bold text-[#1e90c9] mb-1">{stats.totalDownloads}</div>
                            <div className="text-sm text-gray-600">Total Downloads</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                            <div className="text-2xl font-bold text-[#1e90c9] mb-1">{stats.totalViews}</div>
                            <div className="text-sm text-gray-600">Total Views</div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                            className="rounded-md"
                        >
                            + Upload New Circular
                        </MainButton>
                        
                        <div className="text-sm text-gray-600">
                            Supported: PDF, Images, Word, Excel, Text files
                        </div>
                    </div>
                </div>

                {/* Upload Form */}
                {showAddForm && (
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingCircular ? 'Edit Circular' : 'Upload New Circular'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={editingCircular ? handleUpdateCircular : handleFileUpload}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        placeholder="Enter circular title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        placeholder="Enter circular description"
                                    />
                                </div>

                                {!editingCircular && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            File Upload *
                                        </label>
                                        <input
                                            type="file"
                                            required={!editingCircular}
                                            onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Maximum file size: 10MB. Allowed: PDF, Images, Word, Excel, Text
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-[#1e90c9]"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-end">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <MainButton
                                    type="submit"
                                    disabled={uploading}
                                    className="rounded-md"
                                >
                                    {uploading ? 'Uploading...' : (editingCircular ? 'Update Circular' : 'Upload Circular')}
                                </MainButton>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Circulars
                            </label>
                            <input
                                type="text"
                                placeholder="Search by title, description, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Category
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by File Type
                            </label>
                            <select
                                value={filterFileType}
                                onChange={(e) => setFilterFileType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            >
                                <option value="">All File Types</option>
                                {fileTypes.map(type => (
                                    <option key={type} value={type}>
                                        {getFileTypeName(type)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Circulars List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        File
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stats
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {circulars.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No circulars found
                                        </td>
                                    </tr>
                                ) : (
                                    circulars.map(circular => (
                                        <tr key={circular._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-2xl mr-3">
                                                        {getFileIcon(circular.fileType)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {circular.fileName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {getFileTypeName(circular.fileType)}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {(circular.fileSize / 1024 / 1024).toFixed(2)} MB
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {circular.title}
                                                </div>
                                                {circular.description && (
                                                    <div className="text-sm text-gray-500 line-clamp-2">
                                                        {circular.description}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {new Date(circular.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1e90c9] text-white">
                                                    {circular.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>👁️ {circular.views} views</div>
                                                <div>📥 {circular.downloads} downloads</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    circular.isActive 
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {circular.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleDownload(circular)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(circular)}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(circular._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* File Type Distribution */}
                {stats?.fileTypeStats && (
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">File Type Distribution</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.fileTypeStats.map(stat => (
                                <div key={stat._id} className="text-center p-4 border border-gray-200 rounded-lg">
                                    <div className="text-2xl mb-2">{getFileIcon(stat._id)}</div>
                                    <div className="font-semibold text-gray-800">{getFileTypeName(stat._id)}</div>
                                    <div className="text-sm text-gray-600">{stat.count} files</div>
                                    <div className="text-xs text-gray-500">{stat.totalDownloads} downloads</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CircularAdmin;