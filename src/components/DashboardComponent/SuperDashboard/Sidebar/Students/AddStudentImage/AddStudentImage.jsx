import { useEffect, useState } from 'react';
import { FaArrowLeft, FaImage, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../hooks/axiosInstance/axiosInstance';


const AddStudentImage = ({ onBack }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedStudentData, setSelectedStudentData] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setFetchingStudents(true);
            const response = await axiosInstance.get('/students');
            
            if (response.data.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            showSweetAlert('error', 'শিক্ষার্থীদের লোড করতে সমস্যা হয়েছে');
        } finally {
            setFetchingStudents(false);
        }
    };

    const handleStudentChange = (e) => {
        const studentId = e.target.value;
        setSelectedStudent(studentId);
        
        if (studentId) {
            const student = students.find(s => s._id === studentId);
            setSelectedStudentData(student);
            setImagePreview(`${baseImageURL}${student?.photo}` || '');
        } else {
            setSelectedStudentData(null);
            setImagePreview('');
        }
        
        setImageFile(null);
        setErrors(prev => ({ ...prev, student: '' }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, image: 'শুধুমাত্র ইমেজ ফাইল আপলোড করুন' }));
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'ইমেজের সাইজ 5MB এর কম হতে হবে' }));
                return;
            }

            setImageFile(file);
            setErrors(prev => ({ ...prev, image: '' }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(`${baseImageURL}${selectedStudentData?.photo}` || '');
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!selectedStudent) {
            newErrors.student = 'শিক্ষার্থী নির্বাচন করুন';
        }
        
        if (!imageFile && !selectedStudentData?.photo) {
            newErrors.image = 'ইমেজ আপলোড করুন';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            
            if (imageFile) {
                formData.append('photo', imageFile);
            }

            // Include other student data to maintain the record
            if (selectedStudentData) {
                Object.keys(selectedStudentData).forEach(key => {
                    if (key !== 'photo' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
                        formData.append(key, selectedStudentData[key]);
                    }
                });
            }

            const response = await axiosInstance.put(`/students/${selectedStudent}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                // Reset form
                setSelectedStudent('');
                setSelectedStudentData(null);
                setImageFile(null);
                setImagePreview('');
                fetchStudents(); // Refresh student list
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error updating student image:', error);
            const errorMessage = error.response?.data?.message || 'শিক্ষার্থীর ইমেজ আপডেট করতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            শিক্ষার্থীর ইমেজ যোগ করুন
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                    শিক্ষার্থীর ইমেজ আপলোড:
                                </h3>
                                <p className="text-sm text-blue-600">
                                    শিক্ষার্থী নির্বাচন করুন এবং নতুন ইমেজ আপলোড করুন
                                </p>
                            </div>

                            {/* Student Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শিক্ষার্থী নির্বাচন করুন *
                                </label>
                                <select
                                    value={selectedStudent}
                                    onChange={handleStudentChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                        errors.student ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={loading || fetchingStudents}
                                >
                                    <option value="">শিক্ষার্থী নির্বাচন করুন</option>
                                    {students.map((student) => (
                                        <option key={student._id} value={student._id}>
                                            {student.name} - {student.studentId} - {student.class?.name} 
                                            {student.section?.name ? ` - ${student.section.name}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.student && (
                                    <p className="mt-2 text-sm text-red-600">{errors.student}</p>
                                )}
                                {fetchingStudents && (
                                    <p className="mt-2 text-sm text-gray-600">শিক্ষার্থী লোড হচ্ছে...</p>
                                )}
                            </div>

                            {/* Selected Student Info */}
                            {selectedStudentData && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                                        নির্বাচিত শিক্ষার্থীর তথ্য:
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">নাম:</span>
                                            <p className="font-medium text-gray-800">{selectedStudentData.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">আইডি:</span>
                                            <p className="font-medium text-gray-800">{selectedStudentData.studentId}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">ক্লাস:</span>
                                            <p className="font-medium text-gray-800">
                                                {selectedStudentData.class?.name}
                                                {selectedStudentData.section?.name && ` - ${selectedStudentData.section.name}`}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">রোল:</span>
                                            <p className="font-medium text-gray-800">{selectedStudentData.classRoll}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ইমেজ আপলোড *
                                    <span className="text-xs text-gray-500 ml-2">
                                        (JPEG, PNG, Max 5MB)
                                    </span>
                                </label>
                                
                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="mb-4">
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="Student preview"
                                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                                            />
                                            {imageFile && (
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Upload Area */}
                                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                                    errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                                }`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer block"
                                    >
                                        <FaImage className="text-4xl text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600 mb-2">
                                            {imageFile ? 'ইমেজ সিলেক্টেড' : 'ইমেজ সিলেক্ট করুন'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            ক্লিক করুন বা ড্রাগ করে ইমেজ আপলোড করুন
                                        </p>
                                        {imageFile && (
                                            <p className="text-xs text-green-600 mt-2">
                                                {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </p>
                                        )}
                                    </label>
                                </div>
                                {errors.image && (
                                    <p className="mt-2 text-sm text-red-600">{errors.image}</p>
                                )}
                            </div>

                            {/* Current Image Info */}
                            {selectedStudentData?.photo && !imageFile && (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ এই শিক্ষার্থীর ইতিমধ্যে একটি ইমেজ আছে। নতুন ইমেজ আপলোড করলে পুরানো ইমেজ রিপ্লেস হবে।
                                    </p>
                                </div>
                            )}

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-600 text-sm">{errors.submit}</p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={loading}
                                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    বাতিল করুন
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !selectedStudent}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            আপলোড হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            ইমেজ সংরক্ষণ করুন
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="text-sm font-medium text-blue-800 mb-1">
                                ইমেজ আপলোড সম্পর্কে:
                            </h3>
                            <ul className="text-xs text-blue-600 space-y-1">
                                <li>• শুধুমাত্র ইমেজ ফাইল (JPEG, PNG) আপলোড করুন</li>
                                <li>• ফাইলের সাইজ 5MB এর কম হতে হবে</li>
                                <li>• রেকমেন্ডেড সাইজ: 300x300 পিক্সেল</li>
                                <li>• নতুন ইমেজ আপলোড করলে পুরানো ইমেজ অটোমেটিক্যালি ডিলিট হয়ে যাবে</li>
                                <li>• ইমেজ স্টুডেন্ট প্রোফাইল, ID কার্ড ইত্যাদিতে ব্যবহৃত হবে</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentImage;