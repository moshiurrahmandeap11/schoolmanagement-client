import React, { useState, useEffect } from 'react';
import RichTextEditor from '../../../../sharedItems/RichTextEditor/RichTextEditor';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';


const NoticesAdmin = () => {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        attachment: null,
        isPublished: false
    });

    // Fetch all notices
    const fetchNotices = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/notices');
            
            if (response.data.success) {
                setNotices(response.data.data);
            } else {
                alert('Error fetching notices: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error fetching notices:', error);
            alert('Error fetching notices');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                attachment: files[0] || null
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle rich text editor change
    const handleBodyChange = (content) => {
        setFormData(prev => ({
            ...prev,
            body: content
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.body.trim()) {
            alert('Title and body are required');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('body', formData.body);
            submitData.append('isPublished', formData.isPublished.toString());
            
            if (formData.attachment) {
                submitData.append('attachment', formData.attachment);
            }

            let response;
            if (editingNotice) {
                response = await axiosInstance.put(`/notices/${editingNotice._id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axiosInstance.post('/notices', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (response.data.success) {
                alert(editingNotice ? 'Notice updated successfully' : 'Notice created successfully');
                resetForm();
                fetchNotices();
            } else {
                alert('Error: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error submitting notice:', error);
            alert('Error submitting notice');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            body: '',
            attachment: null,
            isPublished: false
        });
        setEditingNotice(null);
        setShowForm(false);
    };

    // Edit notice
    const handleEdit = (notice) => {
        setFormData({
            title: notice.title,
            body: notice.body,
            attachment: null,
            isPublished: notice.isPublished || false
        });
        setEditingNotice(notice);
        setShowForm(true);
    };

    // Delete notice
    const handleDelete = async (noticeId) => {
        if (!confirm('Are you sure you want to delete this notice?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/notices/${noticeId}`);

            if (response.data.success) {
                alert('Notice deleted successfully');
                fetchNotices();
            } else {
                alert('Error: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error deleting notice:', error);
            alert('Error deleting notice');
        }
    };

    // Toggle publish status
    const togglePublish = async (noticeId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/notices/${noticeId}/toggle-publish`);

            if (response.data.success) {
                alert(response.data.message);
                fetchNotices();
            } else {
                alert('Error: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error toggling publish status:', error);
            alert('Error toggling publish status');
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Notices Management</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add New Notice
                </button>
            </div>

            {/* Notice Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingNotice ? 'Edit Notice' : 'Create New Notice'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notice Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter notice title"
                                required
                            />
                        </div>

                        {/* Body - Rich Text Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notice Body *
                            </label>
                            <RichTextEditor
                                value={formData.body}
                                onChange={handleBodyChange}
                                placeholder="Write your notice content here..."
                            />
                        </div>

                        {/* Attachment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attachment (Optional)
                            </label>
                            <input
                                type="file"
                                name="attachment"
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                accept="image/*"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Only image files are allowed (max 5MB)
                            </p>
                        </div>

                        {/* Publish Status */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isPublished"
                                checked={formData.isPublished}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                id="publishCheckbox"
                            />
                            <label htmlFor="publishCheckbox" className="ml-2 text-sm text-gray-700">
                                Publish immediately
                            </label>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : (editingNotice ? 'Update Notice' : 'Create Notice')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Notices List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading notices...</p>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No notices found. Create your first notice!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {notices.map((notice) => (
                                    <tr key={notice._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {notice.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    notice.isPublished
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {notice.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(notice.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(notice)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => togglePublish(notice._id, notice.isPublished)}
                                                className={`${
                                                    notice.isPublished
                                                        ? 'text-yellow-600 hover:text-yellow-900'
                                                        : 'text-green-600 hover:text-green-900'
                                                }`}
                                            >
                                                {notice.isPublished ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(notice._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoticesAdmin;