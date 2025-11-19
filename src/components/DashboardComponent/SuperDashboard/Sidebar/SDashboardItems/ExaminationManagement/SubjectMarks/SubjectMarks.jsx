import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';

const SubjectMarks = () => {
    const [formData, setFormData] = useState({
        examCategory: '',
        order: '',
        totalAbsent: '',
        totalPresent: '',
        subject: ''
    });
    
    const [dropdownOptions, setDropdownOptions] = useState({
        examCategories: [],
        subjects: []
    });
    
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    // Fetch exam categories from API
    const fetchExamCategories = async () => {
        try {
            const response = await axiosInstance.get('/exam-categories');
            if (response.data.success) {
                return response.data.data || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching exam categories:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'পরীক্ষার ক্যাটাগরি লোড করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
            return [];
        }
    };

    // Fetch subjects from API
    const fetchSubjects = async () => {
        try {
            const response = await axiosInstance.get('/subjects');
            if (response.data.success) {
                return response.data.data || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching subjects:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'বিষয় লোড করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
            return [];
        }
    };

    // Fetch dropdown options from APIs
    const fetchDropdownOptions = async () => {
        setFetchLoading(true);
        try {
            const [examCategoriesData, subjectsData] = await Promise.all([
                fetchExamCategories(),
                fetchSubjects()
            ]);

            // Extract names from the response data
            const examCategories = examCategoriesData.map(item => item.name || item.title || item.examCategory);
            const subjects = subjectsData.map(item => item.name || item.title || item.subject);

            setDropdownOptions({
                examCategories: examCategories.filter(Boolean),
                subjects: subjects.filter(Boolean)
            });
        } catch (error) {
            console.error('Error fetching dropdown options:', error);
            Swal.fire({
                icon: 'warning',
                title: 'সতর্কতা',
                text: 'ডেটা লোড করতে সমস্যা হয়েছে, ডিফল্ট অপশন ব্যবহার করা হচ্ছে!',
                confirmButtonText: 'ঠিক আছে'
            });
            setDropdownOptions({
                examCategories: ['মিড টার্ম', 'ফাইনাল', 'সেমিস্টার'],
                subjects: ['গণিত', 'ইংরেজি', 'বিজ্ঞান', 'বাংলা', 'সমাজ বিজ্ঞান']
            });
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdownOptions();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.examCategory || !formData.subject) {
            Swal.fire({
                icon: 'warning',
                title: 'অপূর্ণ তথ্য',
                text: 'দয়া করে পরীক্ষা এবং বিষয় নির্বাচন করুন!',
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        setLoading(true);
        
        try {
            const result = await Swal.fire({
                title: 'আপনি কি নিশ্চিত?',
                text: "আপনি কি এই ডেটা সংরক্ষণ করতে চান?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'হ্যাঁ, সংরক্ষণ করুন!',
                cancelButtonText: 'বাতিল করুন'
            });

            if (result.isConfirmed) {
                const response = await axiosInstance.post('/subject-wise', formData);
                if (response.data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'সফল!',
                        text: 'ডেটা সফলভাবে সংরক্ষণ করা হয়েছে!',
                        confirmButtonText: 'ঠিক আছে'
                    });
                    
                    // Form reset
                    setFormData({
                        examCategory: '',
                        order: '',
                        totalAbsent: '',
                        totalPresent: '',
                        subject: ''
                    });
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            Swal.fire({
                icon: 'error',
                title: 'ব্যর্থ!',
                text: 'ডেটা সংরক্ষণ করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setLoading(false);
        }
    };

    const showPreview = () => {
        Swal.fire({
            title: 'ফর্ম ডেটা প্রিভিউ',
            html: `
                <div class="text-left">
                    <p><strong>পরীক্ষা:</strong> ${formData.examCategory || 'নেই'}</p>
                    <p><strong>ক্রম:</strong> ${formData.order || 'নেই'}</p>
                    <p><strong>মোট অনুপস্থিত:</strong> ${formData.totalAbsent || 'নেই'}</p>
                    <p><strong>মোট উপস্থিত:</strong> ${formData.totalPresent || 'নেই'}</p>
                    <p><strong>বিষয়:</strong> ${formData.subject || 'নেই'}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'ঠিক আছে'
        });
    };

    const resetForm = () => {
        Swal.fire({
            title: 'ফর্ম রিসেট করুন?',
            text: "আপনি কি নিশ্চিত যে ফর্মের সকল ডেটা রিসেট করতে চান?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'হ্যাঁ, রিসেট করুন!',
            cancelButtonText: 'বাতিল করুন'
        }).then((result) => {
            if (result.isConfirmed) {
                setFormData({
                    examCategory: '',
                    order: '',
                    totalAbsent: '',
                    totalPresent: '',
                    subject: ''
                });
                Swal.fire({
                    icon: 'success',
                    title: 'রিসেট!',
                    text: 'ফর্ম সফলভাবে রিসেট করা হয়েছে!',
                    confirmButtonText: 'ঠিক আছে'
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">বিষয়ভিত্তিক নম্বর</h1>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    {fetchLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e90c9]"></div>
                            <span className="ml-2 text-gray-600">ডেটা লোড হচ্ছে...</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* পরীক্ষা (Exam Category) Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    পরীক্ষা *
                                </label>
                                <select
                                    name="examCategory"
                                    value={formData.examCategory}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition duration-200"
                                >
                                    <option value="">পরীক্ষা নির্বাচন করুন</option>
                                    {dropdownOptions.examCategories.map((category, index) => (
                                        <option key={index} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Order Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ক্রম (Order)
                                </label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition duration-200"
                                    placeholder="ক্রম সংখ্যা লিখুন"
                                />
                            </div>

                            {/* মোট অনুপস্থিত (Total Absent) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    মোট অনুপস্থিত
                                </label>
                                <input
                                    type="number"
                                    name="totalAbsent"
                                    value={formData.totalAbsent}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition duration-200"
                                    placeholder="মোট অনুপস্থিত সংখ্যা"
                                />
                            </div>

                            {/* মোট উপস্থিত (Total Present) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    মোট উপস্থিত
                                </label>
                                <input
                                    type="number"
                                    name="totalPresent"
                                    value={formData.totalPresent}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition duration-200"
                                    placeholder="মোট উপস্থিত সংখ্যা"
                                />
                            </div>

                            {/* বিষয় (Subject) Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বিষয় *
                                </label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition duration-200"
                                >
                                    <option value="">বিষয় নির্বাচন করুন</option>
                                    {dropdownOptions.subjects.map((subject, index) => (
                                        <option key={index} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <MainButton
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-md flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            সংরক্ষণ...
                                        </div>
                                    ) : (
                                        'ডেটা সংরক্ষণ করুন'
                                    )}
                                </MainButton>
                                
                                <MainButton
                                    type="button"
                                    onClick={showPreview}
                                    className="flex items-center justify-center rounded-md"
                                >
                                    প্রিভিউ দেখুন
                                </MainButton>
                                
                                <MainButton
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-md flex items-center justify-center"
                                >
                                    ফর্ম রিসেট
                                </MainButton>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectMarks;