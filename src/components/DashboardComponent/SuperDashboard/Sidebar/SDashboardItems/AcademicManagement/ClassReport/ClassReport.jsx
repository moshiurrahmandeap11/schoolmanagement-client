import { useEffect, useState } from 'react';
import { FaDownload, FaFilter, FaSearch, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';

const ClassReport = () => {
    const [loading, setLoading] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({
        classId: '',
        studentId: '',
        studentName: '',
        subjectId: ''
    });
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [reportData, setReportData] = useState({});

    // Dropdown options
    const noteOptions = [
        'সময়মত এসেছে',
        'অসুস্থ ছিল',
        'বেড়াতে গেছে',
        'ক্লাসে আসেনি'
    ];

    const learnedOptions = [
        'পড়া শিখেছে',
        'আংশিক শিখেছে',
        'পড়া শিখেনি'
    ];

    const handwritingOptions = [
        'হ্যাঁ লিখেছে',
        'আংশিক লিখেছে',
        'লিখেনি'
    ];

    const materialsOptions = [
        'সব কিছু এনেছে',
        'বই আনেনী',
        'খাতা আনেনি',
        'কলম আনেনি'
    ];

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [classesRes, subjectsRes, teachersRes] = await Promise.all([
                axiosInstance.get('/classes'),
                axiosInstance.get('/subjects'),
                axiosInstance.get('/teacher-list')
            ]);

            if (classesRes.data.success) setClasses(classesRes.data.data || []);
            if (subjectsRes.data.success) setSubjects(subjectsRes.data.data || []);
            if (teachersRes.data.success) setTeachers(teachersRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filters.classId) params.append('classId', filters.classId);
            if (filters.studentId) params.append('studentId', filters.studentId);
            if (filters.studentName) params.append('studentName', filters.studentName);

            const response = await axiosInstance.get(`/students?${params}`);
            
            if (response.data.success) {
                setStudents(response.data.data || []);
                // Initialize report data for each student
                const initialReportData = {};
                response.data.data.forEach(student => {
                    initialReportData[student.studentId] = {
                        studentId: student.studentId,
                        studentName: student.name,
                        classId: student.class?._id || '',
                        className: student.class?.name || '',
                        teacherId: student.teacher?._id || '',
                        teacherName: student.teacher?.name || '',
                        subjectId: '',
                        subjectName: '',
                        note: '',
                        diaryCompleted: false,
                        parentSignature: false,
                        learnedStatus: '',
                        handwritingStatus: '',
                        materialsStatus: ''
                    };
                });
                setReportData(initialReportData);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            showSweetAlert('error', 'শিক্ষার্থী লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilter = () => {
        fetchStudents();
        setSelectedStudents(new Set());
    };

    const handleClearFilter = () => {
        setFilters({
            classId: '',
            studentId: '',
            studentName: '',
            subjectId: ''
        });
        setStudents([]);
        setSelectedStudents(new Set());
        setReportData({});
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allStudentIds = new Set(students.map(student => student.studentId));
            setSelectedStudents(allStudentIds);
        } else {
            setSelectedStudents(new Set());
        }
    };

    const handleStudentSelect = (studentId) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const handleReportDataChange = (studentId, field, value) => {
        setReportData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleGenerateReport = async () => {
        if (selectedStudents.size === 0) {
            showSweetAlert('warning', 'অনুগ্রহ করে অন্তত একজন শিক্ষার্থী নির্বাচন করুন');
            return;
        }

        // Validate that all required fields are filled
        const missingFields = [];
        Array.from(selectedStudents).forEach(studentId => {
            const report = reportData[studentId];
            if (!report.teacherId) missingFields.push(`${report.studentName} - শিক্ষক`);
            if (!report.subjectId) missingFields.push(`${report.studentName} - সিলেবাস`);
        });

        if (missingFields.length > 0) {
            showSweetAlert('warning', 'কিছু তথ্য পূরণ করা হয়নি', missingFields.join(', '));
            return;
        }

        try {
            setGeneratingReport(true);
            
            const reports = Array.from(selectedStudents).map(studentId => ({
                ...reportData[studentId],
                date: new Date().toISOString()
            }));

            console.log('Sending reports to server:', reports);

            const response = await axiosInstance.post('/class-report/bulk', { reports });

            if (response.data.success) {
                showSweetAlert('success', `${reports.length}টি রিপোর্ট সফলভাবে তৈরি হয়েছে`);
                
                // Show download options
                const result = await Swal.fire({
                    title: 'রিপোর্ট তৈরি হয়েছে!',
                    text: 'আপনি কী ফরম্যাটে ডাউনলোড করতে চান?',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Excel ডাউনলোড',
                    cancelButtonText: 'PDF ডাউনলোড',
                    showDenyButton: true,
                    denyButtonText: 'উভয় ডাউনলোড',
                    reverseButtons: true
                });

                if (result.isConfirmed) {
                    downloadExcel();
                } else if (result.isDenied) {
                    downloadExcel();
                    setTimeout(() => downloadPDF(), 1000);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    downloadPDF();
                }
            }
        } catch (error) {
            console.error('Error generating report:', error);
            console.error('Error response:', error.response);
            
            let errorMessage = 'রিপোর্ট তৈরি করতে সমস্যা হয়েছে';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'সার্ভারে সংযোগ করতে সমস্যা হচ্ছে';
            } else if (error.response?.status === 404) {
                errorMessage = 'সার্ভার এন্ডপয়েন্ট খুঁজে পাওয়া যায়নি। সার্ভার চেক করুন।';
            }
            
            showSweetAlert('error', errorMessage);
        } finally {
            setGeneratingReport(false);
        }
    };

    const downloadExcel = () => {
        const params = new URLSearchParams();
        if (filters.classId) params.append('classId', filters.classId);
        
        window.open(`${axiosInstance.defaults.baseURL}/class-report/export/excel?${params}`, '_blank');
    };

    const downloadPDF = () => {
        const params = new URLSearchParams();
        if (filters.classId) params.append('classId', filters.classId);
        
        window.open(`${axiosInstance.defaults.baseURL}/class-report/export/pdf?${params}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FaUsers className="text-blue-600" />
                        ক্লাস রিপোর্ট
                    </h1>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Class */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                ক্লাস
                            </label>
                            <select
                                name="classId"
                                value={filters.classId}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                <option value="">সকল ক্লাস</option>
                                {classes.map(classItem => (
                                    <option key={classItem._id} value={classItem._id}>
                                        {classItem.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search by ID */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                আইডি দ্বারা খুঁজুন
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="studentId"
                                    value={filters.studentId}
                                    onChange={handleFilterChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="শিক্ষার্থী আইডি"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Search by Name */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                নাম দ্বারা খুঁজুন
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="studentName"
                                    value={filters.studentName}
                                    onChange={handleFilterChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="শিক্ষার্থীর নাম"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                সিলেবাস
                            </label>
                            <select
                                name="subjectId"
                                value={filters.subjectId}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                <option value="">সকল সিলেবাস</option>
                                {subjects.map(subject => (
                                    <option key={subject._id} value={subject._id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleApplyFilter}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                        >
                            <FaFilter className="text-sm" />
                            ফিল্টার করুন
                        </button>
                        <button
                            onClick={handleClearFilter}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            ফিল্টার সরান
                        </button>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader />
                            <p className="text-gray-600 mt-2 text-sm">শিক্ষার্থী লোড হচ্ছে...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="p-8 text-center">
                            <FaUsers className="mx-auto text-4xl text-gray-400 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন শিক্ষার্থী পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm">
                                অনুগ্রহ করে ফিল্টার প্রয়োগ করুন
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    onChange={handleSelectAll}
                                                    checked={selectedStudents.size === students.length && students.length > 0}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শ্রেণি
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিক্ষক
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সিলেবাস
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নোট
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ডায়েরি পূরণ
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অভিভাবকের স্বাক্ষর
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিখেছে
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                হ্যান্ডরাইটিং
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সামগ্রী এনেছে
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students.map((student) => (
                                            <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.has(student.studentId)}
                                                        onChange={() => handleStudentSelect(student.studentId)}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {student.studentId}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-600 text-sm">
                                                        {student.class?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={reportData[student.studentId]?.teacherId || ''}
                                                        onChange={(e) => handleReportDataChange(student.studentId, 'teacherId', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="">শিক্ষক নির্বাচন</option>
                                                        {teachers.map(teacher => (
                                                            <option key={teacher._id} value={teacher._id}>
                                                                {teacher.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={reportData[student.studentId]?.subjectId || ''}
                                                        onChange={(e) => {
                                                            const subject = subjects.find(s => s._id === e.target.value);
                                                            handleReportDataChange(student.studentId, 'subjectId', e.target.value);
                                                            handleReportDataChange(student.studentId, 'subjectName', subject?.name || '');
                                                        }}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="">সিলেবাস নির্বাচন</option>
                                                        {subjects.map(subject => (
                                                            <option key={subject._id} value={subject._id}>
                                                                {subject.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={reportData[student.studentId]?.note || ''}
                                                        onChange={(e) => handleReportDataChange(student.studentId, 'note', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="">নোট নির্বাচন</option>
                                                        {noteOptions.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={reportData[student.studentId]?.diaryCompleted || false}
                                                        onChange={(e) => handleReportDataChange(student.studentId, 'diaryCompleted', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={reportData[student.studentId]?.parentSignature || false}
                                                        onChange={(e) => handleReportDataChange(student.studentId, 'parentSignature', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={reportData[student.studentId]?.learnedStatus || ''}
                                                        onChange={(e) => handleReportDataChange(student.studentId, 'learnedStatus', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="">শিখেছে নির্বাচন</option>
                                                        {learnedOptions.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={reportData[student.studentId]?.handwritingStatus || ''}
                                                        onChange={(e) => handleReportDataChange(student.studentId, 'handwritingStatus', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="">হ্যান্ডরাইটিং নির্বাচন</option>
                                                        {handwritingOptions.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={reportData[student.studentId]?.materialsStatus || ''}
                                                        onChange={(e) => handleReportDataChange(student.studentId, 'materialsStatus', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="">সামগ্রী নির্বাচন</option>
                                                        {materialsOptions.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Generate Report Button */}
                            <div className="p-6 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        নির্বাচিত: {selectedStudents.size} জন শিক্ষার্থী
                                    </div>
                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={generatingReport || selectedStudents.size === 0}
                                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaDownload className="text-sm" />
                                        {generatingReport ? 'রিপোর্ট তৈরি হচ্ছে...' : 'রিপোর্ট তৈরি করুন'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassReport;