import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';

const Marksheet = () => {
    const [selectedExam, setSelectedExam] = useState('');
    const [results, setResults] = useState([]);
    const [studentsData, setStudentsData] = useState({});
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [examCategories, setExamCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [studentFetchLoading, setStudentFetchLoading] = useState(false);

    // Fetch exam categories from API
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

    // Fetch student details from /students API
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

    // Fetch all students data for the results
    const fetchAllStudentsData = async (studentIds) => {
        setStudentFetchLoading(true);
        try {
            const studentsMap = {};
            for (const studentId of studentIds) {
                const studentData = await fetchStudentDetails(studentId);
                if (studentData) {
                    studentsMap[studentId] = studentData;
                }
            }
            setStudentsData(studentsMap);
        } catch (error) {
            console.error('Error fetching students data:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'শিক্ষার্থীদের তথ্য লোড করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setStudentFetchLoading(false);
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

                // Extract unique student IDs from results
                const studentIds = [...new Set(resultsData.map(result => result.studentId))];
                
                if (studentIds.length > 0) {
                    await fetchAllStudentsData(studentIds);
                } else {
                    setStudentsData({});
                }
                
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
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'রেজাল্ট লোড করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
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

    // Helper function to safely get nested object values
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => {
            return current && current[key] ? current[key] : 'N/A';
        }, obj);
    };

    const generatePDF = () => {
        if (selectedStudents.length === 0) return;

        const selectedResults = results.filter(result => 
            selectedStudents.includes(result.studentId)
        );

        // Create HTML content for PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>মার্কশিট - ${selectedExam}</title>
                <style>
                    body {
                        font-family: 'SolaimanLipi', 'Arial', sans-serif;
                        margin: 20px;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 10px;
                    }
                    .header h1 {
                        margin: 0;
                        color: #333;
                        font-size: 28px;
                    }
                    .header h2 {
                        margin: 5px 0;
                        color: #666;
                        font-size: 20px;
                    }
                    .student-info {
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                    }
                    .marks-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    .marks-table th,
                    .marks-table td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }
                    .marks-table th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    .summary {
                        margin-top: 30px;
                        padding: 15px;
                        background-color: #f9f9f9;
                        border-radius: 5px;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                        .student-info { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>মার্কশিট</h1>
                    <h2>পরীক্ষা: ${selectedExam}</h2>
                    <p>মোট শিক্ষার্থী: ${selectedStudents.length} জন</p>
                </div>

                ${selectedResults.map((result, index) => {
                    const student = studentsData[result.studentId] || {};
                    const className = getNestedValue(student, 'class.name');
                    const batchName = getNestedValue(student, 'batch.name');
                    const sectionName = getNestedValue(student, 'section.name');
                    
                    return `
                        <div class="student-info">
                            <h3>${index + 1}. ${student.name || 'N/A'} (আইডি: ${result.studentId})</h3>
                            <table class="marks-table">
                                <thead>
                                    <tr>
                                        <th>বিষয়</th>
                                        <th>নম্বর</th>
                                        <th>গ্রেড</th>
                                        <th>অবস্থান</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>গড় নম্বর</td>
                                        <td>${result.averageMarks || 'N/A'}</td>
                                        <td>${result.averageLetterGrade || 'N/A'}</td>
                                        <td>${result.order || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>উপস্থিতি</td>
                                        <td colspan="3">মোট উপস্থিত: ${result.totalPresent || 0}, অনুপস্থিত: ${result.totalAbsent || 0}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="student-details">
                                <strong>শিক্ষার্থী তথ্য:</strong><br>
                                ক্লাস: ${className}<br>
                                ব্যাচ: ${batchName}<br>
                                রোল: ${student.classRoll || 'N/A'}<br>
                                বিভাগ: ${sectionName}
                            </div>
                        </div>
                        <hr style="margin: 20px 0; border: none; border-top: 1px dashed #ccc;">
                    `;
                }).join('')}

                <div class="summary">
                    <h3>সারসংক্ষেপ</h3>
                    <p>মোট নির্বাচিত শিক্ষার্থী: ${selectedStudents.length} জন</p>
                    <p>ডাউনলোডের তারিখ: ${new Date().toLocaleString('bn-BD')}</p>
                </div>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} স্কুল ম্যানেজমেন্ট সিস্টেম</p>
                </div>
            </body>
            </html>
        `;

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    const handleDownloadPDF = async () => {
        if (selectedStudents.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'কোনো শিক্ষার্থী নির্বাচন করা হয়নি',
                text: 'দয়া করে মার্কশিট ডাউনলোড করার জন্য অন্তত একজন শিক্ষার্থী নির্বাচন করুন।',
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        setLoading(true);
        try {
            generatePDF();
            
            Swal.fire({
                icon: 'success',
                title: 'সফল!',
                text: 'মার্কশিট প্রিন্ট রেডি!',
                confirmButtonText: 'ঠিক আছে'
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'মার্কশিট তৈরি করতে সমস্যা হয়েছে!',
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">মার্কশিট ম্যানেজমেন্ট</h1>
                    <p className="text-gray-600">পরীক্ষার রেজাল্ট থেকে মার্কশিট ডাউনলোড করুন</p>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
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
                                {studentFetchLoading && (
                                    <span className="ml-2 text-sm text-blue-600">
                                        (শিক্ষার্থী তথ্য লোড হচ্ছে...)
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleSelectAll}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                >
                                    {selectedStudents.length === results.length ? 'সব আনসিলেক্ট করুন' : 'সব সিলেক্ট করুন'}
                                </button>
                                <span className="text-sm text-gray-600">
                                    {selectedStudents.length} জন নির্বাচিত
                                </span>
                            </div>
                        </div>

                        {fetchLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                                                ব্যাচ
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                রোল
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                গড় নম্বর
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
                                                const batchName = getNestedValue(student, 'batch.name');
                                                
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
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                                                            {batchName}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {student.classRoll || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                            {result.averageMarks || 'N/A'}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Download Button */}
                        {results.length > 0 && selectedStudents.length > 0 && (
                            <div className="p-4 bg-gray-50 border-t">
                                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                                    <span className="text-sm text-gray-600">
                                        {selectedStudents.length} জন শিক্ষার্থী নির্বাচিত হয়েছে
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleDownloadPDF}
                                            disabled={loading}
                                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    প্রস্তুত হচ্ছে...
                                                </div>
                                            ) : (
                                                'মার্কশিট ডাউনলোড (PDF)'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                {!selectedExam && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <p className="text-blue-800">
                            মার্কশিট ডাউনলোড করতে উপরের ড্রপডাউন থেকে একটি পরীক্ষা নির্বাচন করুন।
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marksheet;