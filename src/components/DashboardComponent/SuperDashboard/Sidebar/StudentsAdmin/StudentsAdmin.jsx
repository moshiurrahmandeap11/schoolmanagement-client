import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';

const StudentsAdmin = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('addStudent');
    const [selectedClass, setSelectedClass] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        class: '',
        roll: '',
        section: '',
        fathersName: '',
        mothersName: '',
        bio: '',
        location: '',
        phoneNumber: '',
        fathersPhone: '',
        mothersPhone: '',
        photo: null,
        status: 'active' // Default status
    });
    const [imagePreview, setImagePreview] = useState('');

    // Fetch students and classes on component mount
    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/students');
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'ছাত্র-ছাত্রীদের তথ্য লোড করতে সমস্যা হয়েছে',
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axiosInstance.get('/class');
            if (response.data.success) {
                setClasses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'সতর্কতা!',
                    text: 'শুধুমাত্র ইমেজ ফাইল আপলোড করুন',
                    confirmButtonText: 'ঠিক আছে'
                });
                return;
            }

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
                photo: file
            }));

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddClass = async () => {
        const { value: className } = await Swal.fire({
            title: 'নতুন ক্লাস যোগ করুন',
            input: 'text',
            inputLabel: 'ক্লাসের নাম',
            inputPlaceholder: 'যেমন: Class 6, Class 7 ইত্যাদি',
            showCancelButton: true,
            confirmButtonText: 'যোগ করুন',
            cancelButtonText: 'বাতিল করুন',
            inputValidator: (value) => {
                if (!value) {
                    return 'ক্লাসের নাম আবশ্যক';
                }
            }
        });

        if (className) {
            try {
                const response = await axiosInstance.post('/class', { name: className });
                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'সফল!',
                        text: 'ক্লাস সফলভাবে যোগ করা হয়েছে',
                        confirmButtonText: 'ঠিক আছে'
                    });
                    fetchClasses();
                }
            } catch  {
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: 'ক্লাস যোগ করতে সমস্যা হয়েছে',
                    confirmButtonText: 'ঠিক আছে'
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.class || !formData.roll || !formData.section) {
            Swal.fire({
                icon: 'warning',
                title: 'সতর্কতা!',
                text: 'নাম, ক্লাস, রোল এবং সেকশন আবশ্যক',
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        try {
            setLoading(true);
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    submitData.append(key, formData[key]);
                }
            });

            const response = await axiosInstance.post('/students', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'সফল!',
                    text: 'ছাত্র-ছাত্রী সফলভাবে যোগ করা হয়েছে',
                    confirmButtonText: 'ঠিক আছে'
                });
                resetForm();
                fetchStudents();
                setActiveTab('viewStudents');
            }
        } catch  {
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'ছাত্র-ছাত্রী যোগ করতে সমস্যা হয়েছে',
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            class: '',
            roll: '',
            section: '',
            fathersName: '',
            mothersName: '',
            bio: '',
            location: '',
            phoneNumber: '',
            fathersPhone: '',
            mothersPhone: '',
            photo: null,
            status: 'active'
        });
        setImagePreview('');
    };

    // Helper function to get class name safely
    const getClassName = (student) => {
        if (!student.class) return 'N/A';
        if (typeof student.class === 'string') return student.class;
        if (student.class.name) return student.class.name;
        if (student.class._id) return 'Class ID: ' + student.class._id;
        return 'N/A';
    };

    // Helper function to get section name safely
    const getSectionName = (student) => {
        if (!student.section) return 'N/A';
        if (typeof student.section === 'string') return student.section;
        if (student.section.name) return student.section.name;
        if (student.section._id) return 'Section ID: ' + student.section._id;
        return 'N/A';
    };

    const handleViewInformation = (student) => {
        const imageUrl = axiosInstance.defaults.baseURL;
        const className = getClassName(student);
        const sectionName = getSectionName(student);
        
        Swal.fire({
            title: `<strong>${student.name}</strong>`,
            html: `
                <div class="text-left space-y-3">
                    <div class="flex justify-center mb-4">
                        ${student.photo ? 
                            `<img src="${imageUrl}${student.photo}" alt="${student.name}" class="w-32 h-32 rounded-full object-cover border-4 border-blue-200">` :
                            `<div class="w-32 h-32 rounded-full bg-blue-100 border-4 border-blue-200 flex items-center justify-center">
                                <svg class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>`
                        }
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-blue-50 p-3 rounded-lg">
                            <strong class="text-blue-700">ক্লাস:</strong>
                            <p class="text-gray-700">${className}</p>
                        </div>
                        <div class="bg-green-50 p-3 rounded-lg">
                            <strong class="text-green-700">রোল:</strong>
                            <p class="text-gray-700">${student.roll || 'N/A'}</p>
                        </div>
                        <div class="bg-purple-50 p-3 rounded-lg">
                            <strong class="text-purple-700">সেকশন:</strong>
                            <p class="text-gray-700">${sectionName}</p>
                        </div>
                        <div class="${student.status === 'active' ? 'bg-green-50' : 'bg-red-50'} p-3 rounded-lg">
                            <strong class="${student.status === 'active' ? 'text-green-700' : 'text-red-700'}">স্ট্যাটাস:</strong>
                            <p class="text-gray-700">${student.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</p>
                        </div>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-2">পারিবারিক তথ্য</h4>
                        <div class="space-y-2">
                            ${student.fathersName ? `<p><strong>পিতার নাম:</strong> ${student.fathersName}</p>` : ''}
                            ${student.mothersName ? `<p><strong>মাতার নাম:</strong> ${student.mothersName}</p>` : ''}
                            ${student.fathersPhone ? `<p><strong>পিতার ফোন:</strong> ${student.fathersPhone}</p>` : ''}
                            ${student.mothersPhone ? `<p><strong>মাতার ফোন:</strong> ${student.mothersPhone}</p>` : ''}
                        </div>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-2">যোগাযোগের তথ্য</h4>
                        <div class="space-y-2">
                            ${student.phoneNumber ? `<p><strong>ফোন নম্বর:</strong> ${student.phoneNumber}</p>` : ''}
                            ${student.location ? `<p><strong>ঠিকানা:</strong> ${student.location}</p>` : ''}
                        </div>
                    </div>

                    ${student.bio ? `
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-gray-800 mb-2">বায়ো</h4>
                            <p class="text-gray-700">${student.bio}</p>
                        </div>
                    ` : ''}

                    <div class="bg-gray-100 p-3 rounded-lg text-sm text-gray-600">
                        <p><strong>যোগদানের তারিখ:</strong> ${new Date(student.createdAt).toLocaleDateString('bn-BD')}</p>
                        ${student.updatedAt ? `<p><strong>সর্বশেষ আপডেট:</strong> ${new Date(student.updatedAt).toLocaleDateString('bn-BD')}</p>` : ''}
                    </div>
                </div>
            `,
            width: '600px',
            showCloseButton: true,
            showConfirmButton: false,
            customClass: {
                popup: 'rounded-lg',
                title: 'text-2xl text-center mb-4'
            }
        });
    };

    const handleStatusUpdate = async (student) => {
        const newStatus = student.status === 'active' ? 'inactive' : 'active';
        const statusText = newStatus === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়';
        
        const result = await Swal.fire({
            title: 'স্ট্যাটাস আপডেট',
            text: `আপনি কি ${student.name} এর স্ট্যাটাস ${statusText} করতে চান?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, আপডেট করুন',
            cancelButtonText: 'বাতিল করুন',
            confirmButtonColor: newStatus === 'active' ? '#28a745' : '#dc3545'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(`/students/${student._id}`, {
                    status: newStatus
                });
                
                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'সফল!',
                        text: `ছাত্র-ছাত্রীর স্ট্যাটাস ${statusText} করা হয়েছে`,
                        confirmButtonText: 'ঠিক আছে'
                    });
                    fetchStudents();
                }
            } catch  {
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে',
                    confirmButtonText: 'ঠিক আছে'
                });
            }
        }
    };

    const handlePromoteStudent = async (student) => {
        const result = await Swal.fire({
            title: 'ছাত্র-ছাত্রীর ফলাফল',
            text: `${student.name} এর ফলাফল নির্বাচন করুন`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'পাস',
            cancelButtonText: 'ফেল',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545'
        });

        if (result.isConfirmed) {
            // Pass - promote to next class
            const { value: newRoll } = await Swal.fire({
                title: 'নতুন রোল নম্বর',
                input: 'number',
                inputLabel: 'পরবর্তী ক্লাসের রোল নম্বর',
                inputPlaceholder: 'রোল নম্বর লিখুন...',
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value) {
                        return 'রোল নম্বর আবশ্যক';
                    }
                }
            });

            if (newRoll) {
                try {
                    const response = await axiosInstance.put(`/students/${student._id}/promote`, {
                        newRoll: parseInt(newRoll),
                        status: 'pass'
                    });
                    
                    if (response.data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'সফল!',
                            text: 'ছাত্র-ছাত্রী পরবর্তী ক্লাসে প্রমোট করা হয়েছে',
                            confirmButtonText: 'ঠিক আছে'
                        });
                        fetchStudents();
                    }
                } catch  {
                    Swal.fire({
                        icon: 'error',
                        title: 'ত্রুটি!',
                        text: 'প্রমোট করতে সমস্যা হয়েছে',
                        confirmButtonText: 'ঠিক আছে'
                    });
                }
            }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Fail - stay in same class, update roll and section
            const { value: formValues } = await Swal.fire({
                title: 'রোল ও সেকশন আপডেট করুন',
                html:
                    '<input id="swal-input1" class="swal2-input" placeholder="রোল নম্বর">' +
                    '<input id="swal-input2" class="swal2-input" placeholder="সেকশন">',
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'আপডেট করুন',
                cancelButtonText: 'বাতিল করুন',
                preConfirm: () => {
                    return {
                        roll: document.getElementById('swal-input1').value,
                        section: document.getElementById('swal-input2').value
                    };
                }
            });

            if (formValues) {
                try {
                    const response = await axiosInstance.put(`/students/${student._id}`, {
                        roll: formValues.roll,
                        section: formValues.section,
                        status: 'fail'
                    });
                    
                    if (response.data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'সফল!',
                            text: 'ছাত্র-ছাত্রীর তথ্য আপডেট করা হয়েছে',
                            confirmButtonText: 'ঠিক আছে'
                        });
                        fetchStudents();
                    }
                } catch {
                    Swal.fire({
                        icon: 'error',
                        title: 'ত্রুটি!',
                        text: 'আপডেট করতে সমস্যা হয়েছে',
                        confirmButtonText: 'ঠিক আছে'
                    });
                }
            }
        }
    };

    // Filter students by class name safely
    const filteredStudents = selectedClass 
        ? students.filter(student => {
            const className = getClassName(student);
            return className === selectedClass;
        })
        : students;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className=" mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ছাত্র-ছাত্রী ম্যানেজমেন্ট
                    </h1>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('addStudent')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                activeTab === 'addStudent'
                                    ? 'text-[#1e90c9] border-b-2 border-[#1e90c9] bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            ছাত্র-ছাত্রী যোগ করুন
                        </button>
                        <button
                            onClick={() => setActiveTab('viewStudents')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                activeTab === 'viewStudents'
                                    ? 'text-[#1e90c9] border-b-2 border-[#1e90c9] bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            সকল ছাত্র-ছাত্রী
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'addStudent' && (
                            <div>
                                {/* Add Class Button */}
                                <div className="mb-6 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">নতুন ছাত্র-ছাত্রী যোগ করুন</h3>
                                    <MainButton
                                        onClick={handleAddClass}
                                    >
                                        নতুন ক্লাস যোগ করুন
                                    </MainButton>
                                </div>

                                {/* Student Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Required Fields */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                নাম *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ক্লাস *
                                            </label>
                                            <select
                                                name="class"
                                                value={formData.class}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                                required
                                            >
                                                <option value="">ক্লাস নির্বাচন করুন</option>
                                                {classes.map(cls => (
                                                    <option key={cls._id} value={cls.name}>
                                                        {cls.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                রোল নম্বর *
                                            </label>
                                            <input
                                                type="number"
                                                name="roll"
                                                value={formData.roll}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                সেকশন *
                                            </label>
                                            <input
                                                type="text"
                                                name="section"
                                                value={formData.section}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                                required
                                            />
                                        </div>

                                        {/* Status Field */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                স্ট্যাটাস *
                                            </label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                                required
                                            >
                                                <option value="active">সক্রিয়</option>
                                                <option value="inactive">নিষ্ক্রিয়</option>
                                            </select>
                                        </div>

                                        {/* Optional Fields */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                পিতার নাম
                                            </label>
                                            <input
                                                type="text"
                                                name="fathersName"
                                                value={formData.fathersName}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                মাতার নাম
                                            </label>
                                            <input
                                                type="text"
                                                name="mothersName"
                                                value={formData.mothersName}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ফোন নম্বর
                                            </label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                পিতার ফোন নম্বর
                                            </label>
                                            <input
                                                type="tel"
                                                name="fathersPhone"
                                                value={formData.fathersPhone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                মাতার ফোন নম্বর
                                            </label>
                                            <input
                                                type="tel"
                                                name="mothersPhone"
                                                value={formData.mothersPhone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ঠিকানা
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                বায়ো
                                            </label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                            />
                                        </div>

                                        {/* Photo Upload */}
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ছবি
                                            </label>
                                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4">
                                        <MainButton
                                            type="submit"
                                            disabled={loading}
                                            className='rounded-md'
                                        >
                                            {loading ? 'সেভ হচ্ছে...' : 'ছাত্র-ছাত্রী যোগ করুন'}
                                        </MainButton>
                                        
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            disabled={loading}
                                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            রিসেট করুন
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'viewStudents' && (
                            <div>
                                {/* Class Filter */}
                                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">সকল ছাত্র-ছাত্রী</h3>
                                    
                                    <div className="flex gap-3">
                                        <select
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        >
                                            <option value="">সব ক্লাস</option>
                                            {classes.map(cls => (
                                                <option key={cls._id} value={cls.name}>
                                                    {cls.name}
                                                </option>
                                            ))}
                                        </select>
                                        
                                        <MainButton
                                            onClick={handleAddClass}
                                            className="rounded-md"
                                        >
                                            নতুন ক্লাস
                                        </MainButton>
                                    </div>
                                </div>

                                {/* Students List */}
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader />
                                    </div>
                                ) : filteredStudents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredStudents.map(student => {
                                            const className = getClassName(student);
                                            const sectionName = getSectionName(student);
                                            
                                            return (
                                                <div key={student._id} className={`bg-white border rounded-lg shadow-sm p-4 ${
                                                    student.status === 'active' ? 'border-green-200' : 'border-red-200'
                                                }`}>
                                                    <div className="flex items-start gap-4">
                                                        {student.photo && (
                                                            <img
                                                                src={`${axiosInstance.defaults.baseURL}${student.photo}`}
                                                                alt={student.name}
                                                                className="w-16 h-16 rounded-full object-cover border border-gray-200"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    student.status === 'active' 
                                                                        ? 'bg-[#1e90c9] text-white' 
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {student.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                ক্লাস: {className}, রোল: {student.roll || 'N/A'}, সেকশন: {sectionName}
                                                            </p>
                                                            {student.fathersName && (
                                                                <p className="text-sm text-gray-500">পিতা: {student.fathersName}</p>
                                                            )}
                                                            {student.phoneNumber && (
                                                                <p className="text-sm text-gray-500">ফোন: {student.phoneNumber}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-4 flex gap-2">
                                                        <MainButton
                                                            onClick={() => handleViewInformation(student)}
                                                            className="rounded-md flex-1 flex items-center justify-center"
                                                        >
                                                            তথ্য দেখুন
                                                        </MainButton>
                                                        <button
                                                            onClick={() => handleStatusUpdate(student)}
                                                            className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                                                                student.status === 'active'
                                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                            }`}
                                                        >
                                                            {student.status === 'active' ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                                                        </button>
                                                    </div>
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={() => handlePromoteStudent(student)}
                                                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                                        >
                                                            ফলাফল দিন
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 text-lg">কোনো ছাত্র-ছাত্রী পাওয়া যায়নি</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            {selectedClass ? `${selectedClass} ক্লাসে কোনো ছাত্র-ছাত্রী নেই` : 'আপনি এখনো কোনো ছাত্র-ছাত্রী যোগ করেননি'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentsAdmin;