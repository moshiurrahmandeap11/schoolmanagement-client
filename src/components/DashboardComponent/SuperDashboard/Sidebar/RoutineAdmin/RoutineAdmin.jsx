import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';


const RoutineAdmin = () => {
    const [routines, setRoutines] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        attachment: null,
        isPublished: false
    });

    // Fetch all routines
    const fetchRoutines = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/routines');
            
            if (response.data.success) {
                setRoutines(response.data.data);
            } else {
                alert('Error fetching routines: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error fetching routines:', error);
            alert('Error fetching routines');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutines();
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            alert('Title is required');
            return;
        }

        if (!formData.attachment && !editingRoutine) {
            alert('Attachment is required');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('isPublished', formData.isPublished.toString());
            
            if (formData.attachment) {
                submitData.append('attachment', formData.attachment);
            }

            let response;
            if (editingRoutine) {
                response = await axiosInstance.put(`/routines/${editingRoutine._id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axiosInstance.post('/routines', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (response.data.success) {
                alert(editingRoutine ? 'Routine updated successfully' : 'Routine created successfully');
                resetForm();
                fetchRoutines();
            } else {
                alert('Error: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error submitting routine:', error);
            alert('Error submitting routine');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            attachment: null,
            isPublished: false
        });
        setEditingRoutine(null);
        setShowForm(false);
    };

    // Edit routine
    const handleEdit = (routine) => {
        setFormData({
            title: routine.title,
            attachment: null,
            isPublished: routine.isPublished || false
        });
        setEditingRoutine(routine);
        setShowForm(true);
    };

    // Delete routine
    const handleDelete = async (routineId) => {
        if (!confirm('Are you sure you want to delete this routine?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/routines/${routineId}`);

            if (response.data.success) {
                alert('Routine deleted successfully');
                fetchRoutines();
            } else {
                alert('Error: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error deleting routine:', error);
            alert('Error deleting routine');
        }
    };

    // Toggle publish status
    const togglePublish = async (routineId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/routines/${routineId}/toggle-publish`);

            if (response.data.success) {
                alert(response.data.message);
                fetchRoutines();
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
                <h1 className="text-2xl font-bold text-gray-800">রুটিন ব্যবস্থাপনা</h1>
                <MainButton
                    onClick={() => setShowForm(true)}
                >
                    Add New Routine
                </MainButton>
            </div>

            {/* Routine Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingRoutine ? 'Edit Routine' : 'Create New Routine'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Routine Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                placeholder="Enter routine title (e.g., Class 9 Routine 2024)"
                                required
                            />
                        </div>

                        {/* Attachment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Routine File *
                                {!editingRoutine && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                type="file"
                                name="attachment"
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                accept="image/*"
                                required={!editingRoutine}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Upload routine image (PDF/Image files, max 5MB)
                            </p>
                            {editingRoutine && editingRoutine.attachment && (
                                <p className="text-sm text-[#1e90c9] mt-1">
                                    Current file: {editingRoutine.attachment.originalName}
                                </p>
                            )}
                        </div>

                        {/* Publish Status */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isPublished"
                                checked={formData.isPublished}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-[#1e90c9] bg-gray-100 border-gray-300 rounded focus:ring-[#1e90c9]"
                                id="publishCheckbox"
                            />
                            <label htmlFor="publishCheckbox" className="ml-2 text-sm text-gray-700">
                                Publish immediately
                            </label>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4">
                            <MainButton
                                type="submit"
                                disabled={isSubmitting}
                                className='rounded-md'
                            >
                                {isSubmitting ? 'Saving...' : (editingRoutine ? 'Update Routine' : 'Create Routine')}
                            </MainButton>
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

            {/* Routines List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading routines...</p>
                    </div>
                ) : routines.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No routines found. Create your first routine!
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
                                        File
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
                                {routines.map((routine) => (
                                    <tr key={routine._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {routine.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {routine.attachment ? (
                                                <span className="text-blue-600 font-medium">
                                                    {routine.attachment.originalName}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">No file</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    routine.isPublished
                                                        ? 'bg-[#1e90c9] text-white'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {routine.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(routine.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(routine)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => togglePublish(routine._id, routine.isPublished)}
                                                className={`${
                                                    routine.isPublished
                                                        ? 'text-yellow-600 hover:text-yellow-900'
                                                        : 'text-green-600 hover:text-green-900'
                                                }`}
                                            >
                                                {routine.isPublished ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(routine._id)}
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

export default RoutineAdmin;