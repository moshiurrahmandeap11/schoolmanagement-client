import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import RichTextEditor from '../../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AddNewClass = ({ classItem, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (classItem) {
            setFormData({
                name: classItem.name || '',
                description: classItem.description || ''
            });
        }
    }, [classItem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
        
        if (errors.description) {
            setErrors(prev => ({
                ...prev,
                description: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'ক্লাসের নাম প্রয়োজন';
        }
        
        if (formData.name.trim().length < 2) {
            newErrors.name = 'ক্লাসের নাম কমপক্ষে ২ অক্ষরের হতে হবে';
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
            let response;
            
            if (classItem) {
                // Update existing class
                response = await axiosInstance.put(`/class/${classItem._id}`, {
                    name: formData.name.trim(),
                    description: formData.description.trim()
                });
            } else {
                // Create new class
                response = await axiosInstance.post('/class', {
                    name: formData.name.trim(),
                    description: formData.description.trim()
                });
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving class:', error);
            const errorMessage = error.response?.data?.message || 'ক্লাস সংরক্ষণ করতে সমস্যা হয়েছে';
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
                            {classItem ? 'ক্লাস এডিট করুন' : 'নতুন ক্লাস যোগ করুন'}
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
                                <h3 className="text-lg font-semibold text-[#1e90c9] mb-2">Class Details:</h3>
                            </div>

                            {/* Class Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="ক্লাসের নাম লিখুন (যেমন: Class 1, Class 2)"
                                    disabled={loading}
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* বিবরণ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বিবরণ
                                </label>
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    placeholder="ক্লাসের বিস্তারিত বিবরণ লিখুন..."
                                    height="200px"
                                />
                            </div>

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
                                <MainButton
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-md"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            {classItem ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm mr-2" />
                                            {classItem ? 'আপডেট করুন' : 'আরও যোগ করুন'}
                                        </>
                                    )}
                                </MainButton>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="text-sm font-medium text-[#1e90c9] mb-1">
                                ক্লাস সম্পর্কে:
                            </h3>
                            <ul className="text-xs text-[#1e90c9] space-y-1">
                                <li>• ক্লাসের নাম অনন্য হতে হবে</li>
                                <li>• ক্লাস তৈরি করার পর এডিট ও ডিলিট করা যাবে</li>
                                <li>• নিষ্ক্রিয় ক্লাস নতুন ভর্তিতে ব্যবহার করা যাবে না</li>
                                <li>• বিবরণ ফিল্ডটি ঐচ্ছিক, তবে সুপারিশকৃত</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewClass;