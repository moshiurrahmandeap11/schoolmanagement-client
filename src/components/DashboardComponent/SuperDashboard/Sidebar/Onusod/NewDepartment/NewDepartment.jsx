import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../sharedItems/RichTextEditor/RichTextEditor';


const NewDepartment = ({ department, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [faculties, setFaculties] = useState([]);
    const [facultiesLoading, setFacultiesLoading] = useState(true);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        facultyId: '',
        facultyName: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState('');

    // Fetch faculties
    const fetchFaculties = async () => {
        try {
            setFacultiesLoading(true);
            const response = await axiosInstance.get('/faculty');
            if (response.data && response.data.success) {
                setFaculties(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching faculties:', err);
            Swal.fire('Error!', 'ফ্যাকাল্টি লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setFacultiesLoading(false);
        }
    };

    // যদি এডিট মোডে থাকে, ফর্ম ডেটা সেট করুন
    useEffect(() => {
        if (department) {
            setFormData({
                name: department.name || '',
                description: department.description || '',
                facultyId: department.facultyId || '',
                facultyName: department.facultyName || '',
                image: null
            });
            
            if (department.image) {
                setImagePreview(`${axiosInstance.defaults.baseURL}${department.image}`);
            }
        }
    }, [department]);

    useEffect(() => {
        fetchFaculties();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle faculty selection
    const handleFacultyChange = (e) => {
        const selectedFacultyId = e.target.value;
        const selectedFaculty = faculties.find(faculty => faculty._id === selectedFacultyId);
        
        if (selectedFaculty) {
            setFormData(prev => ({
                ...prev,
                facultyId: selectedFaculty._id,
                facultyName: selectedFaculty.name
            }));
        }
    };

    // Handle description change from rich text editor
    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
    };

    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            facultyId: '',
            facultyName: '',
            image: null
        });
        setImagePreview('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim()) {
            Swal.fire('Error!', 'বিভাগের নাম প্রয়োজন', 'error');
            return;
        }

        if (!formData.description.trim()) {
            Swal.fire('Error!', 'বিবরণ প্রয়োজন', 'error');
            return;
        }

        if (!formData.facultyId || !formData.facultyName) {
            Swal.fire('Error!', 'ফ্যাকাল্টি নির্বাচন প্রয়োজন', 'error');
            return;
        }

        // Name length validation
        if (formData.name.trim().length < 2) {
            Swal.fire('Error!', 'বিভাগের নাম কমপক্ষে ২ অক্ষরের হতে হবে', 'error');
            return;
        }

        if (formData.name.trim().length > 100) {
            Swal.fire('Error!', 'বিভাগের নাম ১০০ অক্ষরের বেশি হতে পারবে না', 'error');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('facultyId', formData.facultyId);
            formDataToSend.append('facultyName', formData.facultyName);
            
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            let response;
            if (department) {
                // Edit mode
                response = await axiosInstance.put(`/depertment/${department._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Add mode
                response = await axiosInstance.post('/depertment', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            if (response.data && response.data.success) {
                Swal.fire('Success!', 
                    department ? 'বিভাগ সফলভাবে আপডেট হয়েছে' : 'বিভাগ সফলভাবে তৈরি হয়েছে', 
                    'success'
                );
                resetForm();
                if (onClose) {
                    onClose();
                }
            } else {
                Swal.fire('Error!', response.data?.message || 'সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error saving department:', error);
            
            // Handle duplicate department error
            if (error.response?.data?.message?.includes('ইতিমধ্যে')) {
                Swal.fire('Error!', error.response.data.message, 'error');
            } else {
                Swal.fire('Error!', 
                    department ? 'বিভাগ আপডেট করতে সমস্যা হয়েছে' : 'বিভাগ তৈরি করতে সমস্যা হয়েছে', 
                    'error'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Cancel form
    const handleCancel = () => {
        resetForm();
        if (onClose) {
            onClose();
        }
    };

    // Generate slug preview
    const generateSlug = (name) => {
        return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            {department ? 'বিভাগ এডিট করুন' : 'নতুন বিভাগ যোগ করুন'}
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            {department ? 'বিভাগের তথ্য আপডেট করুন' : 'নতুন বিভাগ তৈরি করুন'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Faculty Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Faculty <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.facultyId}
                                onChange={handleFacultyChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                required
                                disabled={facultiesLoading}
                            >
                                <option value="">ফ্যাকাল্টি নির্বাচন করুন</option>
                                {faculties.map((faculty) => (
                                    <option key={faculty._id} value={faculty._id}>
                                        {faculty.name}
                                    </option>
                                ))}
                            </select>
                            {facultiesLoading && (
                                <p className="text-xs text-gray-500 mt-1">ফ্যাকাল্টি লোড হচ্ছে...</p>
                            )}
                            {formData.facultyName && (
                                <p className="text-sm text-green-600 mt-1">
                                    নির্বাচিত ফ্যাকাল্টি: {formData.facultyName}
                                </p>
                            )}
                        </div>

                        {/* Department Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="বিভাগের নাম লিখুন"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                required
                                maxLength={100}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    কমপক্ষে ২ অক্ষর, সর্বোচ্চ ১০০ অক্ষর
                                </p>
                                <span className="text-xs text-gray-500">
                                    {formData.name.length}/100
                                </span>
                            </div>
                        </div>

                        {/* Description - Rich Text Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                placeholder="বিভাগ সম্পর্কে বিস্তারিত বিবরণ লিখুন..."
                                height="300px"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ছবি
                            </label>
                            <div className="flex items-center space-x-6">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        JPG, PNG, WebP ইত্যাদি ফরম্যাট সমর্থিত (সর্বোচ্চ ১০MB)
                                    </p>
                                </div>
                                {imagePreview && (
                                    <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Slug Preview */}
                        {formData.name.trim() && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">স্লাগ প্রিভিউ:</h4>
                                <div className="text-sm text-gray-600 bg-white border border-gray-300 rounded px-3 py-2 font-mono">
                                    {generateSlug(formData.name)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    এই স্লাগটি স্বয়ংক্রিয়ভাবে জেনারেট হবে
                                </p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                বাতিল করুন
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center space-x-2 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{department ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{department ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewDepartment;