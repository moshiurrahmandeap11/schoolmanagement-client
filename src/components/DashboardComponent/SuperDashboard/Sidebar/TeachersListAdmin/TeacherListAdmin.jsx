import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
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

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        session: '',
        mobile: '',
        staffType: '',
        position: ''
    });

    // Form state with new fields
    const [formData, setFormData] = useState({
        smartId: '',
        fingerId: '',
        name: '',
        mobile: '',
        designation: '',
        biboron: '',
        salary: '',
        position: 'Active',
        photo: '',
        session: '',
        staffType: 'Teacher'
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
            const response = await axiosInstance.get('/teacher-list');
            
            if (response.data.success) {
                setTeachers(response.data.data);
            } else {
                showSweetAlert('error', response.data.message || 'Failed to load teachers');
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            showSweetAlert('error', 'Failed to load teachers list: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const showSweetAlert = (icon, title, text = '') => {
        Swal.fire({
            icon,
            title,
            text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
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

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Apply filters
    const applyFilters = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/teacher-list/search/filter', {
                params: filters
            });

            if (response.data.success) {
                setTeachers(response.data.data);
                showSweetAlert('success', 'Filters applied successfully!');
            }
        } catch (error) {
            console.error('Error applying filters:', error);
            showSweetAlert('error', 'Failed to apply filters');
        } finally {
            setLoading(false);
        }
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            search: '',
            session: '',
            mobile: '',
            staffType: '',
            position: ''
        });
        fetchTeachers();
        showSweetAlert('info', 'Filters cleared!');
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                showSweetAlert('error', 'Please select a valid image file (JPEG, PNG, GIF)');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showSweetAlert('error', 'Image size should be less than 2MB');
                return;
            }

            setSelectedFile(file);
            
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
            smartId: '',
            fingerId: '',
            name: '',
            mobile: '',
            designation: '',
            biboron: '',
            salary: '',
            position: 'Active',
            photo: '',
            session: '',
            staffType: 'Teacher'
        });
        setSelectedFile(null);
        setUploadProgress(0);
        setEditingTeacher(null);
        setShowForm(false);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim() || !formData.mobile.trim()) {
            showSweetAlert('error', 'Please fill in all required fields (Name, Mobile)');
            return;
        }

        const mobileRegex = /^[0-9]{11}$/;
        if (!mobileRegex.test(formData.mobile)) {
            showSweetAlert('error', 'Please enter a valid 11-digit mobile number');
            return;
        }

        try {
            setLoading(true);
            
            const submitFormData = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key !== 'photo') {
                    submitFormData.append(key, formData[key]);
                }
            });
            
            if (selectedFile) {
                submitFormData.append('photo', selectedFile);
            }

            let response;

            if (editingTeacher) {
                response = await axiosInstance.put(`/teacher-list/${editingTeacher._id}`, submitFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            } else {
                response = await axiosInstance.post('/teacher-list', submitFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            }

            if (response.data.success) {
                showSweetAlert(
                    'success', 
                    editingTeacher ? 'Teacher updated successfully!' : 'Teacher added successfully!'
                );
                resetForm();
                fetchTeachers();
            } else {
                showSweetAlert('error', response.data.message || 'Failed to save teacher');
            }
        } catch (error) {
            console.error('Error saving teacher:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save teacher';
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    // Edit teacher
    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            smartId: teacher.smartId || '',
            fingerId: teacher.fingerId || '',
            name: teacher.name || '',
            mobile: teacher.mobile || '',
            designation: teacher.designation || '',
            biboron: teacher.biboron || '',
            salary: teacher.salary || '',
            position: teacher.position || 'Active',
            photo: teacher.photo || '',
            session: teacher.session || '',
            staffType: teacher.staffType || 'Teacher'
        });
        setSelectedFile(null);
        setShowForm(true);
    };

    // Delete teacher
    const handleDelete = async (teacherId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/teacher-list/${teacherId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'Teacher deleted successfully!');
                    fetchTeachers();
                } else {
                    showSweetAlert('error', response.data.message || 'Failed to delete teacher');
                }
            } catch (error) {
                console.error('Error deleting teacher:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete teacher';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    // Add new subject
    const handleAddSubject = () => {
        if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
            setSubjects(prev => [...prev, newSubject.trim()]);
            setNewSubject('');
            showSweetAlert('success', 'Subject added successfully!');
        } else {
            showSweetAlert('error', 'Subject already exists or is empty');
        }
    };

    // Remove subject
    const handleRemoveSubject = (subjectToRemove) => {
        if (subjects.length > 1) {
            setSubjects(prev => prev.filter(subject => subject !== subjectToRemove));
            showSweetAlert('success', 'Subject removed successfully!');
        } else {
            showSweetAlert('error', 'Cannot remove the last subject');
        }
    };

    // Common designations
    const designations = [
        'Headmaster',
        'Assistant Headmaster', 
        'Senior Teacher',
        'Teacher',
        'Assistant Teacher',
        'Guest Teacher',
        'Principal',
        'Vice Principal',
        'Coordinator'
    ];

    // Staff types
    const staffTypes = ['Teacher', 'Staff'];

    // Position types
    const positions = ['Active', 'Transferred', 'Retired', 'Deactivated'];

    // Get filtered teachers (client-side filtering as fallback)
    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = !filters.search || 
            teacher.smartId?.toLowerCase().includes(filters.search.toLowerCase()) ||
            teacher.fingerId?.toLowerCase().includes(filters.search.toLowerCase()) ||
            teacher.name?.toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesMobile = !filters.mobile || 
            teacher.mobile?.includes(filters.mobile);
        
        const matchesStaffType = !filters.staffType || 
            teacher.staffType === filters.staffType;
        
        const matchesPosition = !filters.position || 
            teacher.position === filters.position;

        const matchesSession = !filters.session || 
            teacher.session?.includes(filters.session);

        return matchesSearch && matchesMobile && matchesStaffType && matchesPosition && matchesSession;
    });

    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.position === 'Active').length;

    return (
        <div className="max-w-full mx-auto p-4 sm:p-6">
            {/* Header with Summary */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        Teacher/Staff Management
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="bg-blue-50 px-3 py-1 rounded-lg">
                            <strong>Total Teacher/Staff:</strong> {totalTeachers}
                        </div>
                        <div className="bg-green-50 px-3 py-1 rounded-lg">
                            <strong>Active:</strong> {activeTeachers}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                    <button
                        onClick={() => setShowSubjectManager(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                    >
                        Manage Subjects
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <span>+</span>
                        NEW TEACHER / STAFF
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                        >
                            Toggle Filters
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        {/* Search and Filter Inputs in one line */}
                        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-4">
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search (Name, ID)
                                </label>
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Search by name, smart ID, finger ID..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Session
                                </label>
                                <input
                                    type="text"
                                    name="session"
                                    value={filters.session}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="2024"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile
                                </label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={filters.mobile}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="01XXXXXXXXX"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Staff Type
                                </label>
                                <select
                                    name="staffType"
                                    value={filters.staffType}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    {staffTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Position
                                </label>
                                <select
                                    name="position"
                                    value={filters.position}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Positions</option>
                                    {positions.map(position => (
                                        <option key={position} value={position}>{position}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Apply and Clear buttons on right side */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
                                {editingTeacher ? 'Edit Teacher/Staff' : 'Add New Teacher/Staff'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* ID Information */}
                                <div className="md:col-span-2 lg:col-span-3">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        ID Information
                                    </h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Smart ID
                                    </label>
                                    <input
                                        type="text"
                                        name="smartId"
                                        value={formData.smartId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Finger ID
                                    </label>
                                    <input
                                        type="text"
                                        name="fingerId"
                                        value={formData.fingerId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Session
                                    </label>
                                    <input
                                        type="text"
                                        name="session"
                                        value={formData.session}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="2024"
                                    />
                                </div>

                                {/* Personal Information */}
                                <div className="md:col-span-2 lg:col-span-3 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        Personal Information
                                    </h3>
                                </div>

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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Staff Type
                                    </label>
                                    <select
                                        name="staffType"
                                        value={formData.staffType}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {staffTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Professional Information */}
                                <div className="md:col-span-2 lg:col-span-3 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        Professional Information
                                    </h3>
                                </div>

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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Position
                                    </label>
                                    <select
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {positions.map(position => (
                                            <option key={position} value={position}>{position}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Additional Information */}
                                <div className="md:col-span-2 lg:col-span-3 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        Additional Information
                                    </h3>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        বিবরণ (Description)
                                    </label>
                                    <textarea
                                        name="biboron"
                                        value={formData.biboron}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Additional information about the teacher/staff"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ছবি (Photo)
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
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
                                >
                                    {loading ? 'Saving...' : (editingTeacher ? 'Update Teacher/Staff' : 'Add Teacher/Staff')}
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
                {!loading && filteredTeachers.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Teachers/Staff Found</h3>
                        <p className="text-gray-600 mb-4">Get started by adding your first teacher/staff member.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Add Teacher/Staff
                        </button>
                    </div>
                )}

                {/* Teachers Table */}
                {!loading && filteredTeachers.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">আইডি</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Smart ID</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Finger ID</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">নাম</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">মোবাইল</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">পদবি</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">বিবরণ</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">Pay Salary</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">অবস্থান</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">ছবি</th>
                                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">এডিট / ডিলিট</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredTeachers.map((teacher) => (
                                    <tr key={teacher._id} className="hover:bg-gray-50">
                                        <td className="px-3 py-3 text-sm text-gray-900">
                                            {teacher._id?.toString().substring(18, 24) || 'N/A'}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-900">
                                            {teacher.smartId || 'N/A'}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-900">
                                            {teacher.fingerId || 'N/A'}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{teacher.name}</p>
                                                <p className="text-xs text-gray-500">{teacher.staffType}</p>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600">{teacher.mobile}</td>
                                        <td className="px-3 py-3 text-sm">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {teacher.designation || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 max-w-xs truncate">
                                            {teacher.biboron || 'N/A'}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600">
                                            {teacher.salary ? `৳${teacher.salary}` : 'N/A'}
                                        </td>
                                        <td className="px-3 py-3 text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                teacher.position === 'Active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : teacher.position === 'Transferred'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : teacher.position === 'Retired'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {teacher.position || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            {teacher.photo ? (
                                                <img
                                                    src={`${baseImageURL}${teacher.photo}`}
                                                    alt={teacher.name}
                                                    className="w-10 h-10 rounded-full object-cover border"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-semibold text-xs">
                                                        {teacher.name?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(teacher)}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                                                >
                                                    এডিট
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(teacher._id)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                                >
                                                    ডিলিট
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
            {filteredTeachers.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                    Showing {filteredTeachers.length} of {totalTeachers} teachers/staff | 
                    Active: {activeTeachers} | 
                    Teachers: {teachers.filter(t => t.staffType === 'Teacher').length} | 
                    Staff: {teachers.filter(t => t.staffType === 'Staff').length}
                </div>
            )}
        </div>
    );
};

export default TeacherListAdmin;