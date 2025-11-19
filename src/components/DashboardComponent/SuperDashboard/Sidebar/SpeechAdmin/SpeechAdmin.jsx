import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';
import RichTextEditor from '../../../../sharedItems/RichTextEditor/RichTextEditor';

const SpeechAdmin = () => {
    const [activeTab, setActiveTab] = useState('principal');
    const [speeches, setSpeeches] = useState({
        principal: null,
        president: null
    });
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        body: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState('');

    // Fetch speeches on component mount
    useEffect(() => {
        fetchSpeeches();
    }, []);

    const fetchSpeeches = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/speeches');
            
            if (response.data.success) {
                const speechesData = {};
                response.data.data.forEach(speech => {
                    speechesData[speech.type] = speech;
                });
                setSpeeches(speechesData);
                
                // Pre-fill form if speech exists for active tab
                if (speechesData[activeTab]) {
                    const currentSpeech = speechesData[activeTab];
                    setFormData({
                        body: currentSpeech.body || '',
                        image: null
                    });
                    setImagePreview(`${axiosInstance.defaults.baseURL}${currentSpeech.image}`);
                } else {
                    resetForm();
                }
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'স্পিচ লোড করতে সমস্যা হয়েছে',
                confirmButtonText: 'ঠিক আছে'
            });
            console.error('Error fetching speeches:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            body: '',
            image: null
        });
        setImagePreview('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'সতর্কতা!',
                    text: 'শুধুমাত্র ইমেজ ফাইল আপলোড করুন',
                    confirmButtonText: 'ঠিক আছে'
                });
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'সতর্কতা!',
                    text: 'ইমেজের সাইজ ৫MB এর কম হতে হবে',
                    confirmButtonText: 'ঠিক আছে'
                });
                return;
            }

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

    const handleBodyChange = (content) => {
        setFormData(prev => ({
            ...prev,
            body: content
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.body.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'সতর্কতা!',
                text: 'স্পিচ কন্টেন্ট আবশ্যক',
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        try {
            setLoading(true);
            
            const submitData = new FormData();
            submitData.append('type', activeTab);
            submitData.append('body', formData.body);
            
            if (formData.image) {
                submitData.append('image', formData.image);
            }

            const method = speeches[activeTab] ? 'put' : 'post';
            const url = speeches[activeTab] 
                ? `/speeches/${speeches[activeTab]._id}`
                : '/speeches';

            const response = await axiosInstance[method](url, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'সফল!',
                    text: speeches[activeTab] 
                        ? 'স্পিচ সফলভাবে আপডেট হয়েছে' 
                        : 'স্পিচ সফলভাবে তৈরি হয়েছে',
                    confirmButtonText: 'ঠিক আছে'
                });
                fetchSpeeches();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: response.data.message || 'সমস্যা হয়েছে',
                    confirmButtonText: 'ঠিক আছে'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'স্পিচ সেভ করতে সমস্যা হয়েছে',
                confirmButtonText: 'ঠিক আছে'
            });
            console.error('Error saving speech:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!speeches[activeTab]) {
            return;
        }

        const result = await Swal.fire({
            icon: 'warning',
            title: 'আপনি কি নিশ্চিত?',
            text: 'আপনি কি এই স্পিচ ডিলিট করতে চান? এটি পুনরুদ্ধার করা যাবে না!',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন',
            cancelButtonText: 'না, বাতিল করুন',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.delete(`/speeches/${speeches[activeTab]._id}`);

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'ডিলিট হয়েছে!',
                    text: 'স্পিচ সফলভাবে ডিলিট হয়েছে',
                    confirmButtonText: 'ঠিক আছে'
                });
                resetForm();
                fetchSpeeches();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: response.data.message || 'ডিলিট করতে সমস্যা হয়েছে',
                    confirmButtonText: 'ঠিক আছে'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'স্পিচ ডিলিট করতে সমস্যা হয়েছে',
                confirmButtonText: 'ঠিক আছে'
            });
            console.error('Error deleting speech:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Reset form when changing tabs
        resetForm();
        // Pre-fill form if speech exists for the tab
        if (speeches[tab]) {
            const currentSpeech = speeches[tab];
            setFormData({
                body: currentSpeech.body || '',
                image: null
            });
            setImagePreview(currentSpeech.image || '');
        }
    };

    const showResetConfirmation = async () => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'রিসেট করুন?',
            text: 'আপনি কি ফর্মটি রিসেট করতে চান? সকল পরিবর্তন হারিয়ে যাবে',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, রিসেট করুন',
            cancelButtonText: 'না, বাতিল করুন',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            resetForm();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        স্পিচ ম্যানেজমেন্ট
                    </h1>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => handleTabChange('principal')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                activeTab === 'principal'
                                    ? 'text-[#1e90c9] border-b-2 border-[#1e90c9] bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            প্রিন্সিপালের স্পিচ
                        </button>
                        <button
                            onClick={() => handleTabChange('president')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                activeTab === 'president'
                                    ? 'text-[#1e90c9] border-b-2 border-[#1e90c9] bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            প্রেসিডেন্টের স্পিচ
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-6">
                        {loading ? (
                            <Loader></Loader>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ইমেজ
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#1e90c9] hover:file:bg-[#1e90c9]"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                JPG, PNG, WebP (max 5MB)
                                            </p>
                                        </div>
                                        
                                        {imagePreview && (
                                            <div className="shrink-0">
                                                <div className="relative w-20 h-20 border border-gray-300 rounded-md overflow-hidden">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rich Text Editor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        স্পিচ কন্টেন্ট *
                                    </label>
                                    <RichTextEditor
                                        value={formData.body}
                                        onChange={handleBodyChange}
                                        placeholder="স্পিচের কন্টেন্ট লিখুন..."
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 pt-4">
                                    <MainButton
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {speeches[activeTab] ? 'আপডেট করুন' : 'সেভ করুন'}
                                    </MainButton>
                                    
                                    {speeches[activeTab] && (
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            ডিলিট করুন
                                        </button>
                                    )}
                                    
                                    <button
                                        type="button"
                                        onClick={showResetConfirmation}
                                        disabled={loading}
                                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        রিসেট করুন
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Current Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        বর্তমান স্ট্যাটাস
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border ${
                            speeches.principal 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-200 bg-gray-50'
                        }`}>
                            <h4 className="font-medium text-gray-900">প্রিন্সিপালের স্পিচ</h4>
                            <p className={`text-sm mt-1 ${
                                speeches.principal 
                                    ? 'text-green-600' 
                                    : 'text-gray-500'
                            }`}>
                                {speeches.principal ? 'সেট করা আছে' : 'সেট করা নেই'}
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg border ${
                            speeches.president 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-200 bg-gray-50'
                        }`}>
                            <h4 className="font-medium text-gray-900">প্রেসিডেন্টের স্পিচ</h4>
                            <p className={`text-sm mt-1 ${
                                speeches.president 
                                    ? 'text-green-600' 
                                    : 'text-gray-500'
                            }`}>
                                {speeches.president ? 'সেট করা আছে' : 'সেট করা নেই'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpeechAdmin;