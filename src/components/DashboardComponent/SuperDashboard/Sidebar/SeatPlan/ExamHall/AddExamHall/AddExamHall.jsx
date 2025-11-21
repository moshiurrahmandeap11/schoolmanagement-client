import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';


const AddNewExamHall = ({ examHall, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        image: null,
        rooms: [{ roomNumber: '', seatCapacity: '' }]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    // Set form data if editing
    useEffect(() => {
        if (examHall) {
            setFormData({
                name: examHall.name || '',
                image: null,
                rooms: examHall.rooms && examHall.rooms.length > 0 
                    ? examHall.rooms 
                    : [{ roomNumber: '', seatCapacity: '' }]
            });
            if (examHall.image) {
                setImagePreview(`/uploads/${examHall.image}`);
            }
        }
    }, [examHall]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

    // Handle room changes
    const handleRoomChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            rooms: prev.rooms.map((room, i) => 
                i === index ? { ...room, [field]: value } : room
            )
        }));
    };

    // Add more rooms
    const addMoreRooms = () => {
        setFormData(prev => ({
            ...prev,
            rooms: [...prev.rooms, { roomNumber: '', seatCapacity: '' }]
        }));
    };

    // Remove room
    const removeRoom = (index) => {
        if (formData.rooms.length > 1) {
            setFormData(prev => ({
                ...prev,
                rooms: prev.rooms.filter((_, i) => i !== index)
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('এক্সাম হলের নাম প্রয়োজন');
            return false;
        }

        for (let i = 0; i < formData.rooms.length; i++) {
            const room = formData.rooms[i];
            if (!room.roomNumber.trim()) {
                setError(`রুম ${i + 1} এর রুম নম্বর প্রয়োজন`);
                return false;
            }
            if (!room.seatCapacity || parseInt(room.seatCapacity) <= 0) {
                setError(`রুম ${i + 1} এর সিট ক্যাপাসিটি প্রয়োজন`);
                return false;
            }
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('rooms', JSON.stringify(formData.rooms));

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const url = examHall ? `/exam-hall/${examHall._id}` : '/exam-hall';
            const method = examHall ? 'put' : 'post';

            const response = await axiosInstance[method](url, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.success) {
                setSuccess(examHall ? 'এক্সাম হল সফলভাবে আপডেট হয়েছে' : 'এক্সাম হল সফলভাবে তৈরি হয়েছে');
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(response.data?.message || 'সমস্যা হয়েছে');
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('সার্ভার সমস্যা হয়েছে');
            }
            console.error('Error saving exam hall:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold ">
                            {examHall ? 'এক্সাম হল এডিট করুন' : 'নতুন এক্সাম হল যোগ করুন'}
                        </h1>
                        <button
                            onClick={onClose}
                            className=" focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800 rounded transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        {/* Name Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                এক্সাম হলের নাম <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="এক্সাম হলের নাম লিখুন"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                হলের ছবি
                            </label>
                            <div className="flex items-center space-x-6">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        JPG, PNG, GIF ইত্যাদি ফরম্যাট সমর্থিত (সর্বোচ্চ ১০MB)
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

                        {/* Rooms */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    হল রুম সমূহ <span className="text-red-500">*</span>
                                </label>
                                <MainButton
                                    type="button"
                                    onClick={addMoreRooms}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    <span>আরও রুম যোগ করুন</span>
                                </MainButton>
                            </div>

                            <div className="space-y-4">
                                {formData.rooms.map((room, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-medium text-gray-700">রুম {index + 1}</h4>
                                            {formData.rooms.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRoom(index)}
                                                    className="p-1 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    রুম নম্বর <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={room.roomNumber}
                                                    onChange={(e) => handleRoomChange(index, 'roomNumber', e.target.value)}
                                                    placeholder="রুম নম্বর লিখুন"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200 text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    সিট ক্যাপাসিটি <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={room.seatCapacity}
                                                    onChange={(e) => handleRoomChange(index, 'seatCapacity', e.target.value)}
                                                    placeholder="সিট সংখ্যা"
                                                    min="1"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200 text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                বাতিল
                            </button>
                            <MainButton
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors duration-200 flex items-center space-x-2 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#1e90c9]'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{examHall ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{examHall ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </MainButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewExamHall;