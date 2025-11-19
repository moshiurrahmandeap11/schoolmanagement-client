import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';

const ExcelMarks = () => {
    const [formData, setFormData] = useState({
        examCategory: '',
        averageMarks: '',
        averageLetterGrade: '',
        order: '',
        totalAbsent: '',
        totalPresent: ''
    });
    
    const [excelFile, setExcelFile] = useState(null);
    const [dropdownOptions, setDropdownOptions] = useState({
        examCategories: []
    });
    
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [uploadLoading, setUploadLoading] = useState(false);

    // Fetch exam categories from /exam-categories API
    const fetchExamCategories = async () => {
        try {
            const response = await axiosInstance.get('/exam-categories');
            if (response.data.success) {
                // Extract exam category names from response
                const examCategories = response.data.data.map(item => 
                    item.name || item.title || item.examCategory
                ).filter(Boolean);
                
                setDropdownOptions({
                    examCategories
                });
            }
        } catch (error) {
            console.error('Error fetching exam categories:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'পরীক্ষার ক্যাটাগরি লোড করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        }
    };

    // Fetch dropdown options
    const fetchDropdownOptions = async () => {
        setFetchLoading(true);
        try {
            await fetchExamCategories();
        } catch (error) {
            console.error('Error fetching dropdown options:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'ডেটা লোড করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is Excel
            const validTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.oasis.opendocument.spreadsheet'
            ];
            
            if (!validTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    title: 'ভুল ফাইল ফরম্যাট!',
                    text: 'শুধুমাত্র Excel ফাইল (.xlsx, .xls) আপলোড করুন।',
                    confirmButtonText: 'ঠিক আছে'
                });
                e.target.value = '';
                return;
            }
            
            setExcelFile(file);
        }
    };

    const handleDownloadTemplate = async () => {
        if (!formData.examCategory) {
            Swal.fire({
                icon: 'warning',
                title: 'পরীক্ষা নির্বাচন করুন',
                text: 'টেমপ্লেট ডাউনলোড করতে পরীক্ষা নির্বাচন করুন।',
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        try {
            const response = await axiosInstance.get('/excel-marks/download-template', {
                params: { examCategory: formData.examCategory },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `marks_template_${formData.examCategory}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            Swal.fire({
                icon: 'success',
                title: 'সফল!',
                text: 'এক্সেল টেমপ্লেট ডাউনলোড করা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });

        } catch (error) {
            console.error('Error downloading template:', error);
            Swal.fire({
                icon: 'error',
                title: 'ডাউনলোড ব্যর্থ!',
                text: 'টেমপ্লেট ডাউনলোড করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        }
    };

    const handleUploadExcel = async () => {
        if (!formData.examCategory) {
            Swal.fire({
                icon: 'warning',
                title: 'পরীক্ষা নির্বাচন করুন',
                text: 'ফাইল আপলোড করতে পরীক্ষা নির্বাচন করুন।',
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        if (!excelFile) {
            Swal.fire({
                icon: 'warning',
                title: 'ফাইল নির্বাচন করুন',
                text: 'আপলোড করার জন্য একটি Excel ফাইল নির্বাচন করুন।',
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        setUploadLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('excelFile', excelFile);
            formDataToSend.append('examCategory', formData.examCategory);

            const response = await axiosInstance.post('/excel-marks/upload', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'সফল!',
                    text: 'এক্সেল ফাইল সফলভাবে আপলোড হয়েছে!',
                    confirmButtonText: 'ঠিক আছে'
                });
                
                // Reset file input
                setExcelFile(null);
                document.getElementById('excelFile').value = '';
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            Swal.fire({
                icon: 'error',
                title: 'আপলোড ব্যর্থ!',
                text: 'ফাইল আপলোড করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setUploadLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.examCategory) {
            Swal.fire({
                icon: 'warning',
                title: 'অপূর্ণ তথ্য',
                text: 'দয়া করে পরীক্ষা নির্বাচন করুন!',
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
                const response = await axiosInstance.post('/excel-marks', formData);
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
                        averageMarks: '',
                        averageLetterGrade: '',
                        order: '',
                        totalAbsent: '',
                        totalPresent: ''
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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">এক্সেল মার্কস ম্যানেজমেন্ট</h1>
                </div>

                {/* Note Section */}
                <div className="bg-blue-50  rounded-lg p-4 mb-6">
                    <p className="text-[#1e90c9] text-sm">
                        <strong>Note:</strong> Please select exam and download the excel sheet. After you update the marksheet with student results, upload it here. Please don't change the excel format.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    {fetchLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e90c9]"></div>
                            <span className="ml-2 text-gray-600">পরীক্ষার লিস্ট লোড হচ্ছে...</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* পরীক্ষা (Exam Category) Dropdown - /exam-categories থেকে */}
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
                                <p className="text-xs text-gray-500 mt-1">
                                    পরীক্ষার তালিকা /exam-categories API থেকে লোড করা হয়েছে
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Average Marks */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Average Marks
                                    </label>
                                    <input
                                        type="number"
                                        name="averageMarks"
                                        value={formData.averageMarks}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition duration-200"
                                        placeholder="গড় নম্বর"
                                    />
                                </div>

                                {/* Average Letter Grade */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Average Letter Grade
                                    </label>
                                    <input
                                        type="text"
                                        name="averageLetterGrade"
                                        value={formData.averageLetterGrade}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition duration-200"
                                        placeholder="গড় লেটার গ্রেড"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Order */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition duration-200"
                                        placeholder="ক্রম"
                                    />
                                </div>

                                {/* মোট অনুপস্থিত */}
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
                                        placeholder="মোট অনুপস্থিত"
                                    />
                                </div>

                                {/* মোট উপস্থিত */}
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
                                        placeholder="মোট উপস্থিত"
                                    />
                                </div>
                            </div>

                            {/* Excel File Upload Section */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">এক্সেল ফাইল ম্যানেজমেন্ট</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Download Template Button */}
                                    <MainButton
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        className='flex items-center justify-center rounded-md'
                                    >
                                        এক্সেল ডাউনলোড করুন
                                    </MainButton>

                                    {/* File Upload Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            এক্সেল শীট আপলোড করুন
                                        </label>
                                        <input
                                            type="file"
                                            id="excelFile"
                                            onChange={handleFileChange}
                                            accept=".xlsx, .xls"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                        />
                                        {excelFile && (
                                            <p className="text-sm text-green-600 mt-1">
                                                নির্বাচিত ফাইল: {excelFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Upload Button */}
                                <div className="mt-4">
                                    <MainButton
                                        type="button"
                                        onClick={handleUploadExcel}
                                        disabled={uploadLoading}
                                        className="rounded-md"
                                    >
                                        {uploadLoading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                আপলোড হচ্ছে...
                                            </div>
                                        ) : (
                                            'এক্সেল শীট আপলোড করুন'
                                        )}
                                    </MainButton>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <MainButton
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center rounded-md"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            সংরক্ষণ করা হচ্ছে...
                                        </div>
                                    ) : (
                                        'ডেটা সংরক্ষণ করুন'
                                    )}
                                </MainButton>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExcelMarks;