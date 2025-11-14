import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';


const AdmissionFormAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        // Personal Information
        studentName: '',
        fatherName: '',
        motherName: '',
        parentNID: '',
        birthRegistrationNo: '',
        gender: '',
        dateOfBirth: '',
        parentMobile: '',
        studentMobile: '',

        // Academic Information
        sessionId: '',
        sessionName: '',
        classId: '',
        className: '',
        sectionId: '',
        sectionName: '',

        // Address Information
        address: '',
        city: '',
        postOffice: '',
        country: 'Bangladesh',

        // Previous Education
        previousInstitute: '',
        previousResult: '',

        // Image
        image: null
    });

    const [imagePreview, setImagePreview] = useState('');

    // Fetch sessions, classes, and sections
    const fetchData = async () => {
        try {
            const [sessionsRes, classesRes, sectionsRes] = await Promise.all([
                axiosInstance.get('/sessions'),
                axiosInstance.get('/class'),
                axiosInstance.get('/sections')
            ]);

            if (sessionsRes.data?.success) setSessions(sessionsRes.data.data || []);
            if (classesRes.data?.success) setClasses(classesRes.data.data || []);
            if (sectionsRes.data?.success) setSections(sectionsRes.data.data || []);

        } catch (err) {
            console.error('Error fetching data:', err);
            Swal.fire('Error!', 'ডেটা লোড করতে সমস্যা হয়েছে', 'error');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle session selection
    const handleSessionChange = (e) => {
        const selectedSessionId = e.target.value;
        const selectedSession = sessions.find(session => session._id === selectedSessionId);
        
        if (selectedSession) {
            setFormData(prev => ({
                ...prev,
                sessionId: selectedSession._id,
                sessionName: selectedSession.name
            }));
        }
    };

    // Handle class selection
    const handleClassChange = (e) => {
        const selectedClassId = e.target.value;
        const selectedClass = classes.find(cls => cls._id === selectedClassId);
        
        if (selectedClass) {
            setFormData(prev => ({
                ...prev,
                classId: selectedClass._id,
                className: selectedClass.name,
                sectionId: '', // Reset section when class changes
                sectionName: ''
            }));
        }
    };

    // Handle section selection
    const handleSectionChange = (e) => {
        const selectedSectionId = e.target.value;
        const selectedSection = sections.find(section => section._id === selectedSectionId);
        
        if (selectedSection) {
            setFormData(prev => ({
                ...prev,
                sectionId: selectedSection._id,
                sectionName: selectedSection.name
            }));
        }
    };

    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // File size check (10MB)
            if (file.size > 10 * 1024 * 1024) {
                Swal.fire('Error!', 'ফাইলের আকার ১০MB এর বেশি হতে পারবে না', 'error');
                e.target.value = ''; // Clear input
                return;
            }

            // File type check
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                Swal.fire('Error!', 'শুধুমাত্র JPG, PNG, WebP ছবি অনুমোদিত', 'error');
                e.target.value = ''; // Clear input
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.studentName.trim()) {
            Swal.fire('Error!', 'ছাত্রের নাম প্রয়োজন', 'error');
            return;
        }

        if (!formData.fatherName.trim()) {
            Swal.fire('Error!', 'পিতার নাম প্রয়োজন', 'error');
            return;
        }

        if (!formData.parentMobile.trim()) {
            Swal.fire('Error!', 'প্যারেন্ট মোবাইল নম্বর প্রয়োজন', 'error');
            return;
        }

        // Mobile validation
        const mobileRegex = /^(?:\+88|01)?\d{9,11}$/;
        if (!mobileRegex.test(formData.parentMobile)) {
            Swal.fire('Error!', 'সঠিক প্যারেন্ট মোবাইল নম্বর দিন', 'error');
            return;
        }

        if (formData.studentMobile && !mobileRegex.test(formData.studentMobile)) {
            Swal.fire('Error!', 'সঠিক শিক্ষার্থীর মোবাইল নম্বর দিন', 'error');
            return;
        }

        if (!formData.sessionId) {
            Swal.fire('Error!', 'সেশন নির্বাচন প্রয়োজন', 'error');
            return;
        }

        if (!formData.classId) {
            Swal.fire('Error!', 'ক্লাস নির্বাচন প্রয়োজন', 'error');
            return;
        }

        if (!formData.address.trim()) {
            Swal.fire('Error!', 'ঠিকানা প্রয়োজন', 'error');
            return;
        }

        // Date of Birth validation
        if (formData.dateOfBirth) {
            const dob = new Date(formData.dateOfBirth);
            const today = new Date();
            const minAge = new Date();
            minAge.setFullYear(today.getFullYear() - 25); // Maximum 25 years old
            const maxAge = new Date();
            maxAge.setFullYear(today.getFullYear() - 4); // Minimum 4 years old

            if (dob > maxAge) {
                Swal.fire('Error!', 'বয়স কমপক্ষে ৪ বছর হতে হবে', 'error');
                return;
            }

            if (dob < minAge) {
                Swal.fire('Error!', 'বয়স সর্বোচ্চ ২৫ বছর হতে পারে', 'error');
                return;
            }
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            
            // Append all form data (except image first)
            Object.keys(formData).forEach(key => {
                if (key !== 'image' && formData[key] !== null && formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append image last if exists
            if (formData.image) {
                formDataToSend.append('image', formData.image);
                console.log('Uploading image:', formData.image.name, formData.image.type);
            }

            const response = await axiosInstance.post('/online-applications', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && response.data.success) {
                Swal.fire('Success!', 'ভর্তি ফর্ম সফলভাবে জমা দেওয়া হয়েছে', 'success');
                
                // Reset form
                setFormData({
                    studentName: '',
                    fatherName: '',
                    motherName: '',
                    parentNID: '',
                    birthRegistrationNo: '',
                    gender: '',
                    dateOfBirth: '',
                    parentMobile: '',
                    studentMobile: '',
                    sessionId: '',
                    sessionName: '',
                    classId: '',
                    className: '',
                    sectionId: '',
                    sectionName: '',
                    address: '',
                    city: '',
                    postOffice: '',
                    country: 'Bangladesh',
                    previousInstitute: '',
                    previousResult: '',
                    image: null
                });
                setImagePreview('');

                // Navigate to applications list
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                Swal.fire('Error!', response.data?.message || 'সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error submitting admission form:', error);
            const errorMsg = error.response?.data?.message || 'ভর্তি ফর্ম জমা দিতে সমস্যা হয়েছে';
            Swal.fire('Error!', errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            ভর্তি ফর্ম
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            নতুন শিক্ষার্থীর ভর্তি ফর্ম পূরণ করুন
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Personal Information Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                ব্যক্তিগত তথ্য
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Student Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        নাম <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="studentName"
                                        value={formData.studentName}
                                        onChange={handleInputChange}
                                        placeholder="ছাত্রের পূর্ণ নাম"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Father's Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        পিতার নাম <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fatherName"
                                        value={formData.fatherName}
                                        onChange={handleInputChange}
                                        placeholder="পিতার পূর্ণ নাম"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Mother's Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        মায়ের নাম
                                    </label>
                                    <input
                                        type="text"
                                        name="motherName"
                                        value={formData.motherName}
                                        onChange={handleInputChange}
                                        placeholder="মায়ের পূর্ণ নাম"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Parent NID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        জাতীয় পরিচয়পত্র-পিতা / মাতা / অবিভাবক
                                    </label>
                                    <input
                                        type="text"
                                        name="parentNID"
                                        value={formData.parentNID}
                                        onChange={handleInputChange}
                                        placeholder="জাতীয় পরিচয়পত্র নম্বর"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Birth Registration No */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        জন্ম নিবন্ধন নং
                                    </label>
                                    <input
                                        type="text"
                                        name="birthRegistrationNo"
                                        value={formData.birthRegistrationNo}
                                        onChange={handleInputChange}
                                        placeholder="জন্ম নিবন্ধন নম্বর"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        লিঙ্গ
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">লিঙ্গ নির্বাচন করুন</option>
                                        <option value="male">পুরুষ</option>
                                        <option value="female">মহিলা</option>
                                        <option value="other">অন্যান্য</option>
                                    </select>
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        জন্ম তারিখ
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Parent Mobile */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        প্যারেন্ট মোবাইল <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="parentMobile"
                                        value={formData.parentMobile}
                                        onChange={handleInputChange}
                                        placeholder="০১XXXXXXXXX"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Student Mobile */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শিক্ষার্থীর মোবাইল (ঐচ্ছিক)
                                    </label>
                                    <input
                                        type="tel"
                                        name="studentMobile"
                                        value={formData.studentMobile}
                                        onChange={handleInputChange}
                                        placeholder="০১XXXXXXXXX"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Academic Information Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                একাডেমিক তথ্য
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Session */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেশন <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.sessionId}
                                        onChange={handleSessionChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">সেশন নির্বাচন করুন</option>
                                        {sessions.map((session) => (
                                            <option key={session._id} value={session._id}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.classId}
                                        onChange={handleClassChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
                                        {classes.map((cls) => (
                                            <option key={cls._id} value={cls._id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেকশন
                                    </label>
                                    <select
                                        value={formData.sectionId}
                                        onChange={handleSectionChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={!formData.classId}
                                    >
                                        <option value="">সেকশন নির্বাচন করুন</option>
                                        {sections
                                            .filter(section => section.classId === formData.classId)
                                            .map((section) => (
                                                <option key={section._id} value={section._id}>
                                                    {section.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Address Information Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                ঠিকানা তথ্য
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ঠিকানা <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="পূর্ণ ঠিকানা"
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শহর
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="শহরের নাম"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Post Office */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        পোস্ট অফিস
                                    </label>
                                    <input
                                        type="text"
                                        name="postOffice"
                                        value={formData.postOffice}
                                        onChange={handleInputChange}
                                        placeholder="পোস্ট অফিসের নাম"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        দেশ
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Previous Education Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                পূর্ববর্তী শিক্ষা
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Previous Institute */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        পূর্ববর্তী ইনস্টিটিউট
                                    </label>
                                    <input
                                        type="text"
                                        name="previousInstitute"
                                        value={formData.previousInstitute}
                                        onChange={handleInputChange}
                                        placeholder="পূর্ববর্তী শিক্ষা প্রতিষ্ঠানের নাম"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Previous Result */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        পূর্ববর্তী ফলাফল
                                    </label>
                                    <input
                                        type="text"
                                        name="previousResult"
                                        value={formData.previousResult}
                                        onChange={handleInputChange}
                                        placeholder="পূর্ববর্তী ক্লাসের ফলাফল"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                ছবি আপলোড
                            </h2>
                            <div className="flex items-center space-x-6">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        JPG, PNG, WebP ফরম্যাট সমর্থিত (সর্বোচ্চ ১০MB)
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

                        {/* Submit Button */}
                        <div className="flex justify-center pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-8 py-4 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center space-x-2 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>জমা দেওয়া হচ্ছে...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span>ভর্তি ফর্ম জমা দিন</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdmissionFormAdmin;