import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaPrint, FaSearch, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';

const Result = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchData, setSearchData] = useState({
        studentId: '',
        studentName: '',
        examCategoryId: 'all'
    });
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const studentIdRef = useRef(null);
    const studentNameRef = useRef(null);

    useEffect(() => {
        fetchDropdownData();
        
        // ক্লিক আউটসাইড হ্যান্ডলার
        const handleClickOutside = (event) => {
            if (studentIdRef.current && !studentIdRef.current.contains(event.target) &&
                studentNameRef.current && !studentNameRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [categoriesRes, studentsRes] = await Promise.all([
                axiosInstance.get('/exam-categories'),
                axiosInstance.get('/students')
            ]);

            if (categoriesRes.data.success) setCategories(categoriesRes.data.data || []);
            if (studentsRes.data.success) setStudents(studentsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
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

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));

        // অন্য ফিল্ড ক্লিয়ার করবে যখন একটি ফিল্ডে টাইপ করবে
        if (name === 'studentId' && value.trim()) {
            setSearchData(prev => ({ ...prev, studentName: '' }));
            showSuggestionsFor(value, 'id');
        } else if (name === 'studentName' && value.trim()) {
            setSearchData(prev => ({ ...prev, studentId: '' }));
            showSuggestionsFor(value, 'name');
        } else {
            setShowSuggestions(false);
        }
    };

    const showSuggestionsFor = (searchTerm, type) => {
        const filtered = students.filter(student => {
            if (type === 'id') {
                return student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
            } else {
                return student.name?.toLowerCase().includes(searchTerm.toLowerCase());
            }
        }).slice(0, 5);

        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
    };

    const handleSuggestionClick = (student) => {
        setSearchData({
            studentId: student.studentId,
            studentName: student.name,
            examCategoryId: searchData.examCategoryId
        });
        setShowSuggestions(false);
    };

    const handleSearch = async () => {
        if (!searchData.studentId && !searchData.studentName) {
            showSweetAlert('warning', 'শিক্ষার্থীর আইডি বা নাম দিন');
            return;
        }

        try {
            setSearchLoading(true);
            const params = new URLSearchParams();
            
            if (searchData.studentId) params.append('studentId', searchData.studentId);
            if (searchData.studentName) params.append('studentName', searchData.studentName);
            if (searchData.examCategoryId !== 'all') params.append('examCategoryId', searchData.examCategoryId);

            const response = await axiosInstance.get(`/results?${params}`);
            
            if (response.data.success) {
                setSearchResults(response.data.data || []);
                setShowResults(true);
                
                if (response.data.data.length === 0) {
                    showSweetAlert('info', 'কোন ফলাফল পাওয়া যায়নি');
                }
            }
        } catch (error) {
            console.error('Error searching results:', error);
            showSweetAlert('error', 'ফলাফল খুঁজতে সমস্যা হয়েছে');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchData({
            studentId: '',
            studentName: '',
            examCategoryId: 'all'
        });
        setShowResults(false);
        setSearchResults([]);
        setShowSuggestions(false);
    };

    const getGradeColor = (grade) => {
        const gradeColors = {
            'A+': 'bg-green-100 text-green-800 border-green-200',
            'A': 'bg-green-50 text-green-700 border-green-100',
            'A-': 'bg-blue-50 text-blue-700 border-blue-100',
            'B': 'bg-yellow-50 text-yellow-700 border-yellow-100',
            'C': 'bg-orange-50 text-orange-700 border-orange-100',
            'D': 'bg-red-50 text-red-700 border-red-100',
            'F': 'bg-red-100 text-red-800 border-red-200'
        };
        return gradeColors[grade] || 'bg-gray-50 text-gray-700 border-gray-100';
    };

    // বাংলাদেশি গ্রেডিং সিস্টেম অনুযায়ী পাশ/ফেল চেক
    const getPassFailStatus = (averageMarks, averageLetterGrade) => {
        const failGrades = ['F'];
        const passGrades = ['A+', 'A', 'A-', 'B', 'C', 'D'];
        
        if (failGrades.includes(averageLetterGrade)) {
            return { status: 'ফেল', color: 'bg-red-100 text-red-800 border-red-200' };
        } else if (passGrades.includes(averageLetterGrade)) {
            return { status: 'পাশ', color: 'bg-blue-100 text-[#1e90c9]' };
        } else {
            return { status: 'অনির্ধারিত', color: 'bg-gray-100 text-gray-800 border-gray-200' };
        }
    };

    // প্রিন্ট মার্কশিট ফাংশন
    const printMarksheet = (result) => {
        // মার্কশিট HTML কন্টেন্ট তৈরি
        const marksheetContent = `
            <!DOCTYPE html>
            <html lang="bn">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${result.studentName} - ${result.examCategoryName} মার্কশিট</title>
                <style>
                    @import url('https://fonts.plex.cdn/google/fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Hind Siliguri', 'SolaimanLipi', 'Siyam Rupali', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background: #fff;
                        padding: 20px;
                    }
                    
                    .marksheet-container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 2px solid #1e40af;
                        border-radius: 10px;
                        padding: 30px;
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 3px double #1e40af;
                    }
                    
                    .header h1 {
                        color: #1e40af;
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                    }
                    
                    .header h2 {
                        color: #374151;
                        font-size: 20px;
                        font-weight: 600;
                    }
                    
                    .student-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 30px;
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        border: 1px solid #e5e7eb;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .info-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px dashed #e5e7eb;
                    }
                    
                    .info-label {
                        font-weight: 600;
                        color: #4b5563;
                    }
                    
                    .info-value {
                        font-weight: 500;
                        color: #1f2937;
                    }
                    
                    .summary-cards {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 15px;
                        margin-bottom: 30px;
                    }
                    
                    .summary-card {
                        background: white;
                        padding: 15px;
                        border-radius: 8px;
                        text-align: center;
                        border: 1px solid #e5e7eb;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .summary-value {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 5px;
                    }
                    
                    .summary-label {
                        font-size: 12px;
                        color: #6b7280;
                        font-weight: 500;
                    }
                    
                    .pass {
                        color: #059669;
                    }
                    
                    .fail {
                        color: #dc2626;
                    }
                    
                    .table-container {
                        margin-bottom: 30px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        background: white;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    th {
                        background: #1e40af;
                        color: white;
                        padding: 12px 15px;
                        text-align: left;
                        font-weight: 600;
                        font-size: 14px;
                    }
                    
                    td {
                        padding: 12px 15px;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    
                    tbody tr:hover {
                        background: #f8fafc;
                    }
                    
                    tfoot {
                        background: #f1f5f9;
                        font-weight: 600;
                    }
                    
                    tfoot td {
                        border-bottom: none;
                        font-size: 15px;
                    }
                    
                    .grade-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                    }
                    
                    .grade-A-plus { background: #dcfce7; color: #166534; }
                    .grade-A { background: #bbf7d0; color: #15803d; }
                    .grade-A-minus { background: #bfdbfe; color: #1e40af; }
                    .grade-B { background: #fef3c7; color: #92400e; }
                    .grade-C { background: #fed7aa; color: #c2410c; }
                    .grade-D { background: #fecaca; color: #b91c1c; }
                    .grade-F { background: #fca5a5; color: #991b1b; }
                    
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 2px solid #e5e7eb;
                        color: #6b7280;
                        font-size: 12px;
                    }
                    
                    @media print {
                        body {
                            padding: 0;
                        }
                        
                        .marksheet-container {
                            border: none;
                            box-shadow: none;
                            padding: 15px;
                        }
                        
                        .no-print {
                            display: none !important;
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .student-info,
                        .summary-cards {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="marksheet-container">
                    <div class="header">
                        <h1>🎓 মার্কশিট</h1>
                        <h2>${result.examCategoryName}</h2>
                    </div>
                    
                    <div class="student-info">
                        <div class="info-item">
                            <span class="info-label">শিক্ষার্থীর নাম:</span>
                            <span class="info-value">${result.studentName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">শিক্ষার্থী আইডি:</span>
                            <span class="info-value">${result.studentId}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">পরীক্ষার নাম:</span>
                            <span class="info-value">${result.examCategoryName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">তারিখ:</span>
                            <span class="info-value">${new Date().toLocaleDateString('bn-BD')}</span>
                        </div>
                    </div>
                    
                    <div class="summary-cards">
                        <div class="summary-card">
                            <div class="summary-value">${result.averageMarks}</div>
                            <div class="summary-label">গড় মার্কস</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-value">${result.averageLetterGrade}</div>
                            <div class="summary-label">গড় গ্রেড</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-value">${result.totalPresent}</div>
                            <div class="summary-label">উপস্থিতি</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-value ${getPassFailStatus(result.averageMarks, result.averageLetterGrade).status === 'পাশ' ? 'pass' : 'fail'}">
                                ${getPassFailStatus(result.averageMarks, result.averageLetterGrade).status}
                            </div>
                            <div class="summary-label">স্ট্যাটাস</div>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>বিষয়</th>
                                    <th>CQ মার্কস</th>
                                    <th>MCQ মার্কস</th>
                                    <th>প্র্যাকটিক্যাল মার্কস</th>
                                    <th>মোট মার্কস</th>
                                    <th>গ্রেড</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.subjectMarks?.map((subject) => {
                                    const totalMarks = calculateSubjectTotal(subject);
                                    const gradeClass = `grade-${subject.letterGrade?.replace('+', '-plus') || 'N-A'}`;
                                    return `
                                        <tr>
                                            <td>${subject.subjectName}</td>
                                            <td>${subject.cqMarks || '-'}</td>
                                            <td>${subject.mcqMarks || '-'}</td>
                                            <td>${subject.practicalMarks || '-'}</td>
                                            <td><strong>${totalMarks}</strong></td>
                                            <td>
                                                <span class="grade-badge ${gradeClass}">
                                                    ${subject.letterGrade || '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" style="text-align: right;"><strong>সর্বমোট:</strong></td>
                                    <td><strong>${calculateOverallTotal(result.subjectMarks)}</strong></td>
                                    <td>
                                        <span class="grade-badge grade-${result.averageLetterGrade?.replace('+', '-plus') || 'N-A'}">
                                            ${result.averageLetterGrade}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <div class="footer">
                        <p>জেনারেট করার তারিখ: ${new Date().toLocaleDateString('bn-BD')} | সময়: ${new Date().toLocaleTimeString('bn-BD')}</p>
                        <p class="no-print">এই মার্কশিটটি প্রিন্ট করতে Ctrl+P চাপুন</p>
                    </div>
                </div>
                
                <script>
                    // অটো প্রিন্ট যখন পেজ লোড হয়
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    };
                    
                    // প্রিন্ট শেষ হলে মেসেজ শো করবে
                    window.onafterprint = function() {
                        alert('মার্কশিট প্রিন্ট সফল হয়েছে!');
                    };
                </script>
            </body>
            </html>
        `;

        // নতুন উইন্ডো ওপেন করে মার্কশিট শো করবে
        const printWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes');
        printWindow.document.write(marksheetContent);
        printWindow.document.close();
        
        // প্রিন্ট ডায়ালগ ওপেন হবে অটোমেটিক
        setTimeout(() => {
            printWindow.focus();
        }, 1000);
    };

    const calculateSubjectTotal = (subject) => {
        const cq = subject.cqMarks || 0;
        const mcq = subject.mcqMarks || 0;
        const practical = subject.practicalMarks || 0;
        return cq + mcq + practical;
    };

    const calculateOverallTotal = (subjectMarks) => {
        return subjectMarks?.reduce((total, subject) => total + calculateSubjectTotal(subject), 0) || 0;
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
                            ফলাফল অনুসন্ধান
                        </h1>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
                <div className="max-w-full mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* শিক্ষার্থীর আইডি */}
                        <div className="relative" ref={studentIdRef}>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                শিক্ষার্থীর আইডি
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="studentId"
                                    value={searchData.studentId}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                    placeholder="শিক্ষার্থী আইডি"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>

                            {/* সাজেশন ড্রপডাউন */}
                            {showSuggestions && searchData.studentId && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {suggestions.map((student, index) => (
                                        <div
                                            key={student._id || index}
                                            onClick={() => handleSuggestionClick(student)}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                        >
                                            <div className="font-medium text-gray-800 text-sm">
                                                {student.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ID: {student.studentId}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* শিক্ষার্থীর নাম */}
                        <div className="relative" ref={studentNameRef}>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                শিক্ষার্থীর নাম
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="studentName"
                                    value={searchData.studentName}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                    placeholder="শিক্ষার্থীর নাম"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>

                            {/* সাজেশন ড্রপডাউন */}
                            {showSuggestions && searchData.studentName && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {suggestions.map((student, index) => (
                                        <div
                                            key={student._id || index}
                                            onClick={() => handleSuggestionClick(student)}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                        >
                                            <div className="font-medium text-gray-800 text-sm">
                                                {student.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ID: {student.studentId}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* পরীক্ষা */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                পরীক্ষা
                            </label>
                            <select
                                name="examCategoryId"
                                value={searchData.examCategoryId}
                                onChange={handleSearchChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                            >
                                <option value="all">সকল পরীক্ষা</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Search Buttons */}
                    <div className="flex gap-4">
                        <MainButton
                            onClick={handleSearch}
                            disabled={searchLoading}
                            className="rounded-md"
                        >
                            <FaSearch className="text-sm mr-2" />
                            {searchLoading ? 'অনুসন্ধান হচ্ছে...' : 'অনুসন্ধান'}
                        </MainButton>
                        {(searchData.studentId || searchData.studentName || showResults) && (
                            <button
                                onClick={handleClearSearch}
                                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaTimes className="text-sm" />
                                খুঁজা বাতিল করুন
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {showResults && (
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-full mx-auto">
                        {searchLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader />
                                <p className="text-gray-600 ml-3">ফলাফল লোড হচ্ছে...</p>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                                <div className="text-4xl text-gray-400 mb-3">📊</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    কোন ফলাফল পাওয়া যায়নি
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    অনুগ্রহ করে ভিন্ন তথ্য দিয়ে আবার চেষ্টা করুন
                                </p>
                            </div>
                        ) : (
                            searchResults.map((result) => {
                                const passFailStatus = getPassFailStatus(result.averageMarks, result.averageLetterGrade);
                                const overallTotal = calculateOverallTotal(result.subjectMarks);
                                
                                return (
                                    <div key={result._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
                                        {/* Result Header */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-800">
                                                        {result.studentName}
                                                    </h2>
                                                    <p className="text-gray-600 text-sm">
                                                        ID: {result.studentId} | পরীক্ষা: {result.examCategoryName}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-600">
                                                            {result.averageMarks}
                                                        </div>
                                                        <div className="text-xs text-gray-500">গড় মার্কস</div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full border ${getGradeColor(result.averageLetterGrade)}`}>
                                                        <span className="font-semibold">{result.averageLetterGrade}</span>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full  ${passFailStatus.color}`}>
                                                        <span className="font-semibold">{passFailStatus.status}</span>
                                                    </div>
                                                    <MainButton
                                                        onClick={() => printMarksheet(result)}
                                                        className='rounded-md'
                                                    >
                                                        <FaPrint className="text-sm mr-2" />
                                                        প্রিন্ট মার্কশিট
                                                    </MainButton>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subject-wise Results Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            বিষয়
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            CQ মার্কস
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            MCQ মার্কস
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            প্র্যাকটিক্যাল মার্কস
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            মোট মার্কস
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            গ্রেড
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {result.subjectMarks?.map((subject, index) => (
                                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className="font-medium text-gray-800 text-sm">
                                                                    {subject.subjectName}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-gray-600 text-sm">
                                                                    {subject.cqMarks || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-gray-600 text-sm">
                                                                    {subject.mcqMarks || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-gray-600 text-sm">
                                                                    {subject.practicalMarks || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-semibold text-blue-600 text-sm">
                                                                    {calculateSubjectTotal(subject)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(subject.letterGrade)}`}>
                                                                    {subject.letterGrade}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                {/* Summary Row */}
                                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-3 text-right font-medium text-gray-700">
                                                            সর্বমোট:
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className="font-bold text-green-600">
                                                                {overallTotal}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(result.averageLetterGrade)}`}>
                                                                {result.averageLetterGrade}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        {/* Additional Information */}
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                                <div className="text-center">
                                                    <div className="font-semibold text-gray-700">উপস্থিতি</div>
                                                    <div className="text-green-600 font-medium">{result.totalPresent} দিন</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-gray-700">অনুপস্থিতি</div>
                                                    <div className="text-red-600 font-medium">{result.totalAbsent} দিন</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-gray-700">ক্রম</div>
                                                    <div className="text-blue-600 font-medium">{result.order || 'N/A'}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-gray-700">স্ট্যাটাস</div>
                                                    <div className={`font-medium ${passFailStatus.status === 'পাশ' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {passFailStatus.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Result;