import React, { useState, useEffect } from 'react';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';

const HeadmastersListAdmin = () => {
    const [headmasters, setHeadmasters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingHeadmaster, setEditingHeadmaster] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        address: '',
        joiningDate: '',
        qualifications: '',
        experience: '',
        bloodGroup: '',
        gender: '',
        dateOfBirth: '',
        nidNumber: '',
        salary: '',
        achievements: '',
        message: '',
        photo: '',
        isCurrent: false
    });

    // File upload state
    const [selectedFile, setSelectedFile] = useState(null);

    // Fetch headmasters
    useEffect(() => {
        fetchHeadmasters();
    }, []);

    const fetchHeadmasters = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/headmasters-list');
            
            if (response.data.success) {
                setHeadmasters(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching headmasters:', error);
            showMessage('error', 'Failed to load headmasters list');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                showMessage('error', 'Please select a valid image file (JPEG, PNG, GIF)');
                return;
            }

            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                showMessage('error', 'Image size should be less than 2MB');
                return;
            }

            setSelectedFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({ ...prev, photo: e.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            mobile: '',
            email: '',
            address: '',
            joiningDate: '',
            qualifications: '',
            experience: '',
            bloodGroup: '',
            gender: '',
            dateOfBirth: '',
            nidNumber: '',
            salary: '',
            achievements: '',
            message: '',
            photo: '',
            isCurrent: false
        });
        setSelectedFile(null);
        setEditingHeadmaster(null);
        setShowForm(false);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim() || !formData.mobile.trim()) {
            showMessage('error', 'Please fill in all required fields (Name, Mobile)');
            return;
        }

        // Mobile number validation
        const mobileRegex = /^[0-9]{11}$/;
        if (!mobileRegex.test(formData.mobile)) {
            showMessage('error', 'Please enter a valid 11-digit mobile number');
            return;
        }

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            showMessage('error', 'Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            
            // Create FormData object for file upload
            const submitFormData = new FormData();
            
            // Append all form fields
            Object.keys(formData).forEach(key => {
                if (key !== 'photo') {
                    submitFormData.append(key, formData[key]);
                }
            });
            
            // Append file if selected
            if (selectedFile) {
                submitFormData.append('photo', selectedFile);
            }

            let response;

            if (editingHeadmaster) {
                // Update existing headmaster
                response = await axiosInstance.put(`/headmasters-list/${editingHeadmaster._id}`, submitFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            } else {
                // Create new headmaster
                response = await axiosInstance.post('/headmasters-list', submitFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            }

            if (response.data.success) {
                showMessage('success', 
                    editingHeadmaster ? 'Headmaster updated successfully!' : 'Headmaster added successfully!'
                );
                resetForm();
                fetchHeadmasters();
            } else {
                showMessage('error', response.data.message || 'Failed to save headmaster');
            }
        } catch (error) {
            console.error('Error saving headmaster:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save headmaster';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Edit headmaster
    const handleEdit = (headmaster) => {
        setEditingHeadmaster(headmaster);
        setFormData({
            name: headmaster.name,
            mobile: headmaster.mobile,
            email: headmaster.email || '',
            address: headmaster.address || '',
            joiningDate: headmaster.joiningDate ? headmaster.joiningDate.split('T')[0] : '',
            qualifications: headmaster.qualifications || '',
            experience: headmaster.experience || '',
            bloodGroup: headmaster.bloodGroup || '',
            gender: headmaster.gender || '',
            dateOfBirth: headmaster.dateOfBirth ? headmaster.dateOfBirth.split('T')[0] : '',
            nidNumber: headmaster.nidNumber || '',
            salary: headmaster.salary || '',
            achievements: headmaster.achievements || '',
            message: headmaster.message || '',
            photo: headmaster.photo || '',
            isCurrent: headmaster.isCurrent || false
        });
        setSelectedFile(null);
        setShowForm(true);
    };

    // Delete headmaster
    const handleDelete = async (headmasterId) => {
        if (!window.confirm('Are you sure you want to delete this headmaster?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.delete(`/headmasters-list/${headmasterId}`);

            if (response.data.success) {
                showMessage('success', 'Headmaster deleted successfully!');
                fetchHeadmasters();
            } else {
                showMessage('error', response.data.message || 'Failed to delete headmaster');
            }
        } catch (error) {
            console.error('Error deleting headmaster:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete headmaster';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Set as current headmaster
    const handleSetCurrent = async (headmasterId) => {
        if (!window.confirm('Set this headmaster as current headmaster?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.patch(`/headmasters-list/${headmasterId}/set-current`);

            if (response.data.success) {
                showMessage('success', 'Headmaster set as current successfully!');
                fetchHeadmasters();
            } else {
                showMessage('error', response.data.message || 'Failed to set current headmaster');
            }
        } catch (error) {
            console.error('Error setting current headmaster:', error);
            const errorMessage = error.response?.data?.message || 'Failed to set current headmaster';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Toggle headmaster status
    const handleToggleStatus = async (headmasterId, currentStatus) => {
        try {
            setLoading(true);
            const response = await axiosInstance.patch(`/headmasters-list/${headmasterId}/toggle`);

            if (response.data.success) {
                showMessage('success', `Headmaster ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
                fetchHeadmasters();
            } else {
                showMessage('error', response.data.message || 'Failed to update headmaster status');
            }
        } catch (error) {
            console.error('Error toggling headmaster status:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update headmaster status';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Blood groups
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        Headmasters Management
                    </h1>
                    <p className="text-gray-600">
                        Manage all headmasters information and details
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 lg:mt-0 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium flex items-center gap-2"
                >
                    <span>+</span>
                    Add New Headmaster
                </button>
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

            {/* Headmaster Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingHeadmaster ? 'Edit Headmaster' : 'Add New Headmaster'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Personal Information */}
                                <div className="md:col-span-2 lg:col-span-3">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        Personal Information
                                    </h3>
                                </div>

                                {/* Name - Required */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                {/* Mobile - Required */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mobile Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="01XXXXXXXXX"
                                        required
                                    />
                                </div>

                                {/* NID Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        NID Number
                                    </label>
                                    <input
                                        type="text"
                                        name="nidNumber"
                                        value={formData.nidNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Blood Group
                                    </label>
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Blood Group</option>
                                        {bloodGroups.map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Professional Information */}
                                <div className="md:col-span-2 lg:col-span-3 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        Professional Information
                                    </h3>
                                </div>

                                {/* Experience */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Experience (Years)
                                    </label>
                                    <input
                                        type="number"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="50"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Salary */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Salary
                                    </label>
                                    <input
                                        type="number"
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Joining Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Joining Date
                                    </label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Additional Information */}
                                <div className="md:col-span-2 lg:col-span-3 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        Additional Information
                                    </h3>
                                </div>

                                {/* Photo Upload */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Photo
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Supported formats: JPEG, PNG, GIF (Max 2MB)
                                            </p>
                                        </div>
                                    </div>
                                    {formData.photo && (
                                        <div className="mt-2">
                                            <img 
                                                src={`${baseImageURL}${formData.photo}`} 
                                                alt="Preview" 
                                                className="w-20 h-20 object-cover rounded-lg border"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Qualifications */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Qualifications
                                    </label>
                                    <textarea
                                        name="qualifications"
                                        value={formData.qualifications}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="B.Sc, M.Sc, B.Ed, M.Ed, etc."
                                    />
                                </div>

                                {/* Achievements */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Achievements
                                    </label>
                                    <textarea
                                        name="achievements"
                                        value={formData.achievements}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Notable achievements, awards, etc."
                                    />
                                </div>

                                {/* Message */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Headmaster's message or vision..."
                                    />
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Current Headmaster Checkbox */}
                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isCurrent"
                                            checked={formData.isCurrent}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Set as Current Headmaster
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Only one headmaster can be set as current at a time
                                    </p>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors font-medium"
                                >
                                    {loading ? 'Saving...' : (editingHeadmaster ? 'Update Headmaster' : 'Add Headmaster')}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Headmasters List */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {/* Loading State */}
                {loading && !showForm && (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading headmasters...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && headmasters.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Headmasters Found</h3>
                        <p className="text-gray-600 mb-4">Get started by adding your first headmaster.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                            Add Headmaster
                        </button>
                    </div>
                )}

                {/* Headmasters Table */}
                {!loading && headmasters.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Headmaster</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">Experience</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Current</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {headmasters.map((headmaster) => (
                                    <tr key={headmaster._id} className="hover:bg-gray-50">
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3">
                                                {headmaster.photo ? (
                                                    <img
                                                        src={`${baseImageURL}${headmaster.photo}`}
                                                        alt={headmaster.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {headmaster.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-800">{headmaster.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {headmaster.qualifications && `${headmaster.qualifications.split(',')[0]}...`}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="text-sm text-gray-600">
                                                <p>{headmaster.mobile}</p>
                                                {headmaster.email && (
                                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                                        {headmaster.email}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-gray-600 hidden lg:table-cell">
                                            {headmaster.experience ? `${headmaster.experience} years` : 'N/A'}
                                        </td>
                                        <td className="px-3 py-3">
                                            <button
                                                onClick={() => handleToggleStatus(headmaster._id, headmaster.isActive)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                                                    headmaster.isActive 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {headmaster.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-3 py-3">
                                            {headmaster.isCurrent ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    Current
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSetCurrent(headmaster._id)}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                                                >
                                                    Set Current
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(headmaster)}
                                                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(headmaster._id)}
                                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs sm:text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary */}
            {headmasters.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                    Total Headmasters: {headmasters.length} | 
                    Active: {headmasters.filter(h => h.isActive).length} | 
                    Current Headmaster: {headmasters.filter(h => h.isCurrent).length}
                </div>
            )}
        </div>
    );
};

export default HeadmastersListAdmin;