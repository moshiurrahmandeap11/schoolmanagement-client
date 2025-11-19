import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';

const ResultSMS = () => {
    const [selectedExam, setSelectedExam] = useState('');
    const [results, setResults] = useState([]);
    const [studentsData, setStudentsData] = useState({});
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [examCategories, setExamCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [smsLoading, setSmsLoading] = useState(false);
    const [customMessage, setCustomMessage] = useState('');

    // Fetch exam categories
    const fetchExamCategories = async () => {
        try {
            const response = await axiosInstance.get('/exam-categories');
            if (response.data.success) {
                const categories = response.data.data.map(item => 
                    item.name || item.title || item.examCategory
                ).filter(Boolean);
                setExamCategories(categories);
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

    // Fetch student details
    const fetchStudentDetails = async (studentId) => {
        try {
            const response = await axiosInstance.get(`/students/${studentId}`);
            if (response.data.success) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching student ${studentId}:`, error);
            return null;
        }
    };

    // Fetch results based on selected exam
    const fetchResults = async (examCategory) => {
        if (!examCategory) return;
        
        setFetchLoading(true);
        try {
            const response = await axiosInstance.get('/results', {
                params: { examCategory }
            });
            
            if (response.data.success) {
                const resultsData = response.data.data || [];
                setResults(resultsData);
                setSelectedStudents([]);

                // Fetch student details
                const studentsMap = {};
                for (const result of resultsData) {
                    const studentData = await fetchStudentDetails(result.studentId);
                    if (studentData) {
                        studentsMap[result.studentId] = studentData;
                    }
                }
                setStudentsData(studentsMap);
                
                if (resultsData.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'কোন ডেটা নেই',
                        text: 'এই পরীক্ষার জন্য কোনো রেজাল্ট পাওয়া যায়নি।',
                        confirmButtonText: 'ঠিক আছে'
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            setResults([]);
            setStudentsData({});
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchExamCategories();
    }, []);

    useEffect(() => {
        if (selectedExam) {
            fetchResults(selectedExam);
        } else {
            setResults([]);
            setStudentsData({});
            setSelectedStudents([]);
        }
    }, [selectedExam]);

    const handleExamChange = (e) => {
        setSelectedExam(e.target.value);
    };

    const handleStudentSelect = (studentId) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === results.length) {
            setSelectedStudents([]);
        } else {
            const allStudentIds = results.map(result => result.studentId);
            setSelectedStudents(allStudentIds);
        }
    };

    const handleSendBulkSMS = async () => {
        if (selectedStudents.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'কোনো শিক্ষার্থী নির্বাচন করা হয়নি',
                text: 'দয়া করে SMS পাঠানোর জন্য অন্তত একজন শিক্ষার্থী নির্বাচন করুন।',
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        setSmsLoading(true);
        try {
            const result = await Swal.fire({
                title: 'SMS পাঠানো নিশ্চিত করুন',
                html: `
                    <div class="text-left">
                        <p>আপনি <strong>${selectedStudents.length} জন</strong> শিক্ষার্থীর অভিভাবকের কাছে SMS পাঠাতে চলেছেন।</p>
                        <p>এটি SMS Gateway এর মাধ্যমে বাংলাদেশের মোবাইল নম্বরে পাঠানো হবে।</p>
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'হ্যাঁ, SMS পাঠান',
                cancelButtonText: 'বাতিল করুন'
            });

            if (result.isConfirmed) {
                const response = await axiosInstance.post('/result-sms/send-bulk', {
                    studentIds: selectedStudents,
                    examCategory: selectedExam
                });

                if (response.data.success) {
                    const successful = response.data.data.successful.length;
                    const failed = response.data.data.failed.length;

                    let htmlContent = `
                        <div class="text-left">
                            <p><strong>SMS পাঠানো সম্পন্ন!</strong></p>
                            <p>সফল: ${successful} টি</p>
                            <p>ব্যর্থ: ${failed} টি</p>
                    `;

                    if (failed > 0) {
                        htmlContent += `<p class="text-red-600 mt-2">ব্যর্থ হওয়ার কারণগুলো চেক করুন।</p>`;
                    }

                    htmlContent += `</div>`;

                    await Swal.fire({
                        title: 'SMS পাঠানো সম্পন্ন',
                        html: htmlContent,
                        icon: successful > 0 ? 'success' : 'warning',
                        confirmButtonText: 'ঠিক আছে'
                    });
                }
            }
        } catch (error) {
            console.error('Error sending bulk SMS:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'SMS পাঠাতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setSmsLoading(false);
        }
    };

    const handleSendSingleSMS = async (studentId, phoneNumber) => {
        if (!phoneNumber) {
            Swal.fire({
                icon: 'warning',
                title: 'মোবাইল নম্বর নেই',
                text: 'এই শিক্ষার্থীর জন্য মোবাইল নম্বর সংরক্ষিত নেই।',
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        setSmsLoading(true);
        try {
            const response = await axiosInstance.post('/result-sms/send-single', {
                studentId: studentId,
                examCategory: selectedExam,
                phoneNumber: phoneNumber
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'SMS পাঠানো হয়েছে!',
                    text: `${response.data.data.studentName} এর অভিভাবকের কাছে SMS পাঠানো হয়েছে।`,
                    confirmButtonText: 'ঠিক আছে'
                });
            }
        } catch (error) {
            console.error('Error sending single SMS:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: error.response?.data?.message || 'SMS পাঠাতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setSmsLoading(false);
        }
    };

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => {
            return current && current[key] ? current[key] : 'N/A';
        }, obj);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">রেজাল্ট SMS ম্যানেজমেন্ট</h1>
                </div>

                {/* Exam Selection */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            পরীক্ষা নির্বাচন করুন *
                        </label>
                        <select
                            value={selectedExam}
                            onChange={handleExamChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition duration-200"
                        >
                            <option value="">পরীক্ষা নির্বাচন করুন</option>
                            {examCategories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results Table */}
                {selectedExam && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Table Header with Select All */}
                        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">
                                রেজাল্ট তালিকা - {selectedExam}
                            </h3>
                            <div className="flex items-center space-x-4">
                                <MainButton
                                    onClick={handleSelectAll}
                                    className="rounded-md"
                                >
                                    {selectedStudents.length === results.length ? 'সব আনসিলেক্ট করুন' : 'সব সিলেক্ট করুন'}
                                </MainButton>
                                <span className="text-sm text-gray-600">
                                    {selectedStudents.length} জন নির্বাচিত
                                </span>
                                {selectedStudents.length > 0 && (
                                    <MainButton
                                        onClick={handleSendBulkSMS}
                                        disabled={smsLoading}
                                        className="rounded-md"
                                    >
                                        {smsLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                পাঠানো হচ্ছে...
                                            </div>
                                        ) : (
                                            `বাল্ক SMS পাঠান (${selectedStudents.length})`
                                        )}
                                    </MainButton>
                                )}
                            </div>
                        </div>

                        {fetchLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e90c9]"></div>
                                <span className="ml-2 text-gray-600">রেজাল্ট লোড হচ্ছে...</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নির্বাচন
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                আইডি
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অভিভাবকের মোবাইল
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                গড় নম্বর
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কর্ম
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {results.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                                                    এই পরীক্ষার জন্য কোনো রেজাল্ট পাওয়া যায়নি
                                                </td>
                                            </tr>
                                        ) : (
                                            results.map((result) => {
                                                const student = studentsData[result.studentId] || {};
                                                const className = getNestedValue(student, 'class.name');
                                                const guardianMobile = student.guardianMobile || 'N/A';
                                                
                                                return (
                                                    <tr 
                                                        key={result._id} 
                                                        className={`hover:bg-gray-50 ${
                                                            selectedStudents.includes(result.studentId) 
                                                                ? 'bg-blue-50' 
                                                                : ''
                                                        }`}
                                                    >
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedStudents.includes(result.studentId)}
                                                                onChange={() => handleStudentSelect(result.studentId)}
                                                                className="h-4 w-4 text-[#1e90c9] focus:ring-[#1e90c9] border-gray-300 rounded"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {result.studentId}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {student.name || 'লোড হচ্ছে...'}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {className}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {guardianMobile}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                            {result.averageMarks || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                            <MainButton
                                                                onClick={() => handleSendSingleSMS(result.studentId, guardianMobile)}
                                                                disabled={smsLoading || guardianMobile === 'N/A'}
                                                                className=" text-white px-3 py-1 rounded text-xs  focus:outline-none focus:ring-2  transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                SMS পাঠান
                                                            </MainButton>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                {!selectedExam && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <p className="text-[#1e90c9]">
                            SMS পাঠাতে উপরের ড্রপডাউন থেকে একটি পরীক্ষা নির্বাচন করুন।
                        </p>
                    </div>
                )}

                {/* SMS Gateway Info */}
                <div className="mt-6 bg-blue-50 border border-[#1e90c9] rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-[#1e90c9] mb-2">SMS Gateway সেটআপ প্রয়োজন:</h4>
                    <ul className="text-sm text-[#1e90c9] list-disc list-inside space-y-1">
                        <li>SSL Wireless, Bulk SMS Bangladesh বা অন্য কোনো SMS Gateway এ অ্যাকাউন্ট তৈরি করুন</li>
                        <li>.env ফাইলে API_KEY এবং SID সংযুক্ত করুন</li>
                        <li>বাংলাদেশের মোবাইল নম্বর ফরম্যাট: 01XXXXXXXXX, +8801XXXXXXXXX, বা 8801XXXXXXXXX</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResultSMS;