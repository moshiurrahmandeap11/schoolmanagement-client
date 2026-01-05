import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';
import useAuth from '../../../../../hooks/useAuth/useAuth';
import Loader from '../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';

const Profile = () => {
    const navigate = useNavigate(); // useNavigate হুক ব্যবহার করুন
    const { user: authUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        bio: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // Back button handler
    const handleBack = () => {
        navigate(-1); // ব্রাউজার হিস্টোরিতে এক ধাপ পিছনে যাবে
    };

    // Fetch user data
    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/users/uid/${authUser.uid}`);
            
            if (response.data?.success) {
                const user = response.data.data;
                setUserData(user);
                setFormData({
                    fullName: user.fullName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    bio: user.bio || ''
                });
                // Set image preview with full URL if exists
                if (user.profileImage) {
                    // Check if it's already a full URL or needs base URL
                    const imageUrl = user.profileImage.startsWith('http') 
                        ? user.profileImage 
                        : `${baseImageURL || axiosInstance.defaults.baseURL}${user.profileImage}`;
                    setImagePreview(imageUrl);
                } else {
                    setImagePreview('');
                }
            } else {
                Swal.fire('Error!', 'ইউজার ডেটা লোড করতে সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Swal.fire('Error!', 'ইউজার ডেটা লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authUser?.uid) {
            fetchUserData();
        }
    }, [authUser]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                Swal.fire('Error!', 'শুধুমাত্র ইমেজ ফাইল সিলেক্ট করুন', 'error');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire('Error!', 'ইমেজ সাইজ ৫MB এর কম হতে হবে', 'error');
                return;
            }

            setProfileImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload profile image
    const uploadProfileImage = async (file) => {
        try {
            setUploading(true);
            
            const uploadFormData = new FormData();
            uploadFormData.append('profileImage', file);

            const response = await axiosInstance.post('/users/upload-profile-image', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data?.success) {
                return response.data.imageUrl;
            } else {
                throw new Error(response.data?.message || 'Image upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate full name
        if (!formData.fullName || formData.fullName.trim() === '') {
            Swal.fire('Error!', 'দয়া করে আপনার পূর্ণ নাম লিখুন', 'error');
            return;
        }

        // Validate phone format if provided
        if (formData.phone && !/^01\d{9}$/.test(formData.phone)) {
            Swal.fire('Error!', 'সঠিক ফোন নম্বর দিন (যেমন: 01712345678)', 'error');
            return;
        }

        try {
            setSaving(true);

            let imageUrl = userData.profileImage || '';

            // Upload new image if selected
            if (profileImage) {
                try {
                    imageUrl = await uploadProfileImage(profileImage);
                } catch {
                    Swal.fire('Error!', 'ছবি আপলোড করতে সমস্যা হয়েছে', 'error');
                    setSaving(false);
                    return;
                }
            }

            // Update user data
            const updateData = {
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                bio: formData.bio.trim(),
                profileImage: imageUrl
            };

            const response = await axiosInstance.put(`/users/${userData._id}`, updateData);

            if (response.data?.success) {
                Swal.fire({
                    title: 'সফল!',
                    text: 'প্রোফাইল সফলভাবে আপডেট হয়েছে',
                    icon: 'success',
                    confirmButtonText: 'ঠিক আছে'
                });
                // Refresh user data
                setProfileImage(null);
                await fetchUserData();
            } else {
                Swal.fire('Error!', response.data?.message || 'আপডেট করতে সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire('Error!', 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Handle reset
    const handleReset = () => {
        Swal.fire({
            title: 'নিশ্চিত করুন?',
            text: 'আপনি কি সকল পরিবর্তন বাতিল করতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'হ্যাঁ',
            cancelButtonText: 'না'
        }).then((result) => {
            if (result.isConfirmed) {
                setFormData({
                    fullName: userData?.fullName || '',
                    email: userData?.email || '',
                    phone: userData?.phone || '',
                    address: userData?.address || '',
                    bio: userData?.bio || ''
                });
                setProfileImage(null);
                // Reset image preview to original
                if (userData?.profileImage) {
                    const imageUrl = userData.profileImage.startsWith('http') 
                        ? userData.profileImage 
                        : `${baseImageURL}${userData.profileImage}`;
                    setImagePreview(imageUrl);
                } else {
                    setImagePreview('');
                }
            }
        });
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (userData?.fullName) {
            return userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        if (userData?.email) {
            return userData.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <Loader />
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                {/* Back Button Section */}
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#1e90c9] transition-colors duration-200 font-medium"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        <span>পিছনে যান</span>
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header with Title and Back Button */}
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">প্রোফাইল ম্যানেজমেন্ট</h2>
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <FaArrowLeft className="w-3 h-3" />
                            ব্যাক
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column - Profile Image */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                        {/* Profile Image */}
                                        <div className="text-center">
                                            <div className="relative inline-block">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Profile"
                                                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                                                        onError={(e) => {
                                                            console.error('Image load error');
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-32 h-32 bg-[#1e90c9] rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg mx-auto">
                                                        {getUserInitials()}
                                                    </div>
                                                )}
                                                
                                                {/* Image Upload Button */}
                                                <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-[#1e90c9] text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    </svg>
                                                    <input
                                                        type="file"
                                                        id="profileImage"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>

                                            <div className="mt-4">
                                                <label htmlFor="profileImage" className="text-sm text-[#1e90c9] cursor-pointer font-medium">
                                                    {uploading ? 'আপলোড হচ্ছে...' : 'প্রোফাইল ছবি পরিবর্তন করুন'}
                                                </label>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    JPG, PNG, Max 5MB
                                                </p>
                                            </div>
                                        </div>

                                        {/* User Info Summary */}
                                        <div className="mt-6 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">রোল:</span>
                                                <span className="font-medium text-gray-800 capitalize">
                                                    {userData?.role === 'admin' ? 'অ্যাডমিন' : 
                                                     userData?.role === 'moderator' ? 'মডারেটর' : 'ইউজার'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">সদস্য হয়েছেন:</span>
                                                <span className="font-medium text-gray-800">
                                                    {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">আইডি:</span>
                                                <span className="font-medium text-gray-800 text-xs truncate max-w-[120px]" title={userData?._id}>
                                                    {userData?._id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Form */}
                                <div className="lg:col-span-2">
                                    <div className="space-y-6">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                পূর্ণ নাম <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                placeholder="আপনার পূর্ণ নাম লিখুন"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                                required
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ইমেইল <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200 bg-gray-50 cursor-not-allowed"
                                                required
                                                disabled
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                ইমেইল পরিবর্তন করা যাবে না
                                            </p>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ফোন নম্বর
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="01XXXXXXXXX"
                                                maxLength="11"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                বাংলাদেশী মোবাইল নম্বর (যেমন: 01712345678)
                                            </p>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ঠিকানা
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                                placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200 resize-none"
                                            />
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                বায়ো
                                            </label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                rows="4"
                                                placeholder="আপনার সম্পর্কে সংক্ষিপ্ত বর্ণনা লিখুন"
                                                maxLength="500"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200 resize-none"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formData.bio.length}/500 অক্ষর
                                            </p>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                disabled={saving || uploading}
                                            >
                                                <FaArrowLeft className="w-4 h-4" />
                                                ব্যাক
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={saving || uploading}
                                            >
                                                বাতিল করুন
                                            </button>
                                            <MainButton
                                                type="submit"
                                                disabled={saving || uploading}
                                                className="rounded-md"
                                            >
                                                {(saving || uploading) ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                        {uploading ? 'আপলোড হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                                    </span>
                                                ) : (
                                                    'প্রোফাইল আপডেট করুন'
                                                )}
                                            </MainButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;