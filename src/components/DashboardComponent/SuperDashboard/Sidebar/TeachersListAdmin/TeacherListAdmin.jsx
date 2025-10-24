import React, { useState, useEffect } from 'react';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';

const TeacherListAdmin = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showSubjectManager, setShowSubjectManager] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [subjects, setSubjects] = useState([
        'Bangla', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
        'Higher Mathematics', 'Social Science', 'Religion', 'ICT', 'Accounting',
        'Finance', 'Business Studies', 'Economics', 'Geography', 'History'
    ]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        subject: '',
        email: '',
        address: '',
        joiningDate: '',
        qualifications: '',
        photo: '',
        designation: '',
        department: '',
        salary: '',
        experience: '',
        bloodGroup: '',
        gender: '',
        dateOfBirth: ''
    });

    // File upload state
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Fetch teachers
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            console.log('Fetching teachers...');
            const response = await axiosInstance.get('/teacher-list');
            console.log('Teachers response:', response.data);
            
            if (response.data.success) {
                setTeachers(response.data.data);
            } else {
                showMessage('error', response.data.message || 'Failed to load teachers');
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            showMessage('error', 'Failed to load teachers list: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        console.log(`Message: ${type} - ${text}`);
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed: ${name} = ${value}`);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        console.log('File selected:', file);
        
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

// Upload file to server - FIXED URL
const uploadFile = async (file) => {
    console.log('Uploading file:', file.name);
    const formData = new FormData();
    formData.append('photo', file);

    try {
        const response = await axiosInstance.post('/upload/teacher-photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        });

        console.log('Upload response:', response.data);

        if (response.data.success) {
            return response.data.fileUrl;
        }
        throw new Error('Upload failed: ' + response.data.message);
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

    // Reset form
    const resetForm = () => {
        console.log('Resetting form');
        setFormData({
            name: '',
            mobile: '',
            subject: '',
            email: '',
            address: '',
            joiningDate: '',
            qualifications: '',
            photo: '',
            designation: '',
            department: '',
            salary: '',
            experience: '',
            bloodGroup: '',
            gender: '',
            dateOfBirth: ''
        });
        setSelectedFile(null);
        setUploadProgress(0);
        setEditingTeacher(null);
        setShowForm(false);
    };

    // Handle form submit
// Handle form submit - SIMPLIFIED VERSION
const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted', formData);
    
    // Validation
    if (!formData.name.trim() || !formData.mobile.trim() || !formData.subject.trim()) {
        showMessage('error', 'Please fill in all required fields (Name, Mobile, Subject)');
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
            if (key !== 'photo') { // photo field separately handle করব
                submitFormData.append(key, formData[key]);
            }
        });
        
        // Append file if selected
        if (selectedFile) {
            submitFormData.append('photo', selectedFile);
        }

        console.log('Submitting form data...');

        let response;

        if (editingTeacher) {
            // Update existing teacher
            console.log('Updating teacher:', editingTeacher._id);
            response = await axiosInstance.put(`/teacher-list/${editingTeacher._id}`, submitFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
        } else {
            // Create new teacher
            console.log('Creating new teacher');
            response = await axiosInstance.post('/teacher-list', submitFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
        }

        console.log('Server response:', response.data);

        if (response.data.success) {
            showMessage('success', 
                editingTeacher ? 'Teacher updated successfully!' : 'Teacher added successfully!'
            );
            resetForm();
            fetchTeachers();
        } else {
            showMessage('error', response.data.message || 'Failed to save teacher');
        }
    } catch (error) {
        console.error('Error saving teacher:', error);
        console.error('Error details:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save teacher';
        showMessage('error', errorMessage);
    } finally {
        setLoading(false);
        setUploadProgress(0);
    }
};

    // Edit teacher
    const handleEdit = (teacher) => {
        console.log('Editing teacher:', teacher);
        setEditingTeacher(teacher);
        setFormData({
            name: teacher.name,
            mobile: teacher.mobile,
            subject: teacher.subject,
            email: teacher.email || '',
            address: teacher.address || '',
            joiningDate: teacher.joiningDate ? teacher.joiningDate.split('T')[0] : '',
            qualifications: teacher.qualifications || '',
            photo: teacher.photo || '',
            designation: teacher.designation || '',
            department: teacher.department || '',
            salary: teacher.salary || '',
            experience: teacher.experience || '',
            bloodGroup: teacher.bloodGroup || '',
            gender: teacher.gender || '',
            dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.split('T')[0] : ''
        });
        setSelectedFile(null);
        setShowForm(true);
    };

    // Delete teacher
    const handleDelete = async (teacherId) => {
        if (!window.confirm('Are you sure you want to delete this teacher?')) {
            return;
        }

        try {
            setLoading(true);
            console.log('Deleting teacher:', teacherId);
            const response = await axiosInstance.delete(`/teacher-list/${teacherId}`);

            if (response.data.success) {
                showMessage('success', 'Teacher deleted successfully!');
                fetchTeachers();
            } else {
                showMessage('error', response.data.message || 'Failed to delete teacher');
            }
        } catch (error) {
            console.error('Error deleting teacher:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete teacher';
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Add new subject
    const handleAddSubject = () => {
        if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
            setSubjects(prev => [...prev, newSubject.trim()]);
            setNewSubject('');
            showMessage('success', 'Subject added successfully!');
        } else {
            showMessage('error', 'Subject already exists or is empty');
        }
    };

    // Remove subject
    const handleRemoveSubject = (subjectToRemove) => {
        if (subjects.length > 1) {
            setSubjects(prev => prev.filter(subject => subject !== subjectToRemove));
            showMessage('success', 'Subject removed successfully!');
        } else {
            showMessage('error', 'Cannot remove the last subject');
        }
    };

    // Common designations
    const designations = [
        'Headmaster',
        'Assistant Headmaster', 
        'Senior Teacher',
        'Teacher',
        'Assistant Teacher',
        'Guest Teacher'
    ];

    // Common departments
    const departments = [
        'Science',
        'Arts', 
        'Commerce',
        'General',
        'Vocational'
    ];

    const baseURL = baseImageURL;
    const u = "/api/uploads/teacher-photos/teacher-1761335463800-517183729.png";
    const sum = baseURL + u;
    console.log(sum);

    // Blood groups
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        Teacher Management
                    </h1>
                    <p className="text-gray-600">
                        Manage all teachers information and details
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                    <button
                        onClick={() => setShowSubjectManager(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <span>📚</span>
                        Manage Subjects
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <span>+</span>
                        Add New Teacher
                    </button>
                </div>
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

            {/* Subject Manager Modal */}
            {showSubjectManager && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Manage Subjects</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newSubject}
                                    onChange={(e) => setNewSubject(e.target.value)}
                                    placeholder="Enter new subject"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleAddSubject}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {subjects.map((subject, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border-b border-gray-200">
                                        <span className="text-gray-700">{subject}</span>
                                        <button
                                            onClick={() => handleRemoveSubject(subject)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowSubjectManager(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Teacher Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="01XXXXXXXXX"
                                        required
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                                {/* Subject - Required */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject *
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(subject => (
                                            <option key={subject} value={subject}>
                                                {subject}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Designation */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Designation
                                    </label>
                                    <select
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>
                                                {dept}
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Supported formats: JPEG, PNG, GIF (Max 2MB)
                                            </p>
                                        </div>
                                        {uploadProgress > 0 && (
                                            <div className="w-full sm:w-32">
                                                <div className="bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-gray-600 text-center mt-1">
                                                    {uploadProgress}%
                                                </p>
                                            </div>
                                        )}
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="B.Sc, M.Sc, B.Ed, etc."
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
                                >
                                    {loading ? 'Saving...' : (editingTeacher ? 'Update Teacher' : 'Add Teacher')}
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

            {/* Teachers List */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {/* Loading State */}
                {loading && !showForm && (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading teachers...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && teachers.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Teachers Found</h3>
                        <p className="text-gray-600 mb-4">Get started by adding your first teacher.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Add Teacher
                        </button>
                    </div>
                )}

                {/* Teachers Table */}
                {!loading && teachers.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">Mobile</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">Designation</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teachers.map((teacher) => (
                                    <tr key={teacher._id} className="hover:bg-gray-50">
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3">
                                                {teacher.photo ? (
                                                    <img
                                                        src={`${baseImageURL}${teacher.photo}`}
                                                        alt={teacher.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {teacher.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-800">{teacher.name}</p>
                                                    <p className="text-sm text-gray-500 sm:hidden">{teacher.mobile}</p>
                                                    {teacher.designation && (
                                                        <p className="text-sm text-gray-500 lg:hidden">{teacher.designation}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {teacher.subject}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-gray-600 hidden sm:table-cell">{teacher.mobile}</td>
                                        <td className="px-3 py-3 text-gray-600 hidden lg:table-cell">{teacher.designation || 'N/A'}</td>
                                        <td className="px-3 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                teacher.isActive 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {teacher.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(teacher)}
                                                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(teacher._id)}
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
            {teachers.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                    Total Teachers: {teachers.length} | 
                    Active: {teachers.filter(t => t.isActive).length} | 
                    Subjects: {[...new Set(teachers.map(t => t.subject))].length}
                </div>
            )}
        </div>
    );
};

export default TeacherListAdmin;