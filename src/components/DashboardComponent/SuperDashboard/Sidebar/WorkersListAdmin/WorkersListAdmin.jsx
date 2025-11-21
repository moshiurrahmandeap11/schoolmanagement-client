import { useEffect, useState } from 'react';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';

const WorkersListAdmin = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        designation: '',
        department: '',
        email: '',
        address: '',
        joiningDate: '',
        salary: '',
        experience: '',
        bloodGroup: '',
        gender: '',
        dateOfBirth: '',
        responsibilities: '',
        workShift: '',
        nidNumber: '',
        photo: ''
    });

    // File upload state
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Fetch workers
    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/workers-list');
            
            if (response.data.success) {
                setWorkers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching workers:', error);
            showMessage('error', 'Failed to load workers list');
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
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            designation: '',
            department: '',
            email: '',
            address: '',
            joiningDate: '',
            salary: '',
            experience: '',
            bloodGroup: '',
            gender: '',
            dateOfBirth: '',
            responsibilities: '',
            workShift: '',
            nidNumber: '',
            photo: ''
        });
        setSelectedFile(null);
        setUploadProgress(0);
        setEditingWorker(null);
        setShowForm(false);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim() || !formData.mobile.trim() || !formData.designation.trim()) {
            showMessage('error', 'Please fill in all required fields (Name, Mobile, Designation)');
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

            if (editingWorker) {
                // Update existing worker
                response = await axiosInstance.put(`/workers-list/${editingWorker._id}`, submitFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            } else {
                // Create new worker
                response = await axiosInstance.post('/workers-list', submitFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            }

            if (response.data.success) {
                showMessage('success', 
                    editingWorker ? 'Worker updated successfully!' : 'Worker added successfully!'
                );
                resetForm();
                fetchWorkers();
            } else {
                showMessage('error', response.data.message || 'Failed to save worker');
            }
        } catch (error) {
            console.error('Error saving worker:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save worker';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    // Edit worker
    const handleEdit = (worker) => {
        setEditingWorker(worker);
        setFormData({
            name: worker.name,
            mobile: worker.mobile,
            designation: worker.designation,
            department: worker.department || '',
            email: worker.email || '',
            address: worker.address || '',
            joiningDate: worker.joiningDate ? worker.joiningDate.split('T')[0] : '',
            salary: worker.salary || '',
            experience: worker.experience || '',
            bloodGroup: worker.bloodGroup || '',
            gender: worker.gender || '',
            dateOfBirth: worker.dateOfBirth ? worker.dateOfBirth.split('T')[0] : '',
            responsibilities: worker.responsibilities || '',
            workShift: worker.workShift || '',
            nidNumber: worker.nidNumber || '',
            photo: worker.photo || ''
        });
        setSelectedFile(null);
        setShowForm(true);
    };

    // Delete worker
    const handleDelete = async (workerId) => {
        if (!window.confirm('Are you sure you want to delete this worker?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.delete(`/workers-list/${workerId}`);

            if (response.data.success) {
                showMessage('success', 'Worker deleted successfully!');
                fetchWorkers();
            } else {
                showMessage('error', response.data.message || 'Failed to delete worker');
            }
        } catch (error) {
            console.error('Error deleting worker:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete worker';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Toggle worker status
    const handleToggleStatus = async (workerId, currentStatus) => {
        try {
            setLoading(true);
            const response = await axiosInstance.patch(`/workers-list/${workerId}/toggle`);

            if (response.data.success) {
                showMessage('success', `Worker ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
                fetchWorkers();
            } else {
                showMessage('error', response.data.message || 'Failed to update worker status');
            }
        } catch (error) {
            console.error('Error toggling worker status:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update worker status';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Common designations for workers
    const designations = [
        'Office Assistant',
        'Cleaner',
        'Security Guard',
        'Driver',
        'Gardener',
        'Electrician',
        'Plumber',
        'Carpenter',
        'Cook',
        'Lab Assistant',
        'Librarian',
        'Accountant',
        'Clerk',
        'Peon'
    ];

    // Common departments
    const departments = [
        'Administration',
        'Maintenance',
        'Security',
        'Transport',
        'Housekeeping',
        'Accounts',
        'Library',
        'Laboratory'
    ];

    // Work shifts
    const workShifts = [
        'Morning (8AM - 4PM)',
        'Evening (4PM - 12AM)',
        'Night (12AM - 8AM)',
        'Full Day',
        'Part Time'
    ];

    // Blood groups
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <div className="max-w-full mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        Workers Management
                    </h1>
                </div>
                <MainButton
                    onClick={() => setShowForm(true)}
                    className="rounded-md"
                >
                    Add New Worker
                </MainButton>
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

            {/* Worker Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 mt-10 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingWorker ? 'Edit Worker' : 'Add New Worker'}
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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

                                {/* Designation - Required */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Designation *
                                    </label>
                                    <select
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        required
                                    >
                                        <option value="">Select Designation</option>
                                        {designations.map(designation => (
                                            <option key={designation} value={designation}>
                                                {designation}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Work Shift */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Work Shift
                                    </label>
                                    <select
                                        name="workShift"
                                        value={formData.workShift}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    >
                                        <option value="">Select Work Shift</option>
                                        {workShifts.map(shift => (
                                            <option key={shift} value={shift}>
                                                {shift}
                                            </option>
                                        ))}
                                    </select>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
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

                                {/* Responsibilities */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Responsibilities
                                    </label>
                                    <textarea
                                        name="responsibilities"
                                        value={formData.responsibilities}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        placeholder="Describe worker responsibilities..."
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                                <MainButton
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-md flex items-center justify-center"
                                >
                                    {loading ? 'Saving...' : (editingWorker ? 'Update Worker' : 'Add Worker')}
                                </MainButton>
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

            {/* Workers List */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {/* Loading State */}
                {loading && !showForm && (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading workers...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && workers.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4">👷</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Workers Found</h3>
                        <p className="text-gray-600 mb-4">Get started by adding your first worker.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Add Worker
                        </button>
                    </div>
                )}

                {/* Workers Table */}
                {!loading && workers.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Worker</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Designation</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">Department</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">Mobile</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {workers.map((worker) => (
                                    <tr key={worker._id} className="hover:bg-gray-50">
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3">
                                                {worker.photo ? (
                                                    <img
                                                        src={`${baseImageURL}${worker.photo}`}
                                                        alt={worker.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {worker.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-800">{worker.name}</p>
                                                    <p className="text-sm text-gray-500 sm:hidden">{worker.mobile}</p>
                                                    {worker.department && (
                                                        <p className="text-sm text-gray-500 lg:hidden">{worker.department}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {worker.designation}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-gray-600 hidden sm:table-cell">{worker.department || 'N/A'}</td>
                                        <td className="px-3 py-3 text-gray-600 hidden lg:table-cell">{worker.mobile}</td>
                                        <td className="px-3 py-3">
                                            <button
                                                onClick={() => handleToggleStatus(worker._id, worker.isActive)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                                                    worker.isActive 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {worker.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(worker)}
                                                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(worker._id)}
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
            {workers.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                    Total Workers: {workers.length} | 
                    Active: {workers.filter(w => w.isActive).length} | 
                    Departments: {[...new Set(workers.map(w => w.department))].length}
                </div>
            )}
        </div>
    );
};

export default WorkersListAdmin;